# Railside Rides — Launch Checklist

## Pending / Blocked
- [ ] **Twilio** — Client needs to confirm phone number for A2P 10DLC registration before SMS can go live
- [ ] **Domain** — Transfer `railsiderides.com` away from Wix; domain is locked until 4/3 — initiate transfer after that date, then update DNS to point to Vercel
- [ ] **Stripe** — Client needs to grant IdeaBank access to their Stripe account (Dashboard → Settings → Team)

## Domain & Hosting
- [ ] Add custom domain `railsiderides.com` in Vercel → Project → Settings → Domains
- [ ] Follow Vercel's DNS instructions (add A/CNAME records at registrar)
- [ ] Confirm SSL certificate is issued (Vercel handles this automatically)

## Environment Variables (update in Vercel when going live)
- [ ] `NEXTAUTH_URL` → `https://railsiderides.com`
- [ ] `NEXT_PUBLIC_APP_URL` → `https://railsiderides.com`

## Google OAuth
- [ ] Add authorized redirect URI: `https://railsiderides.com/api/auth/callback/google`
- [ ] Add authorized JavaScript origin: `https://railsiderides.com`
- [ ] (The `railside-rides.vercel.app` entries can stay — they won't cause issues)

## Stripe
- [ ] Switch from test mode keys to live mode keys in Vercel env vars
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Create a new webhook endpoint in Stripe Dashboard pointing to `https://railsiderides.com/api/stripe/webhook`
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel with the new signing secret
- [ ] Run a live test transaction end-to-end

## Database
- [ ] Confirm `DATABASE_URL` is set in Vercel (Supabase direct connection string)
- [ ] Run migrations against production: `DATABASE_URL="..." npm run db:migrate`
- [ ] Run seed against production: `DATABASE_URL="..." npm run db:seed`
- [ ] Verify at least one bike, pricing config, and pickup location exist

## Email (Resend)
- [ ] Verify sending domain (`railsiderides.com`) in Resend Dashboard
- [ ] Update `EMAIL_FROM` in Vercel to use the verified domain (e.g. `noreply@railsiderides.com`)
- [ ] Send a test booking confirmation email

## SMS (Twilio)
- [ ] Client completes A2P 10DLC registration (required for US SMS)
- [ ] Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` to Vercel
- [ ] Send a test SMS

## Auth
- [ ] Confirm `AUTH_SECRET` is set in Vercel
- [ ] Test Google login on production URL
- [ ] Test staff credentials login on production URL
- [ ] Confirm `/admin` and `/operator` routes redirect unauthenticated users

## Admin Setup (before first booking)
- [ ] Log in as admin and create at least one ride slot
- [ ] Create at least one staff/operator account
- [ ] Verify pricing config matches intended rates
- [ ] Verify pickup locations are correct

## Final Smoke Test
- [ ] Customer books a ride end-to-end (Stripe live mode, real card)
- [ ] Confirmation email and SMS received
- [ ] Customer signs waiver
- [ ] Operator logs in, sees the booking, checks bike out and in
- [ ] Admin views the booking in the dashboard
