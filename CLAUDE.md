<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Rally's Indoor Training — Booking System

## What This Is

A self-service batting cage booking system forked from Railside Rides (an IdeaBank client build). Members book 30-minute cage slots online, get a door code via SMS, let themselves in, hit baseballs, and leave. No employees, no front desk.

**Read `docs/PRODUCT_SPEC.md` before writing any code.** It is the source of truth for every architecture, data model, and flow decision.

## Workflow

**CPD** = Commit → Push → Deploy. When Anthony says "CPD", run `git add`, `git commit`, `git push`, then confirm the Vercel deployment.

## Critical Context

### This is a fork, not greenfield

The codebase started as Railside Rides. ~60% is being stripped or rewritten. The fork plan in `docs/PRODUCT_SPEC.md` (section: Fork Plan) maps every file: carry, rewrite, delete, or new. Follow it.

### Key architecture decisions (non-negotiable)

- **Auth:** Supabase Auth (email/password + phone OTP). NOT NextAuth. Railside's NextAuth, OAuth providers, staff credentials, Account/Session/VerificationToken tables are all eliminated.
- **Database:** PostgreSQL via Supabase, Prisma 7 ORM. 9 models total (down from Railside's 22). See Data Model section of spec.
- **Payments:** Stripe — recurring subscriptions (memberships) AND one-time Checkout Sessions (drop-ins). Railside only had one-time. The subscription layer is new.
- **Access control:** Seam API → Schlage Encode smart lock. Per-booking time-bound PIN codes delivered via Twilio SMS. No persistent codes. Every booking generates a fresh code.
- **Notifications:** Twilio (SMS) + Resend (email). Dual-channel from launch. SMS for immediacy, email for searchable records.
- **No staff management.** No fleet. No themes. No add-ons. No upsells. No pickup locations. No discount codes. No sponsors. No gallery.

### Booking model

Two lanes (A, B) with a removable center divider. Every booking is `SINGLE_LANE` or `BOTH_LANES`. The booking flow asks "player/family or team session?" before showing the calendar. Team bookings atomically reserve both lanes. Member tier (MEMBER vs TEAM) sets the default but allows override.

### Per-booking access codes

Every booking — member or drop-in — generates a fresh time-bound Seam access code. `starts_at` = slot start - 5 min. `ends_at` = slot end + 5 min. No persistent member codes. No booking = no code = no entry. The booking system is the gatekeeper.

### Entity firewall

Rally's Indoor Training LLC is completely separate from IdeaBank, Top Nine, and Ruckus. Separate Stripe account, separate Twilio account, separate everything. IdeaBank is never mentioned in facility-facing materials.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 |
| Auth | Supabase Auth |
| Payments | Stripe |
| SMS | Twilio |
| Email | Resend |
| Access Control | Seam API |
| Hosting | Vercel |
| Styling | Tailwind CSS 4 |
| Icons | Phosphor Icons |

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL

# Stripe
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
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

## Data Models (9 total)

Member, CageSlot, Booking, Waiver, AccessCode, PricingConfig, OperatingHours, WaiverTemplate, SiteSetting

Full schemas with fields, types, and relationships in `docs/PRODUCT_SPEC.md`.

## File Structure Conventions

- Server actions: `src/server/actions/`
- Services: `src/server/services/`
- Lib (client singletons): `src/lib/`
- Pages: `src/app/` (Next.js App Router)
- Components: `src/components/`
- Admin components: `src/components/admin/`
- Booking components: `src/components/booking/`
- UI primitives: `src/components/ui/`

## Build Sequence

Follow the Launch Checklist in `docs/PRODUCT_SPEC.md`. The order matters — each block unlocks the next:

1. Prisma schema → migration → seed (operating hours, pricing, admin account)
2. Supabase Auth (replace NextAuth entirely)
3. Core booking flow (calendar → slot selection → lane logic → confirmation)
4. Stripe subscriptions + drop-in checkout
5. Seam integration (per-booking code generation → Twilio delivery)
6. Notifications (SMS + email for all triggers)
7. Waiver system
8. Admin dashboard
9. Landing page + branding
10. Testing + go-live

## Don'ts

- Don't add NextAuth back. It's gone.
- Don't create persistent access codes. All codes are per-booking, time-bound.
- Don't add staff/employee management. There are no staff.
- Don't reference IdeaBank in any user-facing code, copy, or metadata.
- Don't build features not in the spec without confirming with Anthony first.
- Don't use `src/lib/shiftToken.ts` — it's Railside-specific and should be deleted.
