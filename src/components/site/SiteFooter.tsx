import Link from "next/link";
import { FacebookLogo } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/ui/Wordmark";

export function SiteFooter() {
  return (
    <>
      {/* CTA strip */}
      <section className="bg-rally-red-bright px-6 py-16 text-center md:px-14">
        <h2 className="flex flex-col items-center text-white">
          <span className="font-condensed text-3xl font-extrabold uppercase tracking-[2px] sm:text-4xl lg:text-5xl">
            Ready to
          </span>
          <span className="font-script text-6xl sm:text-7xl lg:text-8xl">
            Rally?
          </span>
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
          <Link href="/" className="block">
            <Wordmark className="h-8 w-auto" fill="#ffffff" />
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
              Privacy
            </Link>
            <Link href="/terms" className="transition-opacity hover:opacity-80">
              Terms
            </Link>
            <Link
              href="/waiver"
              className="transition-opacity hover:opacity-80"
            >
              Waiver
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
