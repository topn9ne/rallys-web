const FEATURES = [
  {
    label: "2-hour ride",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
      </svg>
    ),
  },
  {
    label: "Up to 14 riders",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    label: "BYO beverages",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7.5 21H2V9l5.5-4L13 9v12H7.5zm7-12l5.5-4 5.5 4v12h-5.5V9h-5.5z" />
      </svg>
    ),
  },
];

/**
 * Three slim info tiles on /book, replacing the previous single framed card.
 * Sits between the page heading copy and the calendar — reinforces the key
 * facts without reading like a modal.
 */
export function ExperienceHero() {
  return (
    <div className="mb-10 mt-4 grid grid-cols-3 gap-2.5 sm:gap-3.5">
      {FEATURES.map((f) => (
        <div
          key={f.label}
          className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.06] px-3 py-4 text-center text-white"
        >
          <span className="text-white/85">{f.icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[1px] text-white/80 sm:text-xs">
            {f.label}
          </span>
        </div>
      ))}
    </div>
  );
}
