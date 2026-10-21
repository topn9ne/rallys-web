import Link from "next/link";
import { RallyScript } from "@/components/ui/RallyScript";
import { StartABlock } from "@/components/ui/StartABlock";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy px-6 pb-20 pt-20 md:px-14 md:pt-28">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-navy/75" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="flex flex-col items-center gap-1 [filter:drop-shadow(0_4px_12px_rgba(0,0,0,0.5))] md:flex-row md:items-start md:justify-center md:gap-0">
          <StartABlock
            className="h-12 w-auto sm:h-16 md:h-20 lg:h-28"
            fill="#ffffff"
          />
          <RallyScript
            className="h-24 w-auto sm:h-28 md:-ml-3.5 md:-mt-7 md:h-36 lg:-ml-4 lg:-mt-7 lg:h-44"
            gradient={{ from: "#df4226", to: "#ce232a", angle: 90 }}
          />
        </div>
        <h1 className="sr-only">Start a Rally</h1>

        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
          Self-service batting cages in Hastings, NE. Book a 1-hour slot, get
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
          <span>1-hour sessions</span>
          <span className="text-gold">&middot;</span>
          <span>6 AM &ndash; 10 PM daily</span>
        </div>
      </div>
    </section>
  );
}
