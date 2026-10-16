import { Nav } from "@/components/landing/Nav";
import { FooterCta } from "@/components/landing/FooterCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS Messaging Program — Railside Rides",
  description: "Railside Rides SMS messaging program disclosure: opt-in, opt-out, message frequency, and contact information.",
};

export default function SmsPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "var(--color-landing-bg)", color: "var(--color-landing-fg)" }}
    >
      <Nav />

      <section className="px-6 py-16 md:px-14 max-w-3xl">
        <p
          className="mb-4 font-display text-xs uppercase tracking-[3px]"
          style={{ color: "var(--color-landing-primary)" }}
        >
          Compliance
        </p>
        <h1 className="mb-4 font-display text-5xl tracking-[-1px]">SMS MESSAGING PROGRAM</h1>
        <p className="mb-10 text-sm" style={{ opacity: 0.6 }}>
          Railside Rides · 2824 Goldenrod Drive, Grand Island, NE 68801 · 308-850-4752 · hello@railsiderides.com
        </p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ opacity: 0.85 }}>

          {/* Program summary box */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-1 text-xs" style={{ opacity: 1 }}>
            <p><strong>Program name:</strong> Railside Rides Booking Alerts</p>
            <p><strong>Message types:</strong> Booking confirmations, ride reminders, waiver alerts, post-ride review request</p>
            <p><strong>Message frequency:</strong> Up to 4 messages per booking</p>
            <p><strong>Msg &amp; data rates may apply</strong></p>
            <p><strong>To stop:</strong> Reply STOP to any message</p>
            <p><strong>For help:</strong> Reply HELP or contact us at 308-850-4752</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>How Customers Opt In</h2>
            <p>Consent is collected during the online booking process at <strong>railsiderides.com</strong>. After entering their name, email, and phone number, customers are presented with an unchecked checkbox that reads:</p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5">
              <label className="flex items-start gap-3 cursor-default select-none">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/30 bg-white/10" aria-hidden="true" />
                <span className="text-sm" style={{ opacity: 0.9 }}>
                  Send me text message reminders about my booking. Msg &amp; data rates may apply.{" "}
                  <a href="/privacy" className="underline" style={{ color: "var(--color-landing-primary)" }}>Privacy policy</a>{" "}
                  &amp; <a href="/terms" className="underline" style={{ color: "var(--color-landing-primary)" }}>Terms</a>.
                </span>
              </label>
              <p className="mt-3 text-xs" style={{ opacity: 0.5 }}>
                Checkbox is unchecked by default. Checking this box constitutes explicit opt-in consent.
                Opting in is not required to complete a booking or purchase.
              </p>
            </div>
            <p className="mt-4">By checking the box and submitting the form, the customer explicitly consents to receive SMS messages from Railside Rides. No mobile phone numbers or opt-in data are shared with third parties for marketing purposes.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Opt-Out Instructions</h2>
            <p>Reply <strong>STOP</strong> to any message at any time to unsubscribe immediately. You will receive one confirmation and no further messages will be sent. Opting out does not affect your booking or reservation.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Help &amp; Support</h2>
            <p>Reply <strong>HELP</strong> to any message, or contact us directly:</p>
            <ul className="mt-2 space-y-1 list-none">
              <li>📞 <a href="tel:3088504752" className="underline">308-850-4752</a></li>
              <li>✉️ <a href="mailto:hello@railsiderides.com" className="underline">hello@railsiderides.com</a></li>
              <li>📍 2824 Goldenrod Drive, Grand Island, NE 68801</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Privacy &amp; Data Use</h2>
            <p>Railside Rides does not sell, share, or transfer mobile phone numbers or opt-in data to third parties for marketing purposes. Phone numbers are used solely to send booking-related messages to customers who have explicitly opted in. For full details see our <a href="/privacy" className="underline">Privacy Policy</a> and <a href="/terms" className="underline">Terms &amp; Conditions</a>.</p>
          </div>

          <p className="text-xs" style={{ opacity: 0.5 }}>Last updated: May 2025</p>
        </div>
      </section>

      <FooterCta />
    </div>
  );
}
