import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FacebookLogo, EnvelopeSimple, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Rally's Indoor Training",
  description:
    "Get in touch with Rally's Indoor Training in Hastings, NE. Questions about bookings, memberships, or the facility.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen font-sans">
      <SiteNav />

      <section className="bg-navy px-6 py-24 md:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="text-[13px] font-bold uppercase tracking-[2px] text-gold">
            Contact
          </div>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-tight tracking-[-1px] text-white sm:text-5xl lg:text-[56px]">
            Get in Touch
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Questions about bookings, memberships, or the facility? Reach out
            and we&rsquo;ll get back to you.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-24 md:px-14">
        <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
          {/* Email */}
          <div className="rounded-lg border border-navy/10 p-6 text-center">
            <EnvelopeSimple
              size={32}
              weight="duotone"
              className="mx-auto text-rally-red"
            />
            <div className="mt-4 text-sm font-bold uppercase tracking-[1px] text-navy">
              Email
            </div>
            <a
              href="mailto:info@rallysindoortraining.com"
              className="mt-2 block text-sm text-navy/70 underline transition-colors hover:text-rally-red"
            >
              info@rallysindoortraining.com
            </a>
          </div>

          {/* Location */}
          <div className="rounded-lg border border-navy/10 p-6 text-center">
            <MapPin
              size={32}
              weight="duotone"
              className="mx-auto text-rally-red"
            />
            <div className="mt-4 text-sm font-bold uppercase tracking-[1px] text-navy">
              Location
            </div>
            <p className="mt-2 text-sm text-navy/70">
              Hastings, NE
            </p>
          </div>

          {/* Social */}
          <div className="rounded-lg border border-navy/10 p-6 text-center">
            <FacebookLogo
              size={32}
              weight="duotone"
              className="mx-auto text-rally-red"
            />
            <div className="mt-4 text-sm font-bold uppercase tracking-[1px] text-navy">
              Follow Us
            </div>
            <a
              href="https://facebook.com/rallysindoortraining"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-navy/70 underline transition-colors hover:text-rally-red"
            >
              Facebook
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-lg border border-navy/10 bg-navy/5 p-8 text-center">
          <h2 className="text-lg font-bold uppercase tracking-[-0.5px] text-navy">
            Self-Service Facility
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy/60">
            Rally&rsquo;s is unmanned &mdash; there&rsquo;s no front desk or
            on-site staff. If you need help during a session, a support number is
            posted inside the facility.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
