import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-navy px-6 pb-20 pt-20 md:px-14 md:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        {/* TODO: Replace with "START A RALLY" SVG wordmark lockup */}
        <h1 className="font-bold uppercase leading-[0.9] tracking-[-2px] text-white text-[56px] sm:text-[80px] lg:text-[112px]">
          Start a
          <br />
          <span className="text-rally-red-bright">Rally</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
          Self-service batting cages in Hastings, NE. Book a 30-minute slot, get
          a door code on your phone, and hit. No staff. No&nbsp;waiting.
        </p>

        <div className="mt-10">
          <Link
            href="/book"
            className="inline-block rounded bg-rally-red-bright px-10 py-5 text-lg font-bold uppercase tracking-[1px] text-white transition-[filter] hover:brightness-110"
          >
            Book a Cage &rarr;
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-4 text-[13px] font-semibold uppercase tracking-[1.5px] text-white/60">
          <span>2 lanes</span>
          <span className="text-gold">&middot;</span>
          <span>30-min slots</span>
          <span className="text-gold">&middot;</span>
          <span>6 AM &ndash; 10 PM daily</span>
        </div>
      </div>
    </section>
  );
}
