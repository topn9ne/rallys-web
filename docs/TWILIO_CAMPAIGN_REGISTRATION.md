# Twilio A2P 10DLC Campaign Registration — Rally's Indoor Training

Paste-ready answers for the Twilio campaign registration form.
Last updated: 2026-10-29

---

## Brand Registration

| Field | Value |
|-------|-------|
| Legal business name | Rally's Indoor Training LLC |
| DBA / brand name | Rally's Indoor Training |
| Business type | LLC |
| EIN | *(your EIN)* |
| Country | United States |
| State | Nebraska |
| City | Hastings |
| Address | 203 S Woodland Ave, Bay 5, Hastings, NE 68901 |
| Website | https://rallysindoor.com |
| Vertical / Industry | Recreation / Sports |
| Company size | 1-10 |

---

## Campaign Use Case Registration

### Campaign description

> Rally's Indoor Training is a self-service batting cage facility in Hastings, NE. Customers book cage sessions online. We send transactional SMS messages including booking confirmations with time-limited door access codes, session reminders, and account notifications (payment failures, membership updates, waiver reminders). Every message is triggered by a customer action or an upcoming booking — we do not send marketing or promotional messages through this campaign.

### Use case type

**Low-Volume Mixed** (or **Transactional** if available)

### Message flow / How do end users opt in?

> End users opt in during account creation on our website (https://rallysindoor.com/auth/signin). After entering their name, email, and phone number, they are presented with an unchecked checkbox that reads: "I agree to receive SMS booking confirmations, door codes, and reminders from Rally's Indoor Training. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help." Users must check this box to consent. Opt-in is also collected during the booking flow for guest (non-member) customers via the same checkbox language. Full opt-in documentation is published at https://rallysindoor.com/opt-in.

### Opt-in keywords

> JOIN, START, YES, SUBSCRIBE

### Opt-out keywords

> STOP, CANCEL, END, QUIT, UNSUBSCRIBE

### Help keywords

> HELP, INFO

### Opt-out message (auto-reply to STOP)

> You've been unsubscribed from Rally's Indoor Training messages. No more messages will be sent. Reply START to re-subscribe or contact admin@rallysindoor.com.

### Help message (auto-reply to HELP)

> Rally's Indoor Training: For help, visit rallysindoor.com/sms or email admin@rallysindoor.com. Reply STOP to unsubscribe. Msg & data rates may apply.

### Message frequency

> Varies by booking activity. Most customers receive 2-4 messages per booking (confirmation + door code, reminder, and optional cancellation). Members may also receive occasional account notifications such as payment failure alerts or waiver reminders. Typical volume: 2-10 messages per month per customer.

---

## Sample Messages (paste all 5)

### 1. Booking confirmation + door code
> Rally's: You're booked for Sat, Nov 14 at 5:00 PM, Lane A. Door code: 4821. Code active 5 min before your slot. Start a Rally!

### 2. Session reminder
> Rally's reminder: Your cage session is at 5:00 PM today. Door code: 4821. See you soon!

### 3. Booking cancellation
> Rally's: Your booking for Sat, Nov 14 at 5:00 PM has been cancelled. If you were charged, your refund is being processed.

### 4. Payment failed
> Rally's: Your membership payment failed. Update your payment method to keep booking: https://rallysindoor.com/account/membership

### 5. Welcome / new member
> Welcome to Rally's! Your membership is active. Book your first session: https://rallysindoor.com/book

---

## Required URLs (enter during registration)

| Field | URL |
|-------|-----|
| Privacy Policy | https://rallysindoor.com/privacy |
| Terms of Service | https://rallysindoor.com/terms |
| SMS Program details | https://rallysindoor.com/sms |
| Opt-in documentation | https://rallysindoor.com/opt-in |

---

## Common rejection reasons and how we address them

| Rejection reason | Our answer |
|------------------|-----------|
| "Opt-in process not clear" | Unchecked checkbox at signup + booking, exact language documented at /opt-in |
| "Sample messages don't match use case" | All samples are real templates from our codebase, all transactional |
| "Website doesn't mention SMS" | /sms page describes full program, /privacy mentions Twilio + SMS |
| "No STOP/HELP in opt-in" | Checkbox text includes "Reply STOP to cancel, HELP for help" |
| "Marketing messages detected" | We send zero marketing — all messages are booking-triggered or account alerts |
