import type { ReactNode } from "react";

/**
 * Shared layout for the customer booking funnel (/book, /book/[slotId],
 * /book/confirmation, /waiver/*). Applies the Midnight + Fuchsia navy
 * gradient bg with the same subtle diagonal stripe overlay as /admin.
 */
export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(180deg, var(--color-admin-ink) 0%, var(--color-admin-bg-mid) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.18,
          background:
            "repeating-linear-gradient(120deg, rgba(74,123,255,0.05) 0 12px, transparent 12px 24px)",
          maskImage:
            "linear-gradient(180deg, transparent 50%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 50%, black 100%)",
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
