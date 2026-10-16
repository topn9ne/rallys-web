export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivePricing } from "@/server/queries/slots";
import { formatCents } from "@/lib/utils";
import { MembershipActions } from "@/components/account/MembershipActions";

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

  const memberPrice = pricing["FAMILY"]?.amountCents ?? 5000;
  const teamPrice = pricing["TEAM"]?.amountCents ?? 7500;

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
                  ? `${formatCents(teamPrice)}/month — Both lanes per session`
                  : `${formatCents(memberPrice)}/month — Single lane per session`}
              </p>
            </div>
            <span className="rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-800">
              Active
            </span>
          </div>
          <MembershipActions
            status="ACTIVE"
            hasStripeCustomer={!!member.stripeCustomerId}
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
          <MembershipActions
            status="PAST_DUE"
            hasStripeCustomer={!!member.stripeCustomerId}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Subscribe to book cage sessions anytime. Your membership covers unlimited 1-hour sessions during operating hours.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Family tier */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Family</h2>
              <p className="mt-1 text-3xl font-bold text-brand-blue">
                {formatCents(memberPrice)}
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>Single lane per session</li>
                <li>Book up to 7 days ahead</li>
                <li>Door code via text</li>
                <li>Cancel anytime</li>
              </ul>
              <MembershipActions
                status="NONE"
                tier="FAMILY"
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
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
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
                hasStripeCustomer={false}
              />
            </div>
          </div>

          <p className="text-center text-xs text-gray-400">
            Not ready to subscribe? Book a drop-in session from the{" "}
            <a href="/book" className="text-brand-blue hover:underline">calendar</a>.
          </p>
        </div>
      )}
    </div>
  );
}
