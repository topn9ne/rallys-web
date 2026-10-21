import Link from "next/link";
import { FacebookLogo } from "@phosphor-icons/react/dist/ssr";

export function SiteFooter() {
  return (
    <>
      {/* CTA strip */}
      <section className="bg-rally-red-bright px-6 py-16 text-center md:px-14">
        <h2 className="text-4xl font-bold uppercase leading-tight tracking-[-1px] text-white sm:text-5xl lg:text-[64px] lg:leading-[0.95]">
          Ready to Rally?
        </h2>
        <div className="mt-8">
          <Link
            href="/book"
            className="inline-block rounded bg-white px-10 py-5 text-lg font-bold uppercase tracking-[1px] text-rally-red-bright transition-[filter] hover:brightness-95"
          >
            Book a Cage &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy px-6 py-10 md:px-14">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rally-red text-xs font-bold text-white">
              R
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.5px] text-white">
              Rally&apos;s Indoor Training
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <a
              href="https://www.facebook.com/rallysindoortraining"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 transition-colors hover:text-white"
              aria-label="Facebook"
            >
              <FacebookLogo size={24} weight="fill" />
            </a>
            <div className="text-right text-[13px] leading-[1.8] text-white/50">
              Hastings, NE
              <br />
              Self-service &middot; Open during scheduled hours
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-[11px] text-white/40">
          <span>
            &copy; {new Date().getFullYear()} Rally&apos;s Indoor Training LLC.
            All rights reserved.
          </span>
          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="transition-opacity hover:opacity-80"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-opacity hover:opacity-80">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
