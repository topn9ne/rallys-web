import { StartABlock } from "@/components/ui/StartABlock";
import { Wordmark } from "@/components/ui/Wordmark";
import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  return (
    <section className="relative bg-navy px-6 pb-20 pt-20 md:px-14 md:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex flex-col items-center gap-1 md:flex-row md:items-end md:justify-center md:gap-0">
          <StartABlock
            className="h-12 w-auto sm:h-16 md:h-20 lg:h-28"
            fill="#ffffff"
          />
          <Wordmark
            className="h-24 w-auto sm:h-32 md:-ml-5 md:h-40 lg:-ml-7 lg:h-48"
            gradient={{ from: "#df4226", to: "#ce232a", angle: 90 }}
          />
        </div>
        <h1 className="sr-only">Start a Rally&apos;s</h1>

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
