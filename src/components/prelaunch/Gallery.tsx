import Image from "next/image";

const PHOTOS: { src: string; alt: string }[] = [
  // Add photos as the build progresses:
  // { src: "/gallery/raw-space.jpg", alt: "Raw shop bay before build-out" },
  // { src: "/gallery/painting.jpg", alt: "Walls getting painted" },
  // { src: "/gallery/nets.jpg", alt: "First batting net going up" },
  // { src: "/gallery/turf.jpg", alt: "Turf installation" },
  // { src: "/gallery/machines.jpg", alt: "Pitching machines arriving" },
];

export function Gallery() {
  if (PHOTOS.length === 0) return null;

  return (
    <section className="bg-white px-6 py-24 md:px-14">
      <div className="mx-auto max-w-5xl">
        <div className="text-xl text-gold">
          <span className="font-condensed font-extrabold uppercase">The</span> <span className="font-script">Build</span>
        </div>
        <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.95] tracking-[-1px] text-navy sm:text-5xl">
          From Shop Bay to Batting Cage
        </h2>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTOS.map((photo) => (
            <div
              key={photo.src}
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-navy/5"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
