"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/ui/Wordmark";

const NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-50 transition-colors duration-300"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: scrolled || menuOpen
          ? "rgba(27,42,74,0.95)"
          : "rgba(27,42,74,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between px-6 py-4 md:px-14">
        <Link href="/" className="block">
          <Wordmark className="h-8 w-auto md:h-10" fill="#ffffff" />
        </Link>

        <div className="flex items-center gap-5">
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-[13px] font-semibold uppercase tracking-[1px] transition-colors ${
                  pathname === href
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <Link
            href="/book"
            className="rounded-full bg-rally-red-bright px-5 py-2.5 text-[13px] font-bold uppercase tracking-[1px] text-white transition-[filter] hover:brightness-110"
          >
            Book a Cage &rarr;
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:text-white md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 px-6 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-[1px] transition-colors ${
                  pathname === href
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/auth/signin"
              className="mt-2 rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[1px] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
