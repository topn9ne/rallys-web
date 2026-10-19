const STEPS = [
  {
    num: "01",
    title: "Book online",
    desc: "Pick your lane, date, and time. Done in 30 seconds.",
  },
  {
    num: "02",
    title: "Get your code",
    desc: "A door code hits your phone by text. It only works for your session.",
  },
  {
    num: "03",
    title: "Walk in and hit",
    desc: "Punch the code, grab your lane, and swing. No staff. No waiting.",
  },
  {
    num: "04",
    title: "That’s it",
    desc: "When your time’s up, the code expires. Lock up and head out.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-navy px-6 py-24 md:px-14">
      <div className="mx-auto max-w-4xl">
        <div className="text-xl text-gold">
          <span className="font-condensed font-extrabold uppercase">How It</span> <span className="font-script text-[26px] pt-1 inline-block">Works</span>
        </div>
        <h2 className="mt-3 text-4xl uppercase leading-[0.95] tracking-[-1px] text-white sm:text-5xl lg:text-[56px]">
          <span className="font-semibold">Book. Show Up.</span>{" "}
          <span className="font-black">Swing.</span>
        </h2>

        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-5">
              <div className="text-[40px] font-bold leading-none text-gold/30">
                {step.num}
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-[0.5px] text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
