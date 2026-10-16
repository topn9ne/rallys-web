import { Nav } from "@/components/landing/Nav";
import { FooterCta } from "@/components/landing/FooterCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS Opt-In — Railside Rides",
  description: "How customers opt in to SMS text message alerts from Railside Rides during the booking process.",
};

export default function OptInPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "var(--color-landing-bg)", color: "var(--color-landing-fg)" }}
    >
      <Nav />

      <section className="px-6 py-16 md:px-14 max-w-2xl">
        <p
          className="mb-4 font-display text-xs uppercase tracking-[3px]"
          style={{ color: "var(--color-landing-primary)" }}
        >
          SMS Opt-In
        </p>
        <h1 className="mb-4 font-display text-4xl tracking-[-1px]">HOW CUSTOMERS OPT IN</h1>
        <p className="mb-10 text-sm" style={{ opacity: 0.6 }}>
          This page documents the SMS opt-in process for Railside Rides. The opt-in is collected
          during the online booking process at <strong>railsiderides.com</strong>.
        </p>

        <div className="space-y-8 text-sm" style={{ opacity: 0.9 }}>

          {/* Step-by-step flow */}
          <div>
            <h2 className="mb-4 font-semibold text-base">Opt-In Flow</h2>
            <ol className="space-y-3 list-none">
              {[
                "Customer selects an available ride at railsiderides.com/book",
                "Customer enters their Full Name and Email address",
                "Customer optionally enters their Phone Number",
                "Customer is presented with an unchecked SMS opt-in checkbox (shown below)",
                "Customer checks the box to consent — this step is entirely optional and not required to complete the booking",
                "Customer clicks \"Continue to Payment\" and is redirected to Stripe",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "var(--color-landing-primary)", color: "#fff" }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ opacity: 0.85 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Actual form fields as they appear */}
          <div>
            <h2 className="mb-4 font-semibold text-base">Opt-In Form (as shown to customers)</h2>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">

              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ opacity: 0.6 }}>Full Name</label>
                <div className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm" style={{ opacity: 0.4 }}>Jane Smith</div>
              </div>

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ opacity: 0.6 }}>Email</label>
                <div className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm" style={{ opacity: 0.4 }}>you@example.com</div>
                <p className="mt-1 text-xs" style={{ opacity: 0.4 }}>We&apos;ll send your confirmation here.</p>
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ opacity: 0.6 }}>Phone <span style={{ opacity: 0.5 }}>(optional)</span></label>
                <div className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm" style={{ opacity: 0.4 }}>(308) 555-0100</div>
                <p className="mt-1 text-xs" style={{ opacity: 0.4 }}>Optional — needed for text reminders.</p>
              </div>

              {/* The actual SMS opt-in checkbox */}
              <div className="rounded-lg border border-white/20 bg-white/[0.06] p-4">
                <label className="flex items-start gap-3 cursor-default select-none">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/40 bg-white/5" aria-hidden="true">
                    {/* unchecked by default */}
                  </span>
                  <span className="text-sm leading-relaxed">
                    Send me text message reminders about my booking. Msg &amp; data rates may apply.{" "}
                    <a href="/privacy" className="underline" style={{ color: "var(--color-landing-primary)" }}>Privacy policy</a>{" "}
                    &amp;{" "}
                    <a href="/terms" className="underline" style={{ color: "var(--color-landing-primary)" }}>Terms</a>.
                  </span>
                </label>
                <p className="mt-2 text-xs" style={{ opacity: 0.45 }}>
                  ☐ Unchecked by default. Checking this box constitutes explicit opt-in consent to receive SMS messages from Railside Rides.
                  Consent is not required to complete a booking.
                </p>
              </div>

            </div>
          </div>

          {/* Program disclosures */}
          <div>
            <h2 className="mb-4 font-semibold text-base">Required Disclosures</h2>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2 text-sm">
              <p><strong>Business name:</strong> Railside Rides</p>
              <p><strong>Message types:</strong> Booking confirmations, ride reminders, waiver alerts, post-ride review request</p>
              <p><strong>Message frequency:</strong> Up to 4 messages per booking</p>
              <p><strong>Msg &amp; data rates may apply</strong></p>
              <p><strong>Opt-out:</strong> Reply STOP at any time</p>
              <p><strong>Help:</strong> Reply HELP or call 308-850-4752</p>
              <p><strong>Privacy Policy:</strong> <a href="/privacy" className="underline" style={{ color: "var(--color-landing-primary)" }}>railsiderides.com/privacy</a></p>
              <p><strong>Terms &amp; Conditions:</strong> <a href="/terms" className="underline" style={{ color: "var(--color-landing-primary)" }}>railsiderides.com/terms</a></p>
              <p><strong>SMS Program details:</strong> <a href="/sms" className="underline" style={{ color: "var(--color-landing-primary)" }}>railsiderides.com/sms</a></p>
            </div>
          </div>

          <p className="text-xs" style={{ opacity: 0.4 }}>
            Railside Rides · 2824 Goldenrod Drive, Grand Island, NE 68801 · 308-850-4752 · hello@railsiderides.com
          </p>

        </div>
      </section>

      <FooterCta />
    </div>
  );
}
