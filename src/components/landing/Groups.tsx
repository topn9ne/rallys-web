import Link from "next/link";
import NextImage from "next/image";
import { prisma } from "@/lib/prisma";
import { Placeholder } from "./Placeholder";

const EVENT_TYPES: Array<[string, string]> = [
  ["Bachelor/ette", "Sashes, slow jams, stops the bride picks"],
  ["Birthdays", "Decorate the vehicle. We look the other way."],
  ["Corporate", "Invoice-friendly. NDA-optional."],
  ["Date Night", "Romantic? No. Memorable? Yes."],
];

export async function Groups() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "group_photo" } });
  const groupPhoto = setting?.value ?? null;

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
          Groups &amp; Events
        </div>
        <h2 className="mt-3 mb-5 font-display leading-[0.95] tracking-[-1px] text-[44px] sm:text-5xl lg:text-[64px]">
          BOOK THE WHOLE DANG VEHICLE.
        </h2>
        <p className="mb-7 text-lg leading-[1.5]">
          14 seats, one private tour. Custom routes, catering drop-offs, decor,
          and branded swag for the corporate crowd. We&apos;ve done 200+ events.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {EVENT_TYPES.map(([t, d]) => (
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
          href="/custom"
          className="inline-block font-display text-[15px] tracking-[1px] transition-[filter] hover:brightness-110"
          style={{
            background: "var(--color-landing-ink)",
            color: "var(--color-landing-accent)",
            padding: "18px 28px",
            borderRadius: 4,
          }}
        >
          PLAN A CUSTOM RIDE →
        </Link>
      </div>

      {groupPhoto ? (
        <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: "4/5" }}>
          <NextImage
            src={groupPhoto}
            alt="Group event on a Railside Rides vehicle"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      ) : (
        <Placeholder
          label="group photo — bachelorette party, sashes, mid-cheers on bike"
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
