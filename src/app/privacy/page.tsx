import { Nav } from "@/components/landing/Nav";
import { FooterCta } from "@/components/landing/FooterCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Rally's Indoor Training",
  description: "Privacy policy for Rally's Indoor Training, including how we collect, use, and protect your information.",
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
            <p>Rally&apos;s Indoor Training LLC (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates rallysindoortraining.com. This policy explains what information we collect, how we use it, and your rights regarding that information. By using our site or booking a session, you agree to the practices described here.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Information We Collect</h2>
            <p>When you book a session or create a membership, we collect your name, email address, and phone number. We also collect payment information, which is processed securely by Stripe — we never store your card details. If you sign a digital waiver, that record is stored in association with your booking.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>How We Use Your Information</h2>
            <p>We use your information to process bookings, manage memberships, deliver door access codes, send session reminders, and operate our service. We do not sell or share your personal information with third parties for marketing purposes.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>SMS Messaging</h2>
            <p>If you provide your phone number and opt in during the booking process, Rally&apos;s Indoor Training may send you SMS messages related to your booking — including booking confirmations, door access codes, and session reminders.</p>
            <p className="mt-3">Message frequency varies based on your bookings. Standard message and data rates may apply.</p>
            <p className="mt-3">To opt out of SMS messages at any time, reply <strong>STOP</strong> to any message. For help, reply <strong>HELP</strong> or contact us at <a href="mailto:info@rallysindoortraining.com" className="underline">info@rallysindoortraining.com</a>. Opting out of SMS will not affect your ability to book sessions, but you will not receive door access codes via text.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Cookies</h2>
            <p>We use session cookies to maintain your login state and booking progress. We do not use third-party advertising cookies.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Data Retention</h2>
            <p>We retain booking records as required for business and legal purposes. You may request deletion of your personal information by contacting us at <a href="mailto:info@rallysindoortraining.com" className="underline">info@rallysindoortraining.com</a>.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:info@rallysindoortraining.com" className="underline">info@rallysindoortraining.com</a>.</p>
          </div>

          <p className="text-xs" style={{ opacity: 0.5 }}>Last updated: October 2026</p>
        </div>
      </section>

      <FooterCta />
    </div>
  );
}
