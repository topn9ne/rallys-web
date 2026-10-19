import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

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
      <Link href="/" className="block">
        <Wordmark className="h-7 w-auto md:h-8" fill="#ffffff" />
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
