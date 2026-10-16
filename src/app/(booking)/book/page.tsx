export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getAllUpcomingSlots, getActivePricing } from "@/server/queries/slots";
import { getUser } from "@/lib/auth";
import { BookingCalendar } from "@/components/booking/BookingCalendar";

export const metadata = { title: "Book a Cage | Rally's Indoor Training" };

export default async function BookPage() {
  const [slots, pricing, user] = await Promise.all([
    getAllUpcomingSlots(),
    getActivePricing(),
    getUser(),
  ]);

  const todayKey = new Date().toISOString().split("T")[0];
  const isDropIn = !user;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pt-10">
      <div className="mb-6 text-center">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[2.5px] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-landing-accent" />
          Hastings, NE
          <span className="h-1.5 w-1.5 rounded-full bg-landing-accent" />
        </p>
        <h1 className="font-display text-[40px] leading-[0.95] tracking-[-1px] text-white sm:text-[56px]">
          BOOK YOUR <span className="text-landing-accent">CAGE</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
          30-minute batting cage sessions. Pick your lane, get a door code, and hit.
        </p>
      </div>

      <BookingCalendar
        slots={slots}
        todayKey={todayKey}
        pricing={pricing}
        isDropIn={isDropIn}
      />

      <div className="mt-auto flex justify-center pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          <ArrowLeft size={15} weight="bold" />
          Back to Home
        </Link>
      </div>

      <div className="flex items-center justify-center gap-3 pb-5 pt-6">
        <svg width="32" height="21" viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
          <rect width="42" height="28" rx="4" fill="#1A1F71"/>
          <text x="21" y="19" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">VISA</text>
        </svg>
        <svg width="32" height="21" viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
          <rect width="42" height="28" rx="4" fill="#252525"/>
          <circle cx="16" cy="14" r="8" fill="#EB001B"/>
          <circle cx="26" cy="14" r="8" fill="#F79E1B"/>
          <path d="M21 7.5a8 8 0 0 1 0 13A8 8 0 0 1 21 7.5z" fill="#FF5F00"/>
        </svg>
        <svg width="32" height="21" viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
          <rect width="42" height="28" rx="4" fill="#2557D6"/>
          <text x="21" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="0.5">AMEX</text>
        </svg>
        <span className="h-4 w-px bg-white/20"/>
        <span className="flex items-center gap-1 text-[11px] text-white/40">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          Secured by Stripe
        </span>
      </div>
    </div>
  );
}
