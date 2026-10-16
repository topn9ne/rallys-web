"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "@phosphor-icons/react/dist/ssr";

function formatDollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

type PriceMap = Record<string, number | null>;

type Tab = "families" | "teams";

export function PricingCards({ prices }: { prices: PriceMap }) {
  const [tab, setTab] = useState<Tab>("families");

  return (
    <>
      {/* Audience tabs */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <button
          onClick={() => setTab("families")}
          className={`rounded-full px-6 py-2.5 text-sm font-bold uppercase tracking-[1px] transition-colors ${
            tab === "families"
              ? "bg-white text-navy"
              : "bg-white/10 text-white/60 hover:bg-white/15"
          }`}
        >
          For Families
        </button>
        <button
          onClick={() => setTab("teams")}
          className={`rounded-full px-6 py-2.5 text-sm font-bold uppercase tracking-[1px] transition-colors ${
            tab === "teams"
              ? "bg-white text-navy"
              : "bg-white/10 text-white/60 hover:bg-white/15"
          }`}
        >
          For Teams
        </button>
      </div>

      {/* Cards */}
      {tab === "families" ? (
        <FamilyCards prices={prices} />
      ) : (
        <TeamCards prices={prices} />
      )}
    </>
  );
}

function FamilyCards({ prices }: { prices: PriceMap }) {
  const monthly = prices.FAMILY;
  const annual = prices.FAMILY_ANNUAL;
  const dropIn = prices.DROPIN_SINGLE;

  return (
    <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
      {/* Family Membership */}
      <div className="relative flex flex-col rounded-lg bg-white p-8 ring-2 ring-rally-red-bright transition-transform hover:-translate-y-0.5">
        <div className="absolute -top-3 right-5 rounded-full bg-rally-red-bright px-3 py-1 text-[10px] font-bold uppercase tracking-[1px] text-white">
          Most Popular
        </div>

        <div className="text-[13px] font-bold uppercase tracking-[1.5px] text-navy/50">
          Family Membership
        </div>

        <div className="mt-3 text-[48px] font-bold leading-none text-navy">
          {monthly ? formatDollars(monthly) : "—"}
        </div>
        <div className="mt-1 text-sm text-navy/50">/month</div>

        {annual && (
          <div className="mt-2 text-sm font-medium text-gold">
            or {formatDollars(annual)}/yr — annual saves two months
          </div>
        )}

        <ul className="mt-6 flex-1 space-y-2.5">
          {[
            "Household access — the whole family",
            "Book 1-hour sessions, 6 AM – 10 PM",
            "Door code via text",
          ].map((f) => (
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
          className="mt-7 block rounded bg-rally-red-bright py-4 text-center text-[13px] font-bold uppercase tracking-[1px] text-white transition-[filter] hover:brightness-110"
        >
          Get Started
        </Link>
      </div>

      {/* Single Session */}
      <div className="flex flex-col">
        <div className="flex flex-1 flex-col rounded-lg bg-white p-8 transition-transform hover:-translate-y-0.5">
          <div className="text-[13px] font-bold uppercase tracking-[1.5px] text-navy/50">
            Single Session
          </div>

          <div className="mt-3 text-[48px] font-bold leading-none text-navy">
            {dropIn ? formatDollars(dropIn) : "—"}
          </div>
          <div className="mt-1 text-sm text-navy/50">/hour, one lane</div>

          <ul className="mt-6 flex-1 space-y-2.5">
            {[
              "No membership required",
              "1 hour of cage time",
              "Door code via text",
            ].map((f) => (
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
            className="mt-7 block rounded border-2 border-navy bg-white py-4 text-center text-[13px] font-bold uppercase tracking-[1px] text-navy transition-colors hover:bg-navy/5"
          >
            Book a Session
          </Link>
        </div>
        <p className="mt-3 text-center text-sm text-white/50">
          Your 3rd visit costs more than a membership. Just saying.
        </p>
      </div>
    </div>
  );
}

function TeamCards({ prices }: { prices: PriceMap }) {
  const monthly = prices.TEAM;
  const annual = prices.TEAM_ANNUAL;
  const teamSession = prices.DROPIN_BOTH;

  return (
    <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
      {/* Team Membership */}
      <div className="relative flex flex-col rounded-lg bg-white p-8 ring-2 ring-rally-red-bright transition-transform hover:-translate-y-0.5">
        <div className="text-[13px] font-bold uppercase tracking-[1.5px] text-navy/50">
          Team Membership
        </div>

        <div className="mt-3 text-[48px] font-bold leading-none text-navy">
          {monthly ? formatDollars(monthly) : "—"}
        </div>
        <div className="mt-1 text-sm text-navy/50">/month</div>

        {annual && (
          <div className="mt-2 text-sm font-medium text-gold">
            or {formatDollars(annual)}/yr — annual saves two months
          </div>
        )}

        <ul className="mt-6 flex-1 space-y-2.5">
          <li className="flex items-start gap-2 text-[14px] leading-snug text-navy/80">
            <Check
              size={16}
              weight="bold"
              className="mt-0.5 shrink-0 text-rally-red"
            />
            Everything in Family, plus:
          </li>
          {[
            "Both lanes every session",
            "Team block scheduling",
            "Perfect for coaches and travel teams",
          ].map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-[14px] leading-snug text-navy/80 pl-6"
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
          className="mt-7 block rounded bg-rally-red-bright py-4 text-center text-[13px] font-bold uppercase tracking-[1px] text-white transition-[filter] hover:brightness-110"
        >
          Get Started
        </Link>
      </div>

      {/* Team Session */}
      <div className="flex flex-col">
        <div className="flex flex-1 flex-col rounded-lg bg-white p-8 transition-transform hover:-translate-y-0.5">
          <div className="text-[13px] font-bold uppercase tracking-[1.5px] text-navy/50">
            Team Session
          </div>

          <div className="mt-3 text-[48px] font-bold leading-none text-navy">
            {teamSession ? formatDollars(teamSession) : "—"}
          </div>
          <div className="mt-1 text-sm text-navy/50">/hour, both lanes</div>

          <ul className="mt-6 flex-1 space-y-2.5">
            {[
              "No membership required",
              "Full cage for your squad",
              "Door code via text",
            ].map((f) => (
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

          <div className="mt-5 rounded border border-navy/10 bg-navy/5 px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[1px] text-navy/50">
              Have a tournament code?
            </p>
            <input
              type="text"
              placeholder="Enter promo code"
              className="mt-1.5 w-full rounded border border-navy/15 bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/30 focus:border-rally-red-bright focus:outline-none"
            />
          </div>

          <Link
            href="/book"
            className="mt-5 block rounded border-2 border-navy bg-white py-4 text-center text-[13px] font-bold uppercase tracking-[1px] text-navy transition-colors hover:bg-navy/5"
          >
            Book a Team Session
          </Link>
        </div>
        <p className="mt-3 text-center text-sm text-white/50">
          2 sessions costs more than a Team membership. Worth a look.
        </p>
      </div>
    </div>
  );
}
