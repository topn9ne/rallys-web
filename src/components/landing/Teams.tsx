import Link from "next/link";
import NextImage from "next/image";
import { prisma } from "@/lib/prisma";
import { Placeholder } from "./Placeholder";

const PERKS: Array<[string, string]> = [
  ["Both Lanes", "Removable center divider — your team gets the full facility"],
  ["Team Pricing", "Flat monthly rate, unlimited 30-min team sessions"],
  ["Flexible Scheduling", "Book up to 14 days ahead, morning or evening slots"],
  ["Self-Service", "No staff needed — door code, cage time, done"],
];

export async function Teams() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "team_photo" } });
  const teamPhoto = setting?.value ?? null;

  return (
    <section
      className="mx-6 mb-24 grid items-center gap-14 p-8 md:mx-14 md:p-14 lg:grid-cols-2"
      style={{
        background: "var(--color-landing-accent)",
        color: "var(--color-landing-ink)",
        borderRadius: 8,
      }}
    >
      <div>
        <div className="text-[13px] font-bold uppercase tracking-[2px]">
          Teams &amp; Coaches
        </div>
        <h2 className="mt-3 mb-5 font-display leading-[0.95] tracking-[-1px] text-[44px] sm:text-5xl lg:text-[64px]">
          BRING THE WHOLE SQUAD.
        </h2>
        <p className="mb-7 text-lg leading-[1.5]">
          Team memberships get both lanes every session. Perfect for travel ball,
          high school off-season work, or any group that needs regular cage time
          without the hassle.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PERKS.map(([t, d]) => (
            <div
              key={t}
              className="pt-3"
              style={{ borderTop: "2px solid var(--color-landing-ink)" }}
            >
              <div className="font-display text-base uppercase">{t}</div>
              <div className="mt-1 text-sm opacity-75">{d}</div>
            </div>
          ))}
        </div>

        <Link
          href="/book"
          className="inline-block font-display text-[15px] tracking-[1px] transition-[filter] hover:brightness-110"
          style={{
            background: "var(--color-landing-ink)",
            color: "var(--color-landing-accent)",
            padding: "18px 28px",
            borderRadius: 4,
          }}
        >
          BOOK A TEAM SESSION →
        </Link>
      </div>

      {teamPhoto ? (
        <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "4/5" }}>
          <NextImage
            src={teamPhoto}
            alt="Team practice at Rally's Indoor Training"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      ) : (
        <Placeholder
          label="team photo — youth baseball team in cages, coach tossing ball"
          ratio="4/5"
          bg="rgba(74,123,255,0.13)"
          stripe="rgba(11,18,50,0.13)"
          color="rgba(11,18,50,0.60)"
          fontSize={12}
        />
      )}
    </section>
  );
}
