import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS Opt-In — Rally's Indoor Training",
  description: "How customers opt in to SMS text message alerts from Rally's Indoor Training during the booking process.",
};

export default function OptInPage() {
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
          SMS Opt-In Documentation
        </p>
        <h1 className="mb-6 font-display text-5xl tracking-[-1px]">SMS OPT-IN PROCESS</h1>

        <p className="mb-10 text-sm leading-relaxed" style={{ opacity: 0.7 }}>
          This page documents the SMS opt-in process for Rally&apos;s Indoor Training. The opt-in is collected
          during the online booking process at <strong>rallysindoor.com</strong>.
        </p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ opacity: 0.85 }}>

          <div>
            <h2 className="mb-3 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>User Flow</h2>
            <ol className="list-decimal pl-5 space-y-2">
              {[
                "Customer selects an available cage slot at rallysindoor.com/book",
                "Customer enters name, email, and phone number",
                "Customer is presented with an unchecked SMS consent checkbox (see below)",
                "Customer checks the box and submits the booking form",
                "System records opt-in timestamp and sends booking confirmation + door code via SMS",
              ].map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="mb-3 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Consent Checkbox</h2>
            <div
              className="rounded-lg p-5"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2"
                  style={{ borderColor: "rgba(255,255,255,0.4)" }}
                />
                <p className="text-sm leading-relaxed">
                  I agree to receive SMS booking confirmations, door codes, and reminders from Rally&apos;s Indoor Training.
                  Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to cancel, HELP for help.
                </p>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[1px] opacity-40">
                Unchecked by default. Checking this box constitutes explicit opt-in consent to receive SMS messages from Rally&apos;s Indoor Training.
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Business Information</h2>
            <div className="space-y-1">
              <p><strong>Business name:</strong> Rally&apos;s Indoor Training LLC</p>
              <p><strong>Location:</strong> Hastings, NE</p>
              <p><strong>Contact:</strong> <a href="mailto:admin@rallysindoor.com" className="underline">admin@rallysindoor.com</a></p>
              <p><strong>Privacy Policy:</strong> <a href="/privacy" className="underline" style={{ color: "var(--color-landing-primary)" }}>rallysindoor.com/privacy</a></p>
              <p><strong>Terms &amp; Conditions:</strong> <a href="/terms" className="underline" style={{ color: "var(--color-landing-primary)" }}>rallysindoor.com/terms</a></p>
              <p><strong>SMS Program details:</strong> <a href="/sms" className="underline" style={{ color: "var(--color-landing-primary)" }}>rallysindoor.com/sms</a></p>
            </div>
          </div>

          <p className="text-xs text-center pt-4" style={{ opacity: 0.4 }}>
            Rally&apos;s Indoor Training &middot; Hastings, NE &middot; admin@rallysindoor.com
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
