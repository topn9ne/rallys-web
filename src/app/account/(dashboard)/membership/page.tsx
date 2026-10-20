export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivePricing } from "@/server/queries/slots";
import { formatCents } from "@/lib/utils";
import { MembershipCards } from "@/components/account/MembershipCards";

export const metadata = { title: "Membership | Rally's Indoor Training" };

export default async function MembershipPage() {
  const user = await requireUser("/account/membership");

  const [member, pricing] = await Promise.all([
    prisma.member.findUnique({
      where: { id: user.id },
      select: {
        tier: true,
        subscriptionStatus: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
      },
    }),
    getActivePricing(),
  ]);

  const familyMonthly = pricing["FAMILY"]?.amountCents ?? 5000;
  const teamMonthly = pricing["TEAM"]?.amountCents ?? 7500;
  const familyAnnual = pricing["FAMILY_ANNUAL"]?.amountCents ?? 50000;
  const teamAnnual = pricing["TEAM_ANNUAL"]?.amountCents ?? 75000;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Membership</h1>

      {member?.subscriptionStatus === "ACTIVE" ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Active Membership</p>
              <p className="mt-1 text-2xl font-bold text-green-900">
                {member.tier === "TEAM" ? "Team" : "Family"}
              </p>
              <p className="mt-1 text-sm text-green-700">
                {member.tier === "TEAM"
                  ? `${formatCents(teamMonthly)}/month — Both lanes per session`
                  : `${formatCents(familyMonthly)}/month — Single lane per session`}
              </p>
            </div>
            <span className="rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-800">
              Active
            </span>
          </div>
          <MembershipCards
            status="ACTIVE"
            hasStripeCustomer={!!member.stripeCustomerId}
            familyMonthly={familyMonthly}
            teamMonthly={teamMonthly}
            familyAnnual={familyAnnual}
            teamAnnual={teamAnnual}
          />
        </div>
      ) : member?.subscriptionStatus === "PAST_DUE" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">Payment Issue</p>
              <p className="mt-1 text-lg font-bold text-amber-900">
                Your subscription payment failed. Please update your payment method.
              </p>
            </div>
            <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
              Past Due
            </span>
          </div>
          <MembershipCards
            status="PAST_DUE"
            hasStripeCustomer={!!member.stripeCustomerId}
            familyMonthly={familyMonthly}
            teamMonthly={teamMonthly}
            familyAnnual={familyAnnual}
            teamAnnual={teamAnnual}
          />
        </div>
      ) : (
        <MembershipCards
          status="NONE"
          hasStripeCustomer={false}
          familyMonthly={familyMonthly}
          teamMonthly={teamMonthly}
          familyAnnual={familyAnnual}
          teamAnnual={teamAnnual}
        />
      )}
    </div>
  );
}
