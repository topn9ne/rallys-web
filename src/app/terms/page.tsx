import { Nav } from "@/components/landing/Nav";
import { FooterCta } from "@/components/landing/FooterCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Rally's Indoor Training",
  description: "Terms and conditions for booking and using the batting cages at Rally's Indoor Training in Hastings, Nebraska.",
};

export default function TermsPage() {
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
        <h1 className="mb-10 font-display text-5xl tracking-[-1px]">TERMS &amp; CONDITIONS</h1>

        <div className="space-y-8 text-sm leading-relaxed" style={{ opacity: 0.85 }}>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Agreement</h2>
            <p>By booking a session with Rally&apos;s Indoor Training LLC (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), you agree to these terms and conditions in full. If you do not agree, please do not complete your booking.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Eligibility &amp; Waivers</h2>
            <p>All users are welcome. Participants under 18 years of age must have a waiver signed by a parent or legal guardian before using the facility. The digital waiver can be completed during the booking process.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Bookings &amp; Cancellations</h2>
            <p>All sessions are 30 minutes. Bookings are confirmed upon payment (drop-ins) or slot reservation (members). Cancellation policies and any applicable refund terms are displayed during checkout.</p>
            <p className="mt-3">If Rally&apos;s Indoor Training must cancel a session due to equipment failure or circumstances beyond our control, we will work with you to reschedule or issue a refund.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Facility Access</h2>
            <p>Each booking generates a unique, time-bound door code delivered via SMS. This code is active from 5 minutes before your session starts until 5 minutes after it ends. Do not share your code with others. Unauthorized access or remaining past your session time may result in account suspension.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Conduct &amp; Safety</h2>
            <p>Users are expected to use the facility responsibly and follow all posted safety guidelines. Rally&apos;s Indoor Training reserves the right to revoke access for any individual who damages equipment, behaves unsafely, or violates these terms.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Assumption of Risk</h2>
            <p>Use of batting cages involves inherent physical risk. By booking, you acknowledge these risks and agree that Rally&apos;s Indoor Training LLC, its owners and agents are not liable for any injury, loss, or damage arising from your use of the facility, except in cases of gross negligence or willful misconduct.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>SMS Communications</h2>
            <p>By providing your phone number and opting in during the booking process, you consent to receive text messages from Rally&apos;s Indoor Training related to your booking, including confirmations, door access codes, and session reminders.</p>
            <p className="mt-3">Rally&apos;s Indoor Training does not sell, share, or transfer mobile phone numbers or opt-in data to third parties for marketing purposes.</p>
            <p className="mt-3">To opt out at any time, reply <strong>STOP</strong> to any message. For help, reply <strong>HELP</strong> or contact us at <a href="mailto:info@rallysindoortraining.com" className="underline">info@rallysindoortraining.com</a>.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of our service after changes constitutes acceptance of the updated terms.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Contact</h2>
            <p>Questions? Email us at <a href="mailto:info@rallysindoortraining.com" className="underline">info@rallysindoortraining.com</a>.</p>
          </div>

          <p className="text-xs" style={{ opacity: 0.5 }}>Last updated: October 2026</p>
        </div>
      </section>

      <FooterCta />
    </div>
  );
}
