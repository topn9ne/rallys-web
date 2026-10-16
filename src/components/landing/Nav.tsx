import Link from "next/link";
import { FacebookLogo, InstagramLogo, TiktokLogo } from "@phosphor-icons/react/dist/ssr";

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/railsiderides", icon: FacebookLogo, label: "Facebook" },
  { href: "https://www.instagram.com/railsiderides", icon: InstagramLogo, label: "Instagram" },
  { href: "https://www.tiktok.com/@railsiderides", icon: TiktokLogo, label: "TikTok" },
];

const NAV_LINKS = [
  { href: "/faqs", label: "FAQs" },
  { href: "/custom", label: "Custom Rides" },
];

export function Nav() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-[22px] md:px-14"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(11,18,50,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Link href="/" className="flex items-center gap-3">
        <div
          className="grid h-[34px] w-[34px] place-items-center rounded-full font-display text-base"
          style={{ background: "var(--color-landing-primary)", color: "var(--color-landing-bg)" }}
        >
          R
        </div>
        <div className="whitespace-nowrap font-display text-sm tracking-[0.5px] md:text-xl" style={{ color: "var(--color-landing-fg)" }}>
          RAILSIDE RIDES
        </div>
      </Link>

      <div className="flex items-center gap-5">
        {/* Page nav links */}
        <nav className="hidden items-center gap-5 sm:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-display text-[13px] tracking-[1px] transition-opacity hover:opacity-70"
              style={{ color: "var(--color-landing-fg)" }}
            >
              {label.toUpperCase()}
            </Link>
          ))}
        </nav>

        {/* Book Now CTA */}
        <Link
          href="/book"
          className="rounded-full font-display text-[13px] tracking-[1px] transition-[filter] hover:brightness-110"
          style={{
            background: "var(--color-landing-accent)",
            color: "var(--color-landing-ink)",
            padding: "12px 22px",
          }}
        >
          BOOK NOW →
        </Link>

        {/* Social icons */}
        <div className="hidden items-center gap-3 sm:flex">
          {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Railside Rides on ${label}`}
              className="transition-opacity hover:opacity-70"
              style={{ color: "var(--color-landing-fg)" }}
            >
              <Icon size={20} weight="regular" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
