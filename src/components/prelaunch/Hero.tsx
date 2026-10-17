import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  return (
    <section className="relative bg-navy px-6 pb-20 pt-20 md:px-14 md:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        {/* SVG placeholder — replace with exported lockup */}
        <h1 className="font-bold uppercase leading-[0.9] tracking-[-2px] text-white text-[56px] sm:text-[80px] lg:text-[112px]">
          Start a
          <br />
          <span className="text-rally-red-bright">Rally</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
          Self-service batting cages. Coming to Hastings.
        </p>

        <div className="mt-10 flex justify-center">
          <WaitlistForm variant="dark" />
        </div>

        <p className="mt-4 text-sm text-white/40">
          Get notified when we open. No spam. Just a heads up.
        </p>
      </div>
    </section>
  );
}
