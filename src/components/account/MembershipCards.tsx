"use client";

import { useState } from "react";
import { formatCents } from "@/lib/utils";
import { MembershipActions } from "./MembershipActions";
import type { SubscriptionStatus } from "@prisma/client";

interface MembershipCardsProps {
  status: SubscriptionStatus | "NONE";
  hasStripeCustomer: boolean;
  familyMonthly: number;
  teamMonthly: number;
  familyAnnual: number;
  teamAnnual: number;
}

export function MembershipCards({
  status,
  hasStripeCustomer,
  familyMonthly,
  teamMonthly,
  familyAnnual,
  teamAnnual,
}: MembershipCardsProps) {
  const [annual, setAnnual] = useState(false);

  if (status === "ACTIVE" || status === "PAST_DUE") {
    return (
      <MembershipActions
        status={status}
        hasStripeCustomer={hasStripeCustomer}
      />
    );
  }

  const familyPrice = annual ? familyAnnual : familyMonthly;
  const teamPrice = annual ? teamAnnual : teamMonthly;
  const familySavings = familyMonthly * 12 - familyAnnual;
  const teamSavings = teamMonthly * 12 - teamAnnual;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Subscribe to book cage sessions anytime. Your membership covers unlimited 1-hour sessions during operating hours.
      </p>

      {/* Monthly / Annual toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            annual ? "bg-brand-blue" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
              annual ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-gray-900" : "text-gray-400"}`}>
          Annual
        </span>
        {annual && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            Save {formatCents(familySavings)}+
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Family tier */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Family</h2>
          <p className="mt-1 text-3xl font-bold text-brand-blue">
            {formatCents(familyPrice)}
            <span className="text-base font-normal text-gray-500">
              {annual ? "/yr" : "/mo"}
            </span>
          </p>
          {annual && (
            <p className="mt-1 text-xs text-green-600">
              Save {formatCents(familySavings)} vs monthly
            </p>
          )}
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>Single lane per session</li>
            <li>Book up to 7 days ahead</li>
            <li>Door code via text</li>
            <li>Cancel anytime</li>
          </ul>
          <MembershipActions
            status="NONE"
            tier="FAMILY"
            annual={annual}
            hasStripeCustomer={false}
          />
        </div>

        {/* Team tier */}
        <div className="rounded-xl border-2 border-brand-blue bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Team</h2>
            <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
              Best for teams
            </span>
          </div>
          <p className="mt-1 text-3xl font-bold text-brand-blue">
            {formatCents(teamPrice)}
            <span className="text-base font-normal text-gray-500">
              {annual ? "/yr" : "/mo"}
            </span>
          </p>
          {annual && (
            <p className="mt-1 text-xs text-green-600">
              Save {formatCents(teamSavings)} vs monthly
            </p>
          )}
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>Both lanes per session</li>
            <li>Full open floor available</li>
            <li>Book up to 7 days ahead</li>
            <li>Door code via text</li>
            <li>Cancel anytime</li>
          </ul>
          <MembershipActions
            status="NONE"
            tier="TEAM"
            annual={annual}
            hasStripeCustomer={false}
          />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        Not ready to subscribe? Book a drop-in session from the{" "}
        <a href="/book" className="text-brand-blue hover:underline">calendar</a>.
      </p>
    </div>
  );
}
