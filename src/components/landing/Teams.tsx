import Link from "next/link";

const PERKS: Array<[string, string]> = [
  ["Both Lanes", "Removable center divider — your team gets the full facility"],
  ["Team Pricing", "Flat monthly rate, unlimited 1-hour team sessions"],
  ["Flexible Scheduling", "Book up to 14 days ahead, morning or evening slots"],
  ["Self-Service", "No staff needed — door code, cage time, done"],
];

export function Teams() {
  return (
    <section className="bg-white px-6 py-24 md:px-14">
      <div className="mx-auto max-w-4xl">
        <div className="text-[13px] font-bold uppercase tracking-[2px] text-gold">
          Teams &amp; Coaches
        </div>
        <h2 className="mt-3 mb-5 text-[44px] font-bold uppercase leading-[0.95] tracking-[-1px] text-navy sm:text-5xl lg:text-[64px]">
          Bring the Whole Squad.
        </h2>
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-navy/70">
          Team memberships get both lanes every session. Perfect for travel ball,
          high school off-season work, or any group that needs regular cage time
          without the hassle.
        </p>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PERKS.map(([t, d]) => (
            <div
              key={t}
              className="rounded-lg border border-navy/10 bg-navy/[0.03] px-5 py-4"
            >
              <div className="text-base font-bold uppercase text-navy">{t}</div>
              <div className="mt-1 text-sm text-navy/60">{d}</div>
            </div>
          ))}
        </div>

        <Link
          href="/book"
          className="inline-block rounded bg-rally-red-bright px-8 py-4 text-[15px] font-bold uppercase tracking-[1px] text-white transition-[filter] hover:brightness-110"
        >
          Book a Team Session &rarr;
        </Link>
      </div>
    </section>
  );
}
