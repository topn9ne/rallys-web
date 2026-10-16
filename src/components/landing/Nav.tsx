import Link from "next/link";
import { BaseballCap } from "@phosphor-icons/react/dist/ssr";

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
          <BaseballCap size={18} weight="fill" />
        </div>
        <div className="whitespace-nowrap font-display text-sm tracking-[0.5px] md:text-xl" style={{ color: "var(--color-landing-fg)" }}>
          RALLY&apos;S
        </div>
      </Link>

      <div className="flex items-center gap-5">
        <nav className="hidden items-center gap-5 sm:flex">
          <Link
            href="#pricing"
            className="font-display text-[13px] tracking-[1px] transition-opacity hover:opacity-70"
            style={{ color: "var(--color-landing-fg)" }}
          >
            PRICING
          </Link>
          <Link
            href="#faq"
            className="font-display text-[13px] tracking-[1px] transition-opacity hover:opacity-70"
            style={{ color: "var(--color-landing-fg)" }}
          >
            FAQ
          </Link>
        </nav>

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
      </div>
    </header>
  );
}
