import { Nav } from "@/components/landing/Nav";
import { FooterCta } from "@/components/landing/FooterCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Railside Rides",
  description: "Privacy policy for Railside Rides, including how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
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
          Legal
        </p>
        <h1 className="mb-10 font-display text-5xl tracking-[-1px]">PRIVACY POLICY</h1>

        <div className="space-y-8 text-sm leading-relaxed" style={{ opacity: 0.85 }}>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Overview</h2>
            <p>Railside Rides ("we", "us", "our") operates railsiderides.com. This policy explains what information we collect, how we use it, and your rights regarding that information. By using our site or booking a ride, you agree to the practices described here.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Information We Collect</h2>
            <p>When you book a ride, we collect your name, email address, and optionally your phone number. We also collect payment information, which is processed securely by Stripe — we never store your card details. If you sign a digital waiver, that record is stored in association with your booking.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>How We Use Your Information</h2>
            <p>We use your information to process bookings, send booking confirmations, deliver ride reminders, and operate our service. We do not sell or share your personal information with third parties for marketing purposes.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>SMS Messaging</h2>
            <p>If you provide your phone number and opt in during the booking process, Railside Rides may send you SMS messages related to your booking — including booking confirmations, ride reminders, and waiver alerts. After your ride, we may send a single follow-up message requesting a review.</p>
            <p className="mt-3">Message frequency varies based on your bookings. Standard message and data rates may apply.</p>
            <p className="mt-3">To opt out of SMS messages at any time, reply <strong>STOP</strong> to any message. For help, reply <strong>HELP</strong> or contact us at <a href="mailto:hello@railsiderides.com" className="underline">hello@railsiderides.com</a> or 308-850-4752. Opting out of SMS will not affect your ability to book rides.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Cookies</h2>
            <p>We use session cookies to maintain your login state and booking progress. We do not use third-party advertising cookies.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Data Retention</h2>
            <p>We retain booking records as required for business and legal purposes. You may request deletion of your personal information by contacting us at <a href="mailto:hello@railsiderides.com" className="underline">hello@railsiderides.com</a>.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:hello@railsiderides.com" className="underline">hello@railsiderides.com</a> or call 308-850-4752.</p>
          </div>

          <p className="text-xs" style={{ opacity: 0.5 }}>Last updated: May 2025</p>
        </div>
      </section>

      <FooterCta />
    </div>
  );
}
