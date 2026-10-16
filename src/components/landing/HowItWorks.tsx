const STEPS = [
  {
    n: "01",
    t: "Book online",
    d: "Pick your lane, date, and time. Thirty-second checkout — you're done before the coffee's ready.",
  },
  {
    n: "02",
    t: "Get your code",
    d: "A unique door code hits your phone via text. It activates five minutes before your slot.",
  },
  {
    n: "03",
    t: "Let yourself in",
    d: "Punch the code, walk in, and the cage is yours. No front desk. No&nbsp;waiting around.",
  },
  {
    n: "04",
    t: "Swing away",
    d: "One hour of cage time. When your slot ends, the code expires. Simple as that.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white px-6 py-24 md:px-14">
      <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="m-0 text-5xl font-bold uppercase leading-[0.95] tracking-[-1px] text-navy sm:text-6xl lg:text-[72px]">
          How It <span className="text-rally-red">Works</span>
        </h2>
        <div className="text-sm font-medium uppercase tracking-[1px] text-navy/50">
          Four steps. One hour. All yours.
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded border border-navy/10 bg-white px-7 py-7"
          >
            <div className="text-[56px] font-bold leading-none text-gold">
              {s.n}
            </div>
            <div className="mt-5 text-[22px] font-bold uppercase tracking-[0.5px] text-navy">
              {s.t}
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-navy/70">
              {s.d}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
