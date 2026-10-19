import { Wordmark } from "@/components/ui/Wordmark";
import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  return (
    <section className="relative bg-navy px-6 pb-20 pt-20 md:px-14 md:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <Wordmark className="mx-auto h-16 w-auto sm:h-24 lg:h-32" fill="#ffffff" />
        <h1 className="sr-only">Rally&apos;s Indoor Training</h1>

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
