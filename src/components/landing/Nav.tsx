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
        <img
          src="/rally-cat.svg"
          alt="Rally Cat"
          className="h-8 w-8"
          style={{ display: "none" }}
        />
        <div className="h-8 w-8 rounded-full bg-rally-red flex items-center justify-center text-white text-xs font-bold">
          R
        </div>
        <span className="whitespace-nowrap text-sm font-bold tracking-[0.5px] text-white uppercase md:text-lg">
          Rally&apos;s
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="#how-it-works"
            className="text-[13px] font-semibold uppercase tracking-[1px] text-white/70 transition-colors hover:text-white"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-[13px] font-semibold uppercase tracking-[1px] text-white/70 transition-colors hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-[13px] font-semibold uppercase tracking-[1px] text-white/70 transition-colors hover:text-white"
          >
            FAQ
          </Link>
        </nav>

        <Link
          href="/book"
          className="rounded-full bg-rally-red-bright px-6 py-3 text-[13px] font-bold uppercase tracking-[1px] text-white transition-[filter] hover:brightness-110"
        >
          Start a Rally &rarr;
        </Link>
      </div>
    </header>
  );
}
