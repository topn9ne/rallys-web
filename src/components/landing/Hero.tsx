import Link from "next/link";
import NextImage from "next/image";
import { prisma } from "@/lib/prisma";
import { Placeholder } from "./Placeholder";

export async function Hero() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "hero_photo" } });
  const heroPhoto = setting?.value ?? null;

  return (
    <section className="relative px-6 pb-12 pt-[72px] md:px-14">
      <div className="grid gap-14 items-end lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div
            className="inline-flex items-center gap-[10px] rounded-full px-[14px] py-[7px] text-xs font-semibold uppercase tracking-[1.5px]"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "var(--color-landing-accent)",
              border: "1px solid var(--color-landing-accent)",
            }}
          >
            <span
              className="h-[7px] w-[7px] rounded-full"
              style={{ background: "var(--color-landing-accent)" }}
            />
            Now open in Hastings
          </div>

          <h1 className="mt-7 font-display leading-[0.9] tracking-[-2px] text-[64px] sm:text-[96px] lg:text-[128px]">
            BOOK.
            <br />
            <span style={{ color: "var(--color-landing-primary)" }}>SWING.</span>
            <br />
            REPEAT.
          </h1>

          <p className="mt-8 max-w-[520px] text-lg leading-[1.5] opacity-80 sm:text-xl">
            Self-service batting cages. Book a 30-minute slot online, get a door
            code on your phone, let yourself in, and hit. No staff, no waiting.
          </p>

          <div className="mt-10 flex items-center gap-[14px]">
            <Link
              href="/book"
              className="font-display text-lg tracking-[1px] text-white transition-[filter] hover:brightness-110"
              style={{
                background: "var(--color-landing-primary)",
                padding: "22px 38px",
                borderRadius: 6,
              }}
            >
              BOOK A CAGE →
            </Link>
          </div>

          <div className="mt-12 flex gap-10 text-[13px] uppercase tracking-[1px]">
            <div>
              <div className="font-display text-[32px]" style={{ color: "var(--color-landing-accent)" }}>2</div>
              lanes
            </div>
            <div>
              <div className="font-display text-[32px]" style={{ color: "var(--color-landing-accent)" }}>30</div>
              min slots
            </div>
            <div>
              <div className="font-display text-[32px]" style={{ color: "var(--color-landing-accent)" }}>24/7</div>
              access
            </div>
          </div>
        </div>

        <div className="relative">
          {heroPhoto ? (
            <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "3/4" }}>
              <NextImage
                src={heroPhoto}
                alt="Rally's Indoor Training — batting cages in Hastings, NE"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <Placeholder
              label="hero photo — batter mid-swing in cage, dramatic lighting, net in background"
              ratio="3/4"
              bg="rgba(255,255,255,0.08)"
              stripe="rgba(74,123,255,0.20)"
              color="rgba(255,255,255,0.60)"
              fontSize={12}
            />
          )}
          <div
            className="absolute font-display"
            style={{
              top: -18,
              right: -18,
              background: "var(--color-landing-accent)",
              color: "var(--color-landing-ink)",
              padding: "14px 18px",
              borderRadius: 6,
              fontSize: 14,
              letterSpacing: 1,
              transform: "rotate(4deg)",
              boxShadow: "0 8px 0 var(--color-landing-primary)",
            }}
          >
            PRIME TIME
            <br />
            BOOKS FAST
          </div>
        </div>
      </div>
    </section>
  );
}
