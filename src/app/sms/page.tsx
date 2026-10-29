import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS Messaging Program — Rally's Indoor Training",
  description: "Rally's Indoor Training SMS messaging program disclosure: opt-in, opt-out, message frequency, and contact information.",
};

export default function SmsPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "var(--color-landing-bg)", color: "var(--color-landing-fg)" }}
    >
      <SiteNav />

      <section className="px-6 py-16 md:px-14 max-w-3xl">
        <p
          className="mb-4 font-display text-xs uppercase tracking-[3px]"
          style={{ color: "var(--color-landing-primary)" }}
        >
          Rally&apos;s Indoor Training &middot; Hastings, NE &middot; admin@rallysindoor.com
        </p>
        <h1 className="mb-10 font-display text-5xl tracking-[-1px]">SMS MESSAGING PROGRAM</h1>

        <div className="space-y-8 text-sm leading-relaxed" style={{ opacity: 0.85 }}>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Program Details</h2>
            <p><strong>Program name:</strong> Rally&apos;s Indoor Training Booking Alerts</p>
            <p><strong>What you&apos;ll receive:</strong> Booking confirmations, door access codes, session reminders, and account notifications.</p>
            <p><strong>Message frequency:</strong> Varies by booking activity. Most customers receive 2–4 messages per booking.</p>
            <p><strong>Message and data rates:</strong> Standard rates may apply.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>How You Opt In</h2>
            <p>Consent is collected during the online booking process at <strong>rallysindoor.com</strong>. After entering your name, email, and phone number, you are presented with an unchecked checkbox that reads:</p>
            <blockquote
              className="my-3 border-l-2 pl-4 italic"
              style={{ borderColor: "var(--color-landing-primary)" }}
            >
              &ldquo;I agree to receive SMS booking confirmations, door codes, and reminders from Rally&apos;s Indoor Training. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to cancel, HELP for help.&rdquo;
            </blockquote>
            <p>By checking the box and submitting the form, you explicitly consent to receive SMS messages from Rally&apos;s Indoor Training. No mobile phone numbers or opt-in data are shared with third parties for marketing purposes.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>How to Opt Out</h2>
            <p>Reply <strong>STOP</strong> to any message at any time. You will receive a single confirmation and no further messages. You can re-opt-in during your next booking.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Help</h2>
            <p>Reply <strong>HELP</strong> for assistance, or contact us directly:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><a href="mailto:admin@rallysindoor.com" className="underline">admin@rallysindoor.com</a></li>
              <li>Hastings, NE</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Privacy</h2>
            <p>Rally&apos;s Indoor Training does not sell, share, or transfer mobile phone numbers or opt-in data to third parties for marketing purposes. Phone numbers are used solely to send booking-related messages to customers who have explicitly opted in. For full details see our <a href="/privacy" className="underline">Privacy Policy</a> and <a href="/terms" className="underline">Terms &amp; Conditions</a>.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
