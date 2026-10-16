import { prisma } from "@/lib/prisma";
import { Placeholder } from "./Placeholder";
import { GalleryGrid } from "./GalleryGrid";

const PLACEHOLDERS = [
  "group cheers, bachelorette sashes",
  "bike rolling past historic theater marquee",
  "corporate team high-fiving at a taproom",
  "couple laughing, night string lights overhead",
  "driver in Railside cap smiling",
  "crew pouring drinks mid-ride",
  "parade of bikes down brick-lined street",
  "birthday sparklers at a stop",
];

export async function Gallery() {
  const photos = await prisma.galleryPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 8,
  });

  return (
    <section className="px-6 pb-24 md:px-14">
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="m-0 font-display text-5xl tracking-[-1px] sm:text-[56px]">
          REAL RIDES. REAL{" "}
          <span style={{ color: "var(--color-landing-accent)" }}>CHAOS.</span>
        </h2>
        <a
          href="#"
          aria-label="Railside Rides on Instagram (placeholder)"
          className="text-[13px] uppercase tracking-[1px] opacity-80"
          style={{ color: "var(--color-landing-fg)" }}
        >
          @railsiderides ↗
        </a>
      </div>

      {photos.length > 0 ? (
        <GalleryGrid photos={photos} />
      ) : (
        <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 lg:grid-cols-4">
          {PLACEHOLDERS.map((label) => (
            <Placeholder
              key={label}
              label={label}
              ratio="1/1"
              bg="rgba(255,255,255,0.08)"
              stripe="rgba(74,123,255,0.13)"
              color="rgba(255,255,255,0.53)"
              fontSize={10}
            />
          ))}
        </div>
      )}
    </section>
  );
}
