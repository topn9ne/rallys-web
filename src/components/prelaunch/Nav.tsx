"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 transition-colors duration-300 md:px-14"
      style={
        scrolled
          ? {
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(27,42,74,0.92)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }
          : {
              borderBottom: "1px solid transparent",
              background: "transparent",
            }
      }
    >
      <Link href="/" className="block">
        <Wordmark className="h-8 w-auto md:h-10" fill="#ffffff" />
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
