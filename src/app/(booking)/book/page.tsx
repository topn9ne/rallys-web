export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getAvailableSlots } from "@/server/queries/slots";
import { getCurrentPricing } from "@/server/actions/pricing";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { ExperienceHero } from "@/components/booking/ExperienceHero";

export const metadata = { title: "Book a Ride | Railside Rides" };

export default async function BookPage() {
  const [slots, pricing] = await Promise.all([
    getAvailableSlots(),
    getCurrentPricing(),
  ]);

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pt-10">
      <div className="mb-6 text-center">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[2.5px] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-landing-accent" />
          Grand Island, NE
          <span className="h-1.5 w-1.5 rounded-full bg-landing-accent" />
        </p>
        <h1 className="font-display text-[40px] leading-[0.95] tracking-[-1px] text-white sm:text-[56px]">
          BOOK YOUR <span className="text-landing-accent">RIDE</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
          Gather your crew on a 14-passenger party bike for a 2-hour guided ride
          through Grand Island. BYO beverages, we bring the fun.
        </p>
      </div>
      <ExperienceHero />
      <BookingCalendar slots={slots} todayKey={todayKey} pricing={pricing} />

      {/* Back to home */}
      <div className="mt-auto flex justify-center pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[10px] bg-landing-accent px-6 py-3 font-display text-[13px] uppercase tracking-[1px] text-white shadow-[0_6px_16px_rgba(255,46,136,0.35)] transition-[filter] hover:brightness-110"
        >
          <ArrowLeft size={15} weight="bold" />
          Back to Home
        </Link>
      </div>

      {/* Payment logos */}
      <div className="flex items-center justify-center gap-3 pb-5 pt-6">
          {/* Visa */}
          <svg width="32" height="21" viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
            <rect width="42" height="28" rx="4" fill="#1A1F71"/>
            <text x="21" y="19" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">VISA</text>
          </svg>
          {/* Mastercard */}
          <svg width="32" height="21" viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
            <rect width="42" height="28" rx="4" fill="#252525"/>
            <circle cx="16" cy="14" r="8" fill="#EB001B"/>
            <circle cx="26" cy="14" r="8" fill="#F79E1B"/>
            <path d="M21 7.5a8 8 0 0 1 0 13A8 8 0 0 1 21 7.5z" fill="#FF5F00"/>
          </svg>
          {/* Amex */}
          <svg width="32" height="21" viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
            <rect width="42" height="28" rx="4" fill="#2557D6"/>
            <text x="21" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="0.5">AMEX</text>
          </svg>
          {/* Discover */}
          <svg width="32" height="21" viewBox="0 0 42 28" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
            <rect width="42" height="28" rx="4" fill="white"/>
            <rect width="42" height="28" rx="4" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
            <circle cx="30" cy="14" r="9" fill="#F76F20"/>
            <text x="13" y="18" textAnchor="middle" fill="#231F20" fontSize="5" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="0.3">DISCOVER</text>
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
