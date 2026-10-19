import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

export function Footer() {
  return (
    <footer className="bg-navy px-6 py-10 md:px-14">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <Wordmark className="h-6 w-auto md:h-7" fill="#ffffff" />

        <div className="text-right text-[13px] leading-[1.8] text-white/50">
          Hastings, NE &middot; rallysindoor.com
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
  );
}
