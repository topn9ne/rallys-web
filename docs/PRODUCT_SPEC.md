# Rally's Indoor Training — Product Spec

2026-10-15 · Anthony

## Product Overview

Rally's Indoor Training is a membership-based, self-service batting cage in Hastings, Nebraska. No employees, no front desk, no staffed hours. Members book 30-minute time slots online, receive a door code via SMS, let themselves in, hit baseballs or softballs, and leave.

The booking system is the entire operational layer — it handles membership subscriptions, slot scheduling, payment processing, door code generation and delivery, digital waivers, and automated member engagement. Without it, the facility doesn't function.

This spec defines the system to be built by forking the Railside Rides codebase (an IdeaBank client build: Next.js + Prisma + Stripe + Twilio). Roughly 40% of the Railside architecture carries over; 60% is stripped or rebuilt for a fundamentally different business model — recurring memberships with automated physical access, not one-time event bookings.

The facility is a 30×50' shop bay at 203 S Woodland Ave, Bay 5. One cage running the 50' length with a removable center divider net — two ~12' lanes when split, one open training floor when not. The niche is youth baseball (8–12U) and softball (all ages), where the 50' depth serves development-focused training at pitching distances of 35–50'.

Target launch: end of November 2026. The tech stack is built in parallel with the physical facility.

## Users & Roles

| Role | Description | Auth Method |
| --- | --- | --- |
| Member | Books cage slots, manages account and bookings, signs waivers. Default booking mode: single lane. | Supabase Auth: email/password or phone OTP |
| Team | Same as Member, but default booking mode is both lanes. A team booking atomically reserves both lane slots for the time window. | Supabase Auth: email/password or phone OTP |
| Drop-in | One-time visitor. No account required — enters name, email, and phone at checkout. Gets a time-bound door code valid only during their booked slot. | Guest checkout (no auth) |
| Admin | Meghan. Full access: member management, slot configuration, booking oversight, facility settings, waiver review, engagement nudges. No staff management needed — there are no staff. | Supabase Auth: email/password with admin role flag |

Auth moves from NextAuth (Railside) to Supabase Auth. NextAuth's Google/Apple OAuth, magic link, and staff credentials provider are replaced by Supabase's native email/password and phone/OTP. The Account, Session, VerificationToken, Staff, StaffToken, and ShiftInterest tables are all eliminated. Supabase handles session management, token refresh, and password reset natively.

The Member vs Team distinction is a subscription tier, not a separate role. Both use the same auth flow and the same member dashboard. The difference is the default booking behavior and the Stripe subscription price. A member can book both lanes for a single session (charged at team rate); a team subscriber can book one lane if they want.

## Booking Model

### Slot Structure

The facility operates 6 AM – 10 PM daily. Slots are 30 minutes. Two lanes exist when the center divider net is up. Each lane is an independently bookable slot.

