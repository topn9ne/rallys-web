import Link from "next/link";

export function FooterCta() {
  return (
    <footer
      className="p-6 md:p-14"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <h2 className="m-0 font-display leading-[0.9] tracking-[-2px] text-[56px] sm:text-[72px] lg:text-[96px]">
        READY TO{" "}
        <span style={{ color: "var(--color-landing-primary)" }}>SWING?</span>
      </h2>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <Link
          href="/book"
          className="font-display tracking-[1px] transition-[filter] hover:brightness-110"
          style={{
            background: "var(--color-landing-accent)",
            color: "var(--color-landing-ink)",
            padding: "26px 44px",
            borderRadius: 6,
            fontSize: 22,
          }}
        >
          BOOK NOW →
        </Link>

        <div className="text-right text-[13px] leading-[1.8] opacity-60">
          Hastings, NE
          <br />
          Self-service · Open during scheduled hours
          <br />
          rallysindoortraining.com
        </div>
      </div>

      <div
        className="mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 text-[11px]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", opacity: 0.45 }}
      >
        <span>© {new Date().getFullYear()} Rally&apos;s Indoor Training LLC. All rights reserved.</span>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link>
          <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms &amp; Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
