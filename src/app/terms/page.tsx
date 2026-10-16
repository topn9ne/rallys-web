import { Nav } from "@/components/landing/Nav";
import { FooterCta } from "@/components/landing/FooterCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Railside Rides",
  description: "Terms and conditions for booking and riding with Railside Rides in Grand Island, Nebraska.",
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
            <p>By booking a ride with Railside Rides ("we", "us", "our"), you agree to these terms and conditions in full. If you do not agree, please do not complete your booking.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Eligibility</h2>
            <p>All riders must be 21 years of age or older. Valid photo ID is required at check-in. Railside Rides reserves the right to refuse service to any individual who cannot provide valid ID, appears intoxicated prior to boarding, or poses a safety risk to other riders or staff.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Reservations &amp; Payment</h2>
            <p>Full payment is required at the time of booking. Reservations are not confirmed until payment is received. We accept all major credit cards processed securely through Stripe. Payment may be split across multiple cards — contact us in advance to arrange.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Cancellation &amp; Refunds</h2>
            <p>Cancellations made more than 7 days prior to your ride date are eligible for a full refund minus the booking fee. Cancellations made within 7 days of the ride will receive a rain check to be used later in the season. Cancellations within 48 hours of the scheduled ride are not eligible for a refund or transfer of any kind.</p>
            <p className="mt-3">If Railside Rides must cancel a ride due to severe weather or other circumstances beyond our control, we will work with you to reschedule at no additional charge.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Group Size</h2>
            <p>Private rides require a minimum of 8 riders and accommodate a maximum of 14. The booking price is the same regardless of group size within that range. Riders beyond 14 cannot be accommodated on a single ride for safety reasons.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Alcohol Policy</h2>
            <p>Riders may bring their own beer or malt beverages in aluminum cans or plastic containers. No glass bottles or hard liquor are permitted on the vehicle at any time. Railside Rides is not a licensed alcohol retailer and does not sell or provide alcohol. All consumption is the sole responsibility of the rider.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Waiver Requirement</h2>
            <p>All riders are required to sign a liability waiver before boarding. Failure to sign the waiver will result in denial of boarding with no refund. Waivers may be signed in advance via the link provided in your booking confirmation.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Conduct &amp; Right to Refuse Service</h2>
            <p>Railside Rides reserves the right to refuse service or remove any rider from the vehicle at any time for disruptive, unsafe, or abusive behavior — including toward staff, other riders, or members of the public. No refund will be issued in cases of removal for cause.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Weather</h2>
            <p>Rides operate in most weather conditions including light rain. The vehicle is equipped with a roof. Rides will only be cancelled in cases of severe weather such as thunderstorms, lightning, or conditions deemed unsafe by our staff. We do not cancel for cold temperatures or light precipitation alone.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Liability</h2>
            <p>Participation in a Railside Rides experience involves inherent physical risk. By booking, you acknowledge these risks and agree that Railside Rides, its owners, employees, and agents are not liable for any injury, loss, or damage arising from your participation, except in cases of gross negligence or willful misconduct.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Photography &amp; Media</h2>
            <p>Railside Rides may photograph or video rides for promotional purposes. By participating, you grant us permission to use such images or footage on our website and social media. If you object, please notify us before your ride.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>SMS Text Messaging</h2>
            <p>By providing your phone number and checking the SMS opt-in checkbox during the booking process, you consent to receive text messages from Railside Rides related to your booking. This includes booking confirmations, ride reminders, waiver alerts, and a single post-ride review request.</p>
            <p className="mt-3">Consent to receive SMS messages is not required to complete a booking or purchase. Message frequency varies — typically 2–4 messages per booking. Message and data rates may apply.</p>
            <p className="mt-3">Railside Rides collects SMS opt-in consent directly from customers and does not share, sell, or transfer mobile opt-in data or phone numbers to third parties for marketing purposes.</p>
            <p className="mt-3">To opt out at any time, reply <strong>STOP</strong> to any message. For help, reply <strong>HELP</strong> or contact us at <a href="mailto:hello@railsiderides.com" className="underline">hello@railsiderides.com</a> or 308-850-4752. Full details at <a href="/sms" className="underline">railsiderides.com/sms</a>.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Changes to These Terms</h2>
            <p>We may update these terms from time to time. The version in effect at the time of your booking governs your ride. Continued use of our services constitutes acceptance of any updated terms.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xs uppercase tracking-[2px]" style={{ color: "var(--color-landing-primary)" }}>Contact</h2>
            <p>Questions? Email us at <a href="mailto:hello@railsiderides.com" className="underline">hello@railsiderides.com</a> or call 308-850-4752.</p>
          </div>

          <p className="text-xs" style={{ opacity: 0.5 }}>Last updated: May 2025</p>
        </div>
      </section>

      <FooterCta />
    </div>
  );
}