No buffer period between slots (unlike Railside's 1-hour cleaning buffer). Members configure their own machines and clean up after themselves — "leave it how you found it."

### Lane Logic

Every booking is either `SINGLE_LANE` or `BOTH_LANES`. The booking flow determines this based on a question presented before slot selection: "Booking for a player/family, or a full team session?"

**Single-lane booking:** Reserves one lane (Lane A or Lane B) for the 30-minute slot. The other lane remains available for a separate booking. Two families can hit simultaneously in adjacent lanes.

**Both-lanes booking:** Atomically reserves both Lane A and Lane B for the same 30-minute window in a single transaction. Used for team practices, hitting clinics, birthday parties, or anyone who wants the full open floor with the divider net pulled back. The system validates both lanes are available before presenting the time slot as bookable in team mode.

### Calendar Display

The booking calendar shows availability differently based on the selected booking type:

| Booking Type | Available | Partial | Full |
| --- | --- | --- | --- |
| Player/Family | At least one lane open | — | Both lanes booked |
| Team Session | Both lanes open | One lane open (shown as unavailable for teams) | Both lanes booked |

A team member sees only time slots where both lanes are free. A regular member sees any slot where at least one lane is open.

### Operating Hours

Default: 6:00 AM – 10:00 PM, 7 days a week. Admin can block specific dates or time ranges (holidays, maintenance, private events). Blocked slots show as unavailable on the calendar with an optional reason ("Closed for Thanksgiving").

### Booking Rules

- Active membership or drop-in payment required to book
- Members can book up to 7 days in advance (configurable)
- Drop-ins can book same-day only
- Cancellation: free up to 2 hours before slot start; no refund after (configurable)
- Maximum one active booking per member at a time (prevents hoarding; configurable)
- Team bookings count as one booking toward the limit

## Membership & Pricing

| Tier | Monthly Rate | Booking Default | Stripe Model |
| --- | --- | --- | --- |
| Member | $50 | Single lane | Recurring subscription |
| Team | $100 | Both lanes (auto-books both) | Recurring subscription |
| Drop-in | $15–$20/visit | Single lane or both (priced separately) | One-time Checkout Session |

### Tax

Batting cage sessions are taxable in Nebraska as admission to a place of recreation. Hastings combined rate: 7% (5.5% state + 1.5% city). A Nebraska sales tax permit (Form 20) is required.

Stripe Tax or a manual tax rate configuration handles the calculation. Membership subscription prices are displayed tax-inclusive. Drop-in receipts itemize the base rate and tax separately.

### Subscription Logic

Members and Teams pay via Stripe recurring subscriptions. The subscription grants booking access — it does not itself reserve any slots. A member with an active subscription can book any available slot during operating hours. If a subscription lapses (failed payment, cancellation), booking access is suspended immediately, but existing confirmed bookings are honored through their scheduled time.

Stripe handles dunning (retry failed payments), subscription lifecycle webhooks, and proration if a member upgrades from Member to Team mid-cycle.

### Drop-in Flow

Drop-ins pay per visit via a standard Stripe Checkout Session (same as Railside's one-time booking flow). No account required. Guest checkout collects name, email, and phone. The door code is time-bound to the booked slot only — it expires when the slot ends.

### Grandfathering

Former Athletic Center members who sign up at launch keep their old rate for year one with continuous membership. Year two resets to standard pricing. This is a manual Stripe coupon applied at signup — no system logic needed beyond the coupon itself.

### Future Pricing Flexibility

Pricing may adjust to $40/$60 if the space doesn't support the higher perceived value. The PricingConfig table (carried from Railside) is append-only — the latest record per tier is the active price. Changes apply to new subscriptions and renewals only.

## Access Control (Seam + Schlage Encode)

This is the system layer Railside doesn't have. Every booking ends with a door code delivered via SMS. The member punches it into the Schlage Encode keypad and walks in. This is the core experience — it mirrors the 2FA behavior people already know: do a thing, get a text, enter the code.

### Hardware

Schlage Encode Plus (Wi-Fi deadbolt, $229). Seam-compatible. Supports up to 100 active access codes. Grade 1 security. Mounted on the entry door above or replacing the existing knob. Connected to the facility's Verizon hotspot for always-on Wi-Fi.

### Seam API Integration

Seam is the abstraction layer between the booking system and the physical lock. Plan: Unit Access ($5/device/month) — unlimited API actions, one device.

Two code strategies based on member type:

Every booking — member or drop-in — generates a fresh time-bound access code. `starts_at` = slot start time minus 5 minutes (arrival buffer). `ends_at` = slot end time plus 5 minutes (departure buffer). Code expires automatically. No persistent codes — no booking, no code, no entry. This prevents unbookmarked access, code sharing, and off-hours entry. The booking system is the gatekeeper, not a suggestion.

For members, the code is generated when the booking is confirmed (no payment step — subscription covers it). For drop-ins, the code is generated after Stripe payment confirmation (via webhook). Both are delivered via Twilio SMS immediately after the code is set on the lock. Every entry ties to a specific booking, a specific time, a specific person — clean audit trail.

### API Flow

```
// Member booking confirmed (no payment — subscription covers)
seam.access_codes.create({
  device_id: LOCK_DEVICE_ID,
  name: `booking-${bookingId}`,
  code: generateUniquePin(), // 4-6 digit, unique across active codes
  starts_at: slotStart - 5min,
  ends_at: slotEnd + 5min,
  type: 'time_bound'
});

// Drop-in booking confirmed (after checkout.session.completed)
seam.access_codes.create({
  device_id: LOCK_DEVICE_ID,
  name: `booking-${bookingId}`,
  code: generateUniquePin(),
  starts_at: slotStart - 5min,
  ends_at: slotEnd + 5min,
  type: 'time_bound'
});

// Booking cancelled
seam.access_codes.delete({
  access_code_id: storedAccessCodeId
});
```

### SMS Delivery

After the Seam API confirms the code is set on the lock (access_code.set_on_device event or polling), the system sends it via Twilio. Same format for members and drop-ins — the booking type doesn't change the SMS: (`access_code.set_on_device` event or polling), the system sends the code via Twilio:

- **Booking confirmed:** "Rally's: You're booked for [date] at [time], Lane [A/B]. Door code: [CODE]. Code active 5 min before your slot. Start a Rally!"
- **New member welcome (no code):** "Welcome to Rally's! Your membership is active. Book your first slot: [link]"
- **Drop-in with waiver:** "Rally's Indoor Training: Your cage is booked for [time]. Door code: [CODE]. Sign your waiver before arriving: [link]"

### Code Management

The Schlage Encode supports 100 concurrent codes. With per-booking time-bound codes, the active count at any moment equals the number of overlapping booking windows (each with a 10-minute buffer). At peak (two lanes, 30-minute slots, 6 AM – 10 PM), that's a maximum of 2 active codes at any given time — well within limits. Codes auto-expire, so no cleanup is needed. The system tracks active code count and alerts the admin if it approaches 80% capacity.

### Failure Modes

- **Lock offline (Wi-Fi down):** Codes already programmed on the lock continue to work. New codes queue and sync when connectivity returns. Seam webhooks notify of device offline status — admin alerted via SMS.
- **Seam API failure:** Booking confirmed, code generation retried with exponential backoff. If code still not set 15 minutes before slot, admin alerted to manually share a backup code.
- **Code collision:** `generateUniquePin()` checks existing active codes before assignment. Retry with new pin on collision.

## Data Model

The Railside schema has 22 models. Rally's needs 9. Everything below is new or substantially rewritten.

### Models

**Member** (replaces Customer)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid PK | Supabase Auth user ID |
| name | string |  |
| email | string unique |  |
| phone | string | Required — SMS is the primary communication channel |
| tier | enum (MEMBER, TEAM) | Determines default booking type and subscription price |
| stripeCustomerId | string unique | Stripe Customer object ID |
| stripeSubscriptionId | string nullable | Active subscription ID; null for lapsed/cancelled |
| subscriptionStatus | enum (ACTIVE, PAST_DUE, CANCELLED, NONE) | Mirrors Stripe subscription status |
| notificationSms | boolean default true | SMS opt-in |
| createdAt | timestamp |  |
| updatedAt | timestamp |  |

**CageSlot** (replaces RideSlot)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| lane | enum (A, B) | Which physical lane this slot represents |
| date | date |  |
| startTime | timestamp |  |
| endTime | timestamp | Always startTime + 30 minutes |
| status | enum (AVAILABLE, BOOKED, BLOCKED) | No FILLING state — a lane is open or taken |
| blockReason | string nullable | "Maintenance", "Private event", "Holiday" |
| createdAt | timestamp |  |
| updatedAt | timestamp |  |

Slots are generated in bulk by the system based on operating hours config. Admin can block individual slots or date ranges. No manual slot creation needed for normal operations — the system auto-generates the daily grid.

**Booking** (simplified from Railside)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| memberId | uuid FK → Member nullable | Null for drop-in guest bookings |
| guestName | string nullable | Drop-in only |
| guestEmail | string nullable | Drop-in only |
| guestPhone | string nullable | Drop-in only |
| bookingType | enum (SINGLE_LANE, BOTH_LANES) |  |
| slotIdA | uuid FK → CageSlot | Primary lane slot |
| slotIdB | uuid FK → CageSlot nullable | Second lane slot (BOTH_LANES only) |
| status | enum (PENDING, CONFIRMED, COMPLETED, CANCELLED) |  |
| stripeSessionId | string nullable unique | For drop-in one-time payments |
| stripePaymentIntentId | string nullable |  |
| totalAmountCents | int | For drop-ins; $0 for member bookings (covered by subscription) |
| taxAmountCents | int |  |
| accessCodeId | string nullable | Seam access code ID (drop-in time-bound codes) |
| accessCodePin | string nullable | The PIN delivered via SMS |
| createdAt | timestamp |  |
| updatedAt | timestamp |  |

Gone from Railside's Booking: seats, passengerCount, pickupLocation, pickupAddress, addonsAmountCents, discountCodeId, discountAmountCents, isManual, paymentReference, riderRoster, waiverSignedOffline, bookingType enum (THEME_SEAT/GENERAL_FULL replaced by SINGLE_LANE/BOTH_LANES).

**Waiver** (carried from Railside, minor changes)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| memberId | uuid FK → Member nullable | For members — signed once, covers all sessions |
| bookingId | uuid FK → Booking nullable | For drop-ins — signed per booking |
| signerName | string |  |
| signedAt | timestamp nullable |  |
| ipAddress | string nullable |  |
| agreementTextSnapshot | text | Full waiver text at time of signing |
| isMinor | boolean default false | If true, parent/guardian signed |
| guardianName | string nullable | Parent/guardian who signed for minor |
| status | enum (PENDING, SIGNED) |  |
| createdAt | timestamp |  |

Key change from Railside: members sign the waiver once (linked to member, not booking). Drop-ins sign per booking. Minor flag tracks parent/guardian signatures.

**AccessCode** (new — tracks Seam-generated codes)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| seamAccessCodeId | string unique | Seam API access code ID |
| pin | string | The 4-6 digit code |
| bookingId | uuid FK → Booking | Every code ties to a specific booking |
| type | enum (TIME_BOUND) |  |
| startsAt | timestamp | Slot start minus 5 minutes |
| endsAt | timestamp |  |
| status | enum (SETTING, ACTIVE, EXPIRED, REVOKED) | Tracks Seam sync state |
| createdAt | timestamp |  |

**PricingConfig** (carried from Railside, simplified)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| tier | enum (MEMBER, TEAM, DROPIN_SINGLE, DROPIN_BOTH) |  |
| amountCents | int | Monthly rate for subscriptions; per-visit for drop-ins |
| taxRatePercent | float | 7.0 for Hastings |
| effectiveFrom | timestamp |  |
| createdAt | timestamp |  |

Append-only. Latest record per tier is the active price.

**OperatingHours** (new)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid PK |  |
| dayOfWeek | int (0=Sun, 6=Sat) |  |
| openTime | time | Default 06:00 |
| closeTime | time | Default 22:00 |
| isOpen | boolean default true | False = closed all day |

**WaiverTemplate** (carried from Railside)

Single-row table. Contains the current waiver text. Admin-editable.

**SiteSetting** (carried from Railside)

Key-value store for facility configuration: facility name, address, phone, booking advance window (days), cancellation deadline (hours), max active bookings per member, operating timezone.

### Eliminated Models

Bike, Theme, Staff, StaffAssignment, StaffToken, ShiftInterest, AddOn, BookingAddon, AddOnBike, InRideUpsellItem, InRideUpsellPurchase, DiscountCode, PickupLocation, Sponsor, GalleryPhoto, FaqItem, Account, Session, VerificationToken, NotificationConfig — all gone. That's 21 of Railside's 22 models eliminated or replaced.

## Booking Flow

### Member Booking (subscription active)

1. Member logs in (Supabase Auth — email/password or phone OTP)
2. "Booking for a player/family, or a full team session?" — system defaults based on tier but allows override
3. Calendar view shows available slots filtered by booking type
4. Member selects date and time slot
5. Confirmation screen: date, time, lane(s), door code reminder
6. Member confirms — booking created with status CONFIRMED (no payment at booking time; subscription covers it)
7. Confirmation SMS via Twilio: "Rally's: You're booked for [date] at [time], Lane [A/B]. Your door code: [CODE]. Start a Rally!"
8. Booking appears in member dashboard

No Stripe Checkout Session for member bookings. The subscription is the payment. The booking is a slot reservation only.

### Drop-in Booking

1. Visitor lands on booking page (no auth required)
2. "Booking for a player/family, or a full team session?"
3. Calendar shows available slots (same-day only for drop-ins)
4. Visitor selects date and time slot
5. Guest checkout: name, email, phone (required for door code delivery)
6. Stripe Checkout Session created (one-time payment at drop-in rate + tax)
7. Visitor pays via Stripe
8. Stripe webhook fires `checkout.session.completed`
9. System creates booking with status CONFIRMED
10. Seam API generates time-bound access code (starts 5 min before slot, ends 5 min after)
11. Twilio SMS delivers: "Rally's Indoor Training: Your cage is booked for [time]. Door code: [CODE]. Code active 5 min before your slot."
12. Waiver link included in confirmation email

### Cancellation

Member or drop-in can cancel via the booking confirmation page or member dashboard. If cancelled before the deadline (default: 2 hours before slot), the cage slot(s) are released back to available. For drop-ins, refund is issued via Stripe and the Seam access code is revoked. For members, no refund needed (subscription-based). The Seam time-bound code (if any) is deleted.

### Waiver Signing

Members sign once — waiver linked to member record, valid for all future bookings. New members are prompted to sign at first login or first booking. Drop-ins receive a waiver link in their confirmation email and must sign before arriving. The system flags bookings with unsigned waivers. Minors require a parent/guardian signature captured with the guardian's name.

## Stripe Integration

Rally's uses Stripe for two distinct payment flows: recurring subscriptions (memberships) and one-time payments (drop-ins). Railside only used one-time Checkout Sessions — the subscription layer is new.

### Products & Prices

Create in Stripe Dashboard (not programmatically):

| Product | Price | Interval | Notes |
| --- | --- | --- | --- |
| Rally's Member | $50.00 | Monthly | Tax-inclusive |
| Rally's Team | $100.00 | Monthly | Tax-inclusive |
| Rally's Drop-in (Single Lane) | $15.00–$20.00 | One-time | + 7% tax at checkout |
| Rally's Drop-in (Both Lanes) | TBD | One-time | + 7% tax at checkout |

### Subscription Flow (New)

1. New member registers on the site
2. System creates a Stripe Customer
3. Member selects tier (Member or Team)
4. Stripe Checkout Session in `subscription` mode redirects to Stripe-hosted payment page
5. On `checkout.session.completed` webhook: update member record with stripeCustomerId and stripeSubscriptionId
6. On `customer.subscription.created` webhook: set subscriptionStatus to ACTIVE, send welcome SMS with booking link (no code yet — codes are per-booking)
7. On `customer.subscription.updated` webhook: handle tier changes (upgrade/downgrade), update pricing
8. On `customer.subscription.deleted` webhook: set subscriptionStatus to CANCELLED, suspend booking access (active booking codes expire on their own schedule)
9. On `invoice.payment_failed` webhook: set subscriptionStatus to PAST_DUE, send SMS nudge ("Your Rally's membership payment failed — update your card to keep hitting: [link]")

### Drop-in Flow (Adapted from Railside)

1. Guest selects slot and enters details
2. Stripe Checkout Session in `payment` mode with line items (cage time + tax)
3. On `checkout.session.completed` webhook: confirm booking, generate time-bound Seam code, send SMS
4. On `checkout.session.expired` webhook: cancel pending booking, release slot
5. On `charge.refunded` webhook: update booking status

The Railside webhook handler structure carries over almost intact for the drop-in flow. The subscription webhook handlers are additive.

### Webhook Handler Structure

```
POST /api/stripe/webhook
├── checkout.session.completed
│   ├── metadata.type === 'subscription' → handleSubscriptionCheckout()
│   └── metadata.type === 'dropin' → handleDropinCheckout()
├── checkout.session.expired → handleCheckoutExpired()
├── customer.subscription.created → handleSubscriptionCreated()
├── customer.subscription.updated → handleSubscriptionUpdated()
├── customer.subscription.deleted → handleSubscriptionDeleted()
├── invoice.payment_failed → handlePaymentFailed()
└── charge.refunded → handleRefund()
```

### Tax

Create a Stripe Tax Rate for Nebraska batting cage admission (7%). Apply to drop-in Checkout Sessions via `tax_rates` on line items. Subscription prices are set tax-inclusive — no separate tax rate applied at checkout.

### Stripe Account

Separate Stripe account for Rally's Indoor Training LLC. Completely firewalled from IdeaBank/Top Nine Stripe accounts. New API keys, new webhook endpoints, new Dashboard login.

## Notifications

SMS is the primary channel — members are conditioned to expect texts (book → get code → go). Email is secondary. Twilio handles SMS; Resend handles email (carried from Railside).

### Twilio Configuration

Separate Twilio account for Rally's (entity firewall from Top Nine/IdeaBank). Dedicated phone number. All SMS sent via Twilio Messaging API.

### Notification Triggers

| Trigger | Channel | Recipient | Content |
| --- | --- | --- | --- |
| Booking confirmed (member) | SMS | Member | Date, time, lane, door code |
| Booking confirmed (drop-in) | SMS + Email | Guest | Date, time, door code, waiver link |
| Subscription created | SMS | New member | Welcome, door code, booking link |
| Subscription payment failed | SMS | Member | Card update link |
| Subscription cancelled | SMS | Former member | Code deactivated notice |
| Booking reminder (2h before) | SMS | Booker | Time, lane, door code |
| Booking cancelled | SMS | Booker | Confirmation of cancellation |
| Unsigned waiver (first booking) | Email | Member | Waiver link |
| Inactivity nudge (14 days no booking) | SMS | Member | "Haven't seen you in a while — book a slot" |
| Weather nudge (rain/cold tomorrow) | SMS | Active members | "Rain tomorrow — perfect cage day. Book a slot" |
| New member signup | SMS | Admin (Meghan) | Member name and tier |
| Daily summary | Email | Admin | Today's bookings, member count, revenue |

### Cron Jobs (Vercel Cron)

| Job | Schedule | Action |
| --- | --- | --- |
| Booking reminders | Every 15 min | Send reminders for bookings starting in 2 hours |
| Slot cleanup | Daily at midnight CT | Auto-generate next 7 days of slots based on OperatingHours; mark past slots COMPLETED |
| Inactivity nudges | Daily at 10 AM CT | Find members with no booking in 14+ days, send nudge |
| Weather nudges | Daily at 7 PM CT | Check tomorrow's weather (OpenWeather API or similar); if rain/cold, nudge active members |
| Daily admin summary | Daily at 7 AM CT | Email Meghan the day's bookings and member stats |
| Review requests | Day after visit at noon CT | "How was your session? Leave us a Google review: [link]" |

All cron schedules in UTC in vercel.json, adjusted for Central Time.

### Engagement & Retention Strategy

The per-booking code model makes every visit a data point. The system knows who booked, when, how often, which lane, what time of day. This data powers the retention engine — the facility's job is to make sure people use their membership, not to passively collect autopay and hope they don't cancel.

**Phase 1 — Launch (Twilio SMS ****+ Resend email****)**

SMS for immediacy (door codes, quick nudges), email for anything a parent needs to find later (confirmations, receipts, waiver links, schedules). This is the same dual-channel model that youth sports apps like SportsYou and Remind bundle into a single download — Rally's delivers it natively via Twilio + Resend, no app install required.

| Trigger | Channel | Timing | Message |
| --- | --- | --- | --- |
| Booking confirmed | SMS + Email | Immediate | Door code, date, time, lane. Email adds calendar-friendly details, waiver link, cancellation link. |
| Subscription receipt | Email | Immediate | Monthly payment confirmation with amount, period, billing portal link |
| Post-session follow-up | SMS | Day after visit, noon | "How was your session? Leave us a Google review: [link]" |
| Inactivity nudge | SMS | 14 days since last booking | "Haven't seen you in a while — book a slot: [link]" |
| Weather prompt | SMS | Evening before rain/cold day | "Rain tomorrow — perfect cage day. Book a slot: [link]" |
| Tournament prep | SMS | Configurable, seasonal | "Tournament season is coming. Get your reps in: [link]" |
| Milestone hit | SMS + Email | After Nth booking | SMS: quick congrats. Email: Cage Rats progress, what's next. |
| Churn risk escalation | SMS | 30 days since last booking | "We miss you at Rally's — book a slot before your membership goes to waste: [link]" |
| Re-engagement after cancel | Email | 7 days post-cancellation | "Door's always open. Rejoin anytime: [link]" (one-time, not a drip) |
| Payment failed | SMS + Email | On invoice.payment_failed | SMS: quick alert. Email: card update link, what happens if not resolved. |
| Waiver reminder | Email | First booking with unsigned waiver | Waiver link, why it matters, deadline |
| Daily admin summary | Email | 7 AM CT daily | Today's bookings, member count, flagged items (Meghan only) |

All triggers are cron-driven, querying booking data. The inactivity nudge at 14 days is the most important — it's the early warning that a member is drifting. The 30-day message is the last chance before they cancel.

**Phase 2 — Post-Launch (Brevo ****marketing campaigns****, bundled on Ruckus account)**

Designed marketing campaigns — seasonal pushes, drip sequences, branded milestone emails — that go beyond what a Resend transactional template handles. Runs through the existing Brevo account (shared with Ruckus for cost savings). Free tier covers the volume. If Brevo proves too clunky, Resend has broadcast capability and is already in the stack.

| Campaign | Channel | Trigger |
| --- | --- | --- |
| Welcome drip (3-part) | Email | New member signup: day 1 welcome, day 3 tips, day 7 booking prompt |
| Cage Rats milestones | Email | 10hrs → shirt, 25hrs → wall, 50hrs → hoodie, 100hrs → Diamond Club |
| Seasonal push | Email | October (winter season opening), March (spring ball prep) |
| Birthday/anniversary | Email | Member birthday or membership anniversary |
| Referral prompt | Email | After member's 5th visit |

**Data Signals for Retention**

The booking table provides all the signals. No separate analytics tool needed at launch.

| Signal | Query | Action |
| --- | --- | --- |
| Healthy member | Booked in last 7 days | No action |
| Cooling off | No booking in 8–14 days | Inactivity nudge SMS |
| At risk | No booking in 15–30 days | Escalation SMS |
| Likely churn | No booking in 30+ days | Final re-engagement SMS + admin alert |
| Cancelled | Subscription ended | One-time re-engagement SMS at day 7 |
| Power user | 3+ bookings/week | Candidate for testimonial, referral prompt, Cage Rats recognition |
| Off-peak opportunity | Members who always book evenings | "Try a morning slot — the cage is empty before 9 AM" |

## Digital Waiver

Built natively into the booking system — same approach as Railside, no third-party e-signature service. The waiver text is attorney-reviewed and specific to batting cage use (not the Railside pedal bike waiver).

### Member Waiver

Members sign once at registration or first booking. The signed waiver is linked to the Member record and covers all future sessions. If the waiver text is updated (admin edits WaiverTemplate), existing members are prompted to re-sign at next login.

### Drop-in Waiver

Drop-ins receive a waiver link in their booking confirmation email. One waiver per booking. Must be signed before arrival. The system flags bookings with unsigned waivers in the admin dashboard.

### Minor Participants

A parent or legal guardian must sign the waiver for any participant under 18. The waiver form captures the guardian's name alongside the minor's name. Coach signatures do not satisfy the parental consent requirement — this is a legal requirement, not a convenience shortcut.

### Waiver Record

Each signed waiver stores: signer name, guardian name (if minor), timestamp, IP address, and a snapshot of the full waiver text at time of signing. The text snapshot ensures the record is self-contained even if the waiver template is later updated.

### Waiver Page

Mobile-friendly web page at `/waiver/[bookingId]` (drop-in) or `/waiver/member` (member). Full waiver text displayed as read-only. Signer types full name, checks acknowledgment checkbox, submits. No wet signature or drawing pad — typed name is the digital signature, same as Railside.

## Admin Dashboard

Meghan's interface. Mobile-first — she manages from her phone, not a desktop. Railside's admin structure (sidebar nav, CRUD pages per entity) carries over as the skeleton, stripped to the relevant sections.

### Dashboard Home (`/admin`)

Today's bookings (timeline view), active member count, monthly revenue (from Stripe), recent signups, flagged items (unsigned waivers, payment failures).

### Members (`/admin/members`)

List all members with search/filter by name, email, tier, status. View member detail: subscription status, booking history, waiver status, access code, join date. Manually add a member (for phone/in-person signups). Manually adjust tier or cancel subscription. View and manage grandfathered pricing.

### Bookings (`/admin/bookings`)

List all bookings with filters: date range, member name, booking type, status. View booking detail: member info, slot(s), access code, waiver status. Cancel bookings and issue refunds (via Stripe Dashboard link). Manual booking creation for walk-up or phone-in drop-ins.

### Schedule (`/admin/schedule`)

Weekly calendar view showing all slots across both lanes. Block individual slots or date ranges with a reason. View booking density by day/time to identify peak and off-peak patterns. Modify operating hours per day of week.

### Facility (`/admin/facility`)

Waiver template editor. Operating hours configuration. Pricing management (view and update tier pricing; append-only — changes apply to new subscriptions/renewals). Site settings (facility name, address, phone, booking rules).

### Reports (`/admin/reports`)

Monthly revenue summary (pulled from Stripe). Member growth (signups, cancellations, net). Booking utilization by day/time/lane. Member activity (visits per member, inactive members). Drop-in conversion rate (drop-ins who later became members).

### Eliminated Admin Sections

From Railside: fleet, themes, staff, addons, upsells, locations, discounts, sponsors, gallery, website/CMS — all gone.

## Tech Stack & Deployment

| Layer | Tool | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | SSR for booking pages, API routes for webhooks and crons |
| Database | PostgreSQL via Supabase | Managed hosting, includes auth helpers |
| ORM | Prisma 7 | Type-safe schema + migrations |
| Auth | Supabase Auth | Email/password + phone OTP; replaces NextAuth |
| Payments | Stripe | Subscriptions (memberships) + Checkout Sessions (drop-ins) |
| SMS | Twilio | Door codes, booking confirmations, engagement nudges |
| Email | Resend | Transactional confirmation, reminders, waiver links |
| Access Control | Seam API | Smart lock integration — PIN code generation and management |
| Hosting | Vercel | Frontend + API routes + cron jobs |
| Lock Hardware | Schlage Encode Plus | Wi-Fi keypad deadbolt, Seam-compatible |
| Connectivity | Verizon hotspot | Facility internet for lock, cameras, booking system |
| Icons | Phosphor Icons | Carried from Railside |
| Styling | Tailwind CSS 4 | Carried from Railside |

### Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL

# Stripe
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY (NEXT_PUBLIC_)
STRIPE_WEBHOOK_SECRET
STRIPE_TAX_RATE_ID
STRIPE_MEMBER_PRICE_ID
STRIPE_TEAM_PRICE_ID

# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM

# Seam
SEAM_API_KEY
SEAM_DEVICE_ID

# Resend
RESEND_API_KEY

# App
NEXT_PUBLIC_APP_URL
CRON_SECRET
```

### Domain Configuration

- `rallysindoor.com` → Vercel (primary domain, A/CNAME records)
- `startmyrally.com` → redirect to rallysindoor.com/book (marketing/ad landing)
- `rallysindoortraining.com` → redirect to rallysindoor.com (LLC-match backup)

### Deployment

Single-tenant. One instance, one database, one brand. Vercel auto-deploys from the main branch of the Rally's GitHub repo. Environments: production (live keys, real SMS), staging (test keys, Twilio sandbox), development (local).

## Fork Plan

The Rally's codebase is forked from Railside Rides (railside-rides-main). Below is every directory and key file with its disposition: carry (use as-is or with minor branding changes), rewrite (same pattern, new logic), or new (built from scratch).

### Prisma

| File | Action | Notes |
| --- | --- | --- |
| schema.prisma | Rewrite | 22 models → 9. New: Member, CageSlot, AccessCode, OperatingHours. Simplified: Booking, Waiver. Carried: PricingConfig, WaiverTemplate, SiteSetting. All others deleted. |
| migrations/ | Delete | Fresh migration from new schema |
| seed.ts | Rewrite | Seed operating hours, default pricing, admin member, sample slots |

### src/lib/

| File | Action | Notes |
| --- | --- | --- |
| auth.ts | Rewrite | NextAuth → Supabase Auth. Delete Google/Apple/Credentials providers. New: Supabase client init + auth helpers. |
| authGuard.ts | Rewrite | Check Supabase session + member role instead of NextAuth session + staff role |
| stripe.ts | Carry | Stripe client singleton — no changes needed |
| twilio.ts | Carry | Twilio client singleton — no changes |
| resend.ts | Carry | Resend client singleton — no changes |
| prisma.ts | Carry | Prisma client singleton — no changes |
| utils.ts | Rewrite | Remove calcDiscount, Railside-specific formatters. Add: generateUniquePin(), slot time helpers. |
| rateLimit.ts | Carry | Rate limiter — no changes |
| seam.ts | New | Seam API client singleton, access code CRUD helpers |
| notificationDefinitions.ts | Rewrite | New trigger definitions for Rally's notifications |
| shiftToken.ts | Delete | Staff shift management — not needed |

### src/server/actions/

| File | Action | Notes |
| --- | --- | --- |
| booking.ts | Rewrite | Core booking logic: lane selection, slot reservation, Seam code generation. Drop: seats, pickup, addons, discount. Add: lane atomicity, member vs drop-in branching. |
| customer.ts → member.ts | Rewrite | Member CRUD, tier management, subscription status sync |
| slots.ts | Rewrite | CageSlot management: auto-generation from OperatingHours, blocking, cleanup |
| waiver.ts | Carry | Minor changes: member vs booking linkage, minor/guardian fields |
| waiverTemplate.ts | Carry | No changes |
| pricing.ts | Carry | Minor: rename ride types to tiers |
| auth.ts | Rewrite | Supabase Auth actions replace NextAuth sign-in/sign-out |
| bikes.ts | Delete |  |
| themes.ts | Delete |  |
| staff.ts | Delete |  |
| addons.ts | Delete |  |
| discounts.ts | Delete |  |
| locations.ts | Delete |  |
| faq.ts | Delete |  |
| gallery.ts | Delete |  |
| sponsors.ts | Delete |  |
| manualBookings.ts | Rewrite | Simplified for admin manual booking (drop-in walk-ups) |
| shopCheckout.ts | Delete | In-ride upsell — not applicable |
| notifications.ts | Rewrite | New trigger config for Rally's |

### src/server/services/

| File | Action | Notes |
| --- | --- | --- |
| notifications.ts | Rewrite | Strip Railside ride/theme/bike/staff references. Add: door code delivery, subscription lifecycle messages, engagement nudges. Keep: email/SMS dispatch pattern, cron-driven batch send pattern. |
| emails/ | Rewrite | New email templates: Rally's branding, booking confirmation, welcome, waiver link, payment failed, daily summary |

### src/app/ (pages)

| Route | Action | Notes |
| --- | --- | --- |
| (booking)/book/ | Rewrite | Calendar + slot selection + lane choice. Drop: theme/general split, seats, pickup, addons. |
| (booking)/waiver/ | Carry | Minor: new waiver text, minor/guardian fields |
| account/ | Rewrite | Member dashboard: upcoming bookings, door code display, subscription management, waiver status |
| account/signin/ | Rewrite | Supabase Auth UI instead of NextAuth |
| admin/ | Rewrite | Strip to: dashboard home, members, bookings, schedule, facility, reports |
| admin/addons, fleet, themes, staff, upsells, locations, discounts, website/ | Delete |  |
| api/stripe/webhook/ | Rewrite | Add subscription handlers, Seam integration calls |
| api/cron/ | Rewrite | New cron jobs: slot generation, inactivity nudges, weather nudges. Carry pattern: reminders, review requests. Delete: shift-reminders, slot-status (replaced). |
| api/auth/ | Rewrite | Supabase Auth callback handler |
| auth/ | Rewrite | Supabase Auth pages |
| operator/ | Delete | No operators |
| shop/ | Delete | No upsell shop |
| staff/ | Delete |  |
| custom/ | Delete | Custom booking page — not applicable |
| opt-in/ | Carry | SMS opt-in page |
| sms/ | Carry | SMS preferences page |
| privacy/ | Rewrite | Rally's privacy policy |
| terms/ | Rewrite | Rally's terms of service |
| faqs/ | Delete | FAQ page (can add later) |
| page.tsx (landing) | Rewrite | Rally's landing page: hero, how it works, pricing, CTA |
| layout.tsx | Rewrite | Rally's branding, fonts (Taldose), colors, meta tags |

### src/components/

| Directory | Action | Notes |
| --- | --- | --- |
| booking/BookingCalendar.tsx | Rewrite | Lane-based availability instead of seat-based. Booking type toggle. Rally's colors. |
| booking/SlotBookingForm.tsx | Rewrite | Strip seats/pickup/addons/discount. Add lane selection, member vs drop-in flow. |
| booking/WaiverForm.tsx | Carry | Minor updates |
| booking/ExperienceHero.tsx | Rewrite | Rally's branding |
| booking/CancelBookingButton.tsx | Carry |  |
| admin/ (all 50+ components) | Rewrite | Strip to relevant sections. Keep: AdminSidebar skeleton, BookingsTable pattern, ScheduleView pattern, form/toggle/delete patterns. |
| landing/ | Rewrite | Rally's landing page sections |
| ui/ | Carry | Button, Card, Input, Select, Badge, ConfirmModal — all reusable |
| auth/ | Rewrite | Supabase Auth components |
| operator/ | Delete |  |

### Config Files

| File | Action | Notes |
| --- | --- | --- |
| package.json | Rewrite | Remove: next-auth, @auth/prisma-adapter, nodemailer, qrcode, bcryptjs. Add: @supabase/ssr, seamapi. |
| vercel.json | Rewrite | New cron schedules for Rally's |
| next.config.ts | Carry | Minor env changes |
| tsconfig.json | Carry |  |
| postcss.config.mjs | Carry |  |
| eslint.config.mjs | Carry |  |

## Launch Checklist

Priority order — each block unlocks the next.

### Accounts & Infrastructure (Week 1)

- Create Rally's Stripe account (separate from IdeaBank/Top Nine)
- Create Rally's Twilio account + purchase phone number
- Create Supabase project (Rally's Indoor Training)
- Create Seam account + High Traffic plan
- Set up GitHub repo (private, IdeaBank org)
- Configure Vercel project, connect repo, set up rallysindoor.com domain
- Set up Resend account with Rally's sending domain

### Database & Auth (Week 2)

- Write new Prisma schema (9 models)
- Run initial migration on Supabase
- Implement Supabase Auth (email/password + phone OTP)
- Seed: operating hours, default pricing, admin account (Meghan), site settings
- Auth guard middleware for member and admin routes

### Core Booking (Weeks 2–3)

- Slot auto-generation from OperatingHours
- Booking calendar component (lane-based availability)
- Booking type selector (player/family vs team session)
- Member booking flow (no payment — subscription covers)
- Drop-in booking flow (Stripe Checkout Session)
- Stripe webhook handler: checkout.session.completed, expired
- Booking confirmation page
- Booking cancellation flow

### Seam Integration (Week 3)

- Seam client library and helpers
- Persistent code generation on subscription created
- Time-bound code generation on drop-in booking confirmed
- Code revocation on subscription cancelled
- Code delivery via Twilio SMS
- Failure handling: retry, admin alert, device offline

### Stripe Subscriptions (Week 3)

- Create Stripe Products and Prices (Member, Team)
- Subscription checkout flow (registration → tier selection → Stripe)
- Subscription webhook handlers: created, updated, deleted, payment_failed
- Member dashboard: subscription status, billing portal link
- Grandfathering coupon for Athletic Center members

### Notifications (Week 4)

- Booking confirmation SMS + email (member and drop-in)
- Welcome SMS with door code (new members)
- Booking reminder SMS (2 hours before)
- Payment failed SMS
- Admin daily summary email
- Cron jobs: reminders, slot cleanup, daily summary

### Waiver (Week 4)

- Waiver template with Rally's-specific text (get attorney review)
- Member waiver signing page
- Drop-in waiver signing page
- Minor/guardian waiver fields
- Unsigned waiver flagging in admin

### Admin Dashboard (Weeks 4–5)

- Dashboard home: today's bookings, member count, flagged items
- Members list + detail view
- Bookings list + detail view
- Schedule view with slot blocking
- Facility settings (hours, pricing, waiver)
- Reports: revenue, utilization, member growth

### Landing Page & Public Site (Week 5)

- Landing page: hero, how it works, pricing, CTA
- Rally's branding: Taldose font, brand colors, Rally cat graphic
- Privacy policy
- Terms of service
- SMS opt-in page

### Pre-Launch Testing (Week 6)

- End-to-end test: register → subscribe → book → get code → cancel
- End-to-end test: drop-in → pay → get code → waiver → done
- Stripe webhook testing (Stripe CLI)
- Seam integration test with physical Schlage Encode on-site
- SMS delivery test on all notification triggers
- Mobile responsiveness audit (booking flow + admin)
- Load test: 50 concurrent booking attempts

### Go Live

- DNS cutover: rallysindoor.com → Vercel production
- Stripe live mode enabled
- Twilio production number active
- Seam connected to physical lock
- Meghan admin account created and tested
- First member signup 🎉
