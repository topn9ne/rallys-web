import Link from "next/link";
import NextImage from "next/image";
import { Clock, UsersThree, Wine, MapPin, MusicNotes, Confetti, Cake, Briefcase, Heart, Star } from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/landing/Nav";
import { FooterCta } from "@/components/landing/FooterCta";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Rides — Railside Rides",
  description: "Book the whole vehicle for your crew. Corporate events, bachelorette parties, birthdays — we'll build the ride around you.",
};

const DETAILS = [
  { label: "Duration", value: "2 hours on the rails", icon: Clock },
  { label: "Capacity", value: "Up to 14 riders", icon: UsersThree },
  { label: "BYOB", value: "Bring your own drinks & snacks", icon: Wine },
  { label: "Route", value: "We handle the route & the driver", icon: MapPin },
  { label: "Music", value: "Bluetooth hookup — your playlist", icon: MusicNotes },
  { label: "Decorations", value: "Set up before your crew arrives", icon: Confetti },
];

const EVENT_TYPES = [
  { label: "Bachelorette Parties", icon: Confetti },
  { label: "Bachelor Parties", icon: Confetti },
  { label: "Birthday Celebrations", icon: Cake },
  { label: "Corporate Outings", icon: Briefcase },
  { label: "Date Night", icon: Heart },
  { label: "Reunions & Milestones", icon: Star },
];

export default async function CustomPage() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "custom_hero_photo" } });
  const heroPhoto = setting?.value ?? null;

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: "var(--color-landing-bg)",
        color: "var(--color-landing-fg)",
      }}
    >
      <Nav />

      {/* Hero — screened background */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:px-14 md:pt-24">
        {/* Screened hero photo */}
        {heroPhoto && (
          <>
            <NextImage
              src={heroPhoto}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
              style={{ opacity: 0.38, filter: "saturate(0)" }}
              priority
            />
            {/* Duotone color wash */}
            <div
              className="absolute inset-0"
              style={{
                background: "var(--color-landing-primary)",
                mixBlendMode: "color",
                opacity: 0.38,
              }}
            />
            {/* Gradient fade toward bottom so it blends into the next section */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(11,15,36,0.15) 0%, rgba(11,15,36,0.65) 70%, var(--color-landing-bg) 100%)",
              }}
            />
          </>
        )}

        {/* Content sits above the image */}
        <div className="relative z-10">
          <p
            className="mb-4 font-display text-xs uppercase tracking-[3px]"
            style={{ color: "var(--color-landing-primary)" }}
          >
            Private Bookings
          </p>
          <h1 className="font-display text-5xl leading-none tracking-[-2px] sm:text-6xl lg:text-[80px]">
            BOOK THE{" "}
            <span style={{ color: "var(--color-landing-accent)" }}>WHOLE</span>
            <br />
            DANG BIKE.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed" style={{ opacity: 0.75 }}>
            Your crew, your music, your vibe. We supply the 14-seat pedal bar, a pro
            driver who knows every back road, and two hours downtown. You bring the
            drinks, the people, and the occasion.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:hello@railsiderides.com?subject=Custom%20Ride%20Inquiry"
              className="rounded-full font-display text-[13px] tracking-[1px] transition-[filter] hover:brightness-110"
              style={{
                background: "var(--color-landing-accent)",
                color: "var(--color-landing-ink)",
                padding: "14px 28px",
              }}
            >
              GET IN TOUCH →
            </a>
            <Link
              href="/book"
              className="rounded-full font-display text-[13px] tracking-[1px] transition-opacity hover:opacity-80"
              style={{
                border: "1px solid rgba(255,255,255,0.25)",
                color: "var(--color-landing-fg)",
                padding: "14px 28px",
              }}
            >
              BROWSE OPEN RIDES
            </Link>
          </div>
        </div>
      </section>

      {/* Details grid */}
      <section
        className="px-6 py-16 md:px-14"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <h2
          className="mb-10 font-display text-xs uppercase tracking-[3px]"
          style={{ color: "var(--color-landing-primary)" }}
        >
          What's Included
        </h2>
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DETAILS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-sm p-6"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start gap-4">
                <Icon size={36} weight="bold" style={{ flexShrink: 0, marginTop: "3px", color: "var(--color-landing-primary)" }} />
                <div>
                  <dt
                    className="mb-1 font-display text-xs uppercase tracking-[1.5px]"
                    style={{ color: "var(--color-landing-primary)" }}
                  >
                    {label}
                  </dt>
                  <dd className="text-lg font-bold leading-snug text-white">
                    {value}
                  </dd>
                </div>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Perfect For + CTA — two col */}
      <section
        className="px-6 py-16 md:px-14"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Event types */}
          <div>
            <h2 className="mb-8 font-display text-4xl tracking-[-1px] sm:text-5xl">
              PERFECT FOR
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {EVENT_TYPES.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.5px]"
                >
                  <Icon size={20} weight="bold" style={{ flexShrink: 0, color: "var(--color-landing-primary)" }} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-center">
            <h2 className="mb-4 font-display text-4xl tracking-[-1px] sm:text-5xl">
              PLAN YOUR{" "}
              <span style={{ color: "var(--color-landing-primary)" }}>RIDE.</span>
            </h2>
            <p className="mb-8 max-w-lg text-sm leading-relaxed" style={{ opacity: 0.65 }}>
              Drop us a line with your date, group size, and what you're celebrating.
              We'll get back to you fast.
            </p>
            <div>
              <a
                href="mailto:hello@railsiderides.com?subject=Custom%20Ride%20Inquiry"
                className="inline-block rounded-full font-display text-[13px] tracking-[1px] transition-[filter] hover:brightness-110"
                style={{
                  background: "var(--color-landing-accent)",
                  color: "var(--color-landing-ink)",
                  padding: "14px 28px",
                }}
              >
                EMAIL US →
              </a>
            </div>
          </div>
        </div>
      </section>

      <FooterCta />
    </div>
  );
}
