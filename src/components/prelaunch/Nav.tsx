import Link from "next/link";

export function Nav() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 md:px-14"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(27,42,74,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Link href="/" className="flex items-center gap-3">
        {/* TODO: Replace with Rally Cat SVG mark */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rally-red text-xs font-bold text-white">
          R
        </div>
        <span className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.5px] text-white md:text-lg">
          Rally&apos;s
        </span>
      </Link>

      <nav className="hidden items-center gap-6 sm:flex">
        <Link
          href="#how-it-works"
          className="text-[13px] font-semibold uppercase tracking-[1px] text-white/70 transition-colors hover:text-white"
        >
          How It Works
        </Link>
        <Link
          href="#the-story"
          className="text-[13px] font-semibold uppercase tracking-[1px] text-white/70 transition-colors hover:text-white"
        >
          The Story
        </Link>
      </nav>
    </header>
  );
}
