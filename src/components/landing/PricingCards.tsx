"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "@phosphor-icons/react/dist/ssr";

function formatDollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

type PriceMap = Record<string, number | null>;

const MEMBERSHIP_TIERS = [
  {
    key: "FAMILY",
    annualKey: "FAMILY_ANNUAL",
    name: "Family",
    monthlySavings: 100,
    features: [
      "Unlimited 1-hour sessions",
      "Book up to 7 days ahead",
      "Priority lane selection",
      "Door code via text",
    ],
    featured: true,
  },
  {
    key: "TEAM",
    annualKey: "TEAM_ANNUAL",
    name: "Team",
    monthlySavings: 150,
    features: [
      "Everything in Family",
      "Both lanes every session",
      "Book up to 14 days ahead",
      "Perfect for coaches & travel teams",
    ],
    featured: false,
  },
];

const DROPIN_TIER = {
  key: "DROPIN_SINGLE",
  bothKey: "DROPIN_BOTH",
  name: "Drop-in",
  features: [
    "No membership required",
    "1-hour session",
    "Door code via text",
    "Great for trying us out",
  ],
};

export function PricingCards({ prices }: { prices: PriceMap }) {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <button
          onClick={() => setAnnual(false)}
          className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-[1px] transition-colors ${
            !annual
              ? "bg-white text-navy"
              : "bg-white/10 text-white/60 hover:bg-white/15"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setAnnual(true)}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold uppercase tracking-[1px] transition-colors ${
            annual
              ? "bg-white text-navy"
              : "bg-white/10 text-white/60 hover:bg-white/15"
          }`}
        >
          Annual
          <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-navy">
            Save more
          </span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {MEMBERSHIP_TIERS.map((tier) => {
          const monthlyPrice = prices[tier.key];
          const annualPrice = prices[tier.annualKey];
          const showPrice = annual ? annualPrice : monthlyPrice;
          const perMonthEquiv = annual && annualPrice
            ? Math.round(annualPrice / 12)
            : null;

          return (
            <div
              key={tier.key}
              className={`relative flex flex-col rounded-lg bg-white p-8 transition-transform hover:-translate-y-0.5 ${
                tier.featured ? "ring-2 ring-rally-red-bright" : ""
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 right-5 rounded-full bg-rally-red-bright px-3 py-1 text-[10px] font-bold uppercase tracking-[1px] text-white">
                  Most Popular
                </div>
              )}

              <div className="text-[13px] font-bold uppercase tracking-[1.5px] text-navy/50">
                {tier.name}
              </div>

              <div className="mt-3 text-[48px] font-bold leading-none text-navy">
                {showPrice ? formatDollars(showPrice) : "—"}
              </div>
              <div className="mt-1 text-sm text-navy/50">
                {annual ? "/year" : "/month"}
              </div>

              {annual && perMonthEquiv && (
                <div className="mt-2 text-sm font-medium text-gold">
                  {formatDollars(perMonthEquiv)}/mo — save ${tier.monthlySavings}/yr
                </div>
              )}

              {!annual && annualPrice && (
                <div className="mt-2 text-sm font-medium text-gold">
                  or {formatDollars(annualPrice)}/yr — save ${tier.monthlySavings}
                </div>
              )}

              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[14px] leading-snug text-navy/80"
                  >
                    <Check
                      size={16}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-rally-red"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/book"
                className={`mt-7 block rounded py-4 text-center text-[13px] font-bold uppercase tracking-[1px] transition-[filter] hover:brightness-110 ${
                  tier.featured
                    ? "bg-rally-red-bright text-white"
                    : "bg-navy text-white"
                }`}
              >
                Join Now
              </Link>
            </div>
          );
        })}

        {/* Drop-in card */}
        <div className="relative flex flex-col rounded-lg bg-white p-8 transition-transform hover:-translate-y-0.5">
          <div className="text-[13px] font-bold uppercase tracking-[1.5px] text-navy/50">
            {DROPIN_TIER.name}
          </div>

          <div className="mt-3 text-[48px] font-bold leading-none text-navy">
            {prices[DROPIN_TIER.key] ? formatDollars(prices[DROPIN_TIER.key]!) : "—"}
          </div>
          <div className="mt-1 text-sm text-navy/50">single lane</div>

          {prices[DROPIN_TIER.bothKey] && (
            <div className="mt-2 text-sm font-medium text-navy/60">
              Both lanes: {formatDollars(prices[DROPIN_TIER.bothKey]!)} per session
            </div>
          )}

          <ul className="mt-6 flex-1 space-y-2.5">
            {DROPIN_TIER.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-[14px] leading-snug text-navy/80"
              >
                <Check
                  size={16}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-rally-red"
                />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/book"
            className="mt-7 block rounded bg-navy py-4 text-center text-[13px] font-bold uppercase tracking-[1px] text-white transition-[filter] hover:brightness-110"
          >
            Book a Session
          </Link>
        </div>
      </div>
    </>
  );
}
