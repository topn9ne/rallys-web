import NextImage from "next/image";
import { prisma } from "@/lib/prisma";

export async function Sponsors() {
  const sponsors = await prisma.sponsor.findMany({
    where: { active: true, logoUrl: { not: "" } },
    orderBy: { sortOrder: "asc" },
  });

  if (sponsors.length === 0) return null;

  return (
    <section className="px-6 py-8 md:px-14">
      <p
        className="mb-6 text-center font-display text-xs uppercase tracking-[2px]"
        style={{ color: "var(--color-landing-fg)", opacity: 0.4 }}
      >
        Our Partners
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {sponsors.map((sponsor) => (
          sponsor.websiteUrl ? (
            <a
              key={sponsor.id}
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={sponsor.name}
              className="opacity-60 transition-opacity hover:opacity-100"
            >
              <div className="relative h-20 w-56">
                <NextImage
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  fill
                  sizes="224px"
                  className="object-contain"
                />
              </div>
            </a>
          ) : (
            <div key={sponsor.id} className="relative h-20 w-56 opacity-60">
              <NextImage
                src={sponsor.logoUrl}
                alt={sponsor.name}
                fill
                sizes="224px"
                className="object-contain"
              />
            </div>
          )
        ))}
      </div>
    </section>
  );
}
