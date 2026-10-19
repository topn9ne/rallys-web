import { WaitlistForm } from "./WaitlistForm";

export function WaitlistCta() {
  return (
    <section id="notify-me" className="bg-rally-red-bright px-6 py-20 md:px-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl uppercase leading-[0.95] tracking-[-1px] text-white sm:text-5xl lg:text-[56px]">
          <span className="font-semibold">Be the First</span>
          <br />
          <span className="font-black">Through the Door.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-lg text-white/80">
          Get on the list and we&apos;ll let you know when it&apos;s time to play ball.
        </p>

        <div className="mt-8 flex justify-center">
          <WaitlistForm variant="light" />
        </div>
      </div>
    </section>
  );
}
