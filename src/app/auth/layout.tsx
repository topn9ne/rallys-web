import type { ReactNode } from "react";

/**
 * Shared layout for /auth/* pages. Applies the Midnight + Fuchsia navy
 * gradient bg (matching /admin and /) and centers the card. Individual
 * pages render an <AuthCard> from `@/components/auth/AuthCard`.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 text-white"
      style={{
        background:
          "linear-gradient(180deg, var(--color-admin-ink) 0%, var(--color-admin-bg-mid) 100%)",
      }}
    >
      {/* Subtle diagonal stripe overlay — same as /admin */}
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
      <div className="relative z-[1] w-full max-w-sm">{children}</div>
    </div>
  );
}
