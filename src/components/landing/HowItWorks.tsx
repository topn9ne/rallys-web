const STEPS = [
  {
    n: "01",
    t: "Book your slot",
    d: "Pick a 2-hour window. Private vehicle = your crew only. No strangers, ever.",
  },
  {
    n: "02",
    t: "BYO everything",
    d: "Bring your drinks, your playlist, your questionable outfits. Coolers on board.",
  },
  {
    n: "03",
    t: "We pedal, you party",
    d: "Your driver steers & brakes. You pedal (or fake it). Three bar stops included.",
  },
  {
    n: "04",
    t: "Memories made",
    d: "We drop you back at HQ. You rave to your group chat for a week.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-24 md:px-14">
      <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="m-0 font-display text-5xl tracking-[-1px] sm:text-6xl lg:text-[72px] lg:leading-[0.95]">
          HOW IT <span style={{ color: "var(--color-landing-accent)" }}>ROLLS</span>
        </h2>
        <div className="text-sm uppercase tracking-[1px] opacity-60">
          Four steps. Two hours. One great night.
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="px-[26px] py-7"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
            }}
          >
            <div
              className="font-display leading-none"
              style={{ color: "var(--color-landing-primary)", fontSize: 56 }}
            >
              {s.n}
            </div>
            <div className="mt-5 font-display text-[22px] uppercase tracking-[0.5px]">
              {s.t}
            </div>
            <div className="mt-[10px] text-[15px] leading-[1.5] opacity-75">
              {s.d}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
