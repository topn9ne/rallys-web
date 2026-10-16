const ITEMS = [
  "Solo practice",
  "Family sessions",
  "Team training",
  "Birthday parties",
  "Weekend warriors",
  "Off-season reps",
];

export function Ticker() {
  const sequence = [...ITEMS, ...ITEMS];

  return (
    <div
      className="relative overflow-hidden py-[18px]"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="flex w-max gap-14 whitespace-nowrap font-display text-base uppercase tracking-[3px] opacity-70"
        style={{ animation: "landing-ticker 60s linear infinite" }}
      >
        {sequence.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-14">
            {item}
            <span
              style={{ color: "var(--color-landing-accent)", fontSize: 10 }}
            >
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
