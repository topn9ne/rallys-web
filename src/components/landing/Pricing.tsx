import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Check } from "@phosphor-icons/react/dist/ssr";

function formatDollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

const TIERS = [
  {
    key: "FAMILY",
    annualKey: "FAMILY_ANNUAL",
    name: "Family",
    sub: "/month",
    annualLabel: "/year — save $100",
    features: [
      "Unlimited 1-hour sessions",
      "Book up to 7 days ahead",
      "Priority lane selection",
      "Door code via text",
    ],
    featured: true,
    cta: "JOIN NOW",
  },
  {
    key: "TEAM",
    annualKey: "TEAM_ANNUAL",
    name: "Team",
    sub: "/month",
    annualLabel: "/year — save $150",
    features: [
      "Everything in Family",
      "Both lanes every session",
      "Book up to 14 days ahead",
      "Perfect for coaches & travel teams",
    ],
    featured: false,
    cta: "JOIN NOW",
  },
  {
    key: "DROPIN_SINGLE",
    bothKey: "DROPIN_BOTH",
    name: "Drop-in",
    sub: "single lane",
    features: [
      "No membership required",
      "1-hour session",
      "Door code via text",
      "Great for trying us out",
    ],
    featured: false,
    cta: "BOOK A SESSION",
  },
];

export async function Pricing() {
  const configs = await prisma.pricingConfig.findMany({
    orderBy: { effectiveFrom: "desc" },
  });

  function getPrice(tier: string) {
    const config = configs.find((c: { tier: string }) => c.tier === tier);
    return config ? config.amountCents : null;
  }

  return (
    <section id="pricing" className="bg-navy px-6 py-24 md:px-14">
      <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="m-0 text-5xl font-bold uppercase leading-[0.95] tracking-[-1px] text-white sm:text-6xl lg:text-[72px]">
          Simple <span className="text-gold">Pricing</span>
        </h2>
        <div className="text-sm font-medium uppercase tracking-[1px] text-white/50">
          No contracts. Cancel anytime.
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const price = getPrice(tier.key);
          const annualPrice = "annualKey" in tier ? getPrice(tier.annualKey as string) : null;
          const bothPrice = "bothKey" in tier ? getPrice(tier.bothKey as string) : null;

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
                {price ? formatDollars(price) : "—"}
              </div>
              <div className="mt-1 text-sm text-navy/50">{tier.sub}</div>

              {annualPrice && (
                <div className="mt-2 text-sm font-medium text-gold">
                  or {formatDollars(annualPrice)}
                  {"annualLabel" in tier ? (tier as { annualLabel: string }).annualLabel : ""}
                </div>
              )}

              {bothPrice && (
                <div className="mt-2 text-sm font-medium text-navy/60">
                  Both lanes: {formatDollars(bothPrice)} per session
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
                {tier.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
