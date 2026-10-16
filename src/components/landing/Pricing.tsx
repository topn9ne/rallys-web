import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Check } from "@phosphor-icons/react/dist/ssr";

function formatDollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

const TIERS = [
  {
    key: "FAMILY",
    name: "Family",
    sub: "/month",
    features: ["Unlimited 30-min sessions", "Book up to 7 days ahead", "Priority lane selection", "Door code via text"],
    featured: true,
  },
  {
    key: "TEAM",
    name: "Team",
    sub: "/month",
    features: ["Everything in Member", "Both lanes every session", "Book up to 14 days ahead", "Perfect for coaches & travel teams"],
    featured: false,
  },
  {
    key: "DROPIN_SINGLE",
    name: "Drop-in",
    sub: "per session",
    features: ["Single lane, 30 minutes", "No membership required", "Door code via text", "Great for trying us out"],
    featured: false,
  },
  {
    key: "DROPIN_BOTH",
    name: "Drop-in Both",
    sub: "per session",
    features: ["Both lanes, 30 minutes", "No membership required", "Door code via text", "Bring the whole squad"],
    featured: false,
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
    <section id="pricing" className="px-6 py-24 md:px-14">
      <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="m-0 font-display text-5xl tracking-[-1px] sm:text-6xl lg:text-[72px] lg:leading-[0.95]">
          SIMPLE{" "}
          <span style={{ color: "var(--color-landing-accent)" }}>PRICING</span>
        </h2>
        <div className="text-sm uppercase tracking-[1px] opacity-60">
          No contracts. Cancel anytime.
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const price = getPrice(tier.key);
          return (
            <div
              key={tier.key}
              className="relative flex flex-col p-7 transition-transform hover:-translate-y-0.5"
              style={{
                background: tier.featured
                  ? "var(--color-landing-primary)"
                  : "rgba(255,255,255,0.08)",
                color: tier.featured ? "#fff" : "var(--color-landing-fg)",
                border: tier.featured
                  ? "1px solid var(--color-landing-primary)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
              }}
            >
              {tier.featured && (
                <div
                  className="absolute -top-3 right-5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[1px]"
                  style={{ background: "var(--color-landing-accent)", color: "var(--color-landing-ink)" }}
                >
                  Most Popular
                </div>
              )}
              <div className="font-display text-[13px] uppercase tracking-[1.5px] opacity-70">
                {tier.name}
              </div>
              <div className="mt-3 font-display text-[48px] leading-none">
                {price ? formatDollars(price) : "—"}
              </div>
              <div className="mt-1 text-sm opacity-60">{tier.sub}</div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px] leading-snug">
                    <Check
                      size={16}
                      weight="bold"
                      className="mt-0.5 shrink-0"
                      style={{ color: tier.featured ? "var(--color-landing-accent)" : "var(--color-landing-primary)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/book"
                className="mt-7 block rounded text-center font-display text-[13px] tracking-[1px] transition-[filter] hover:brightness-110"
                style={{
                  background: tier.featured ? "var(--color-landing-accent)" : "rgba(255,255,255,0.12)",
                  color: tier.featured ? "var(--color-landing-ink)" : "var(--color-landing-fg)",
                  padding: "14px 0",
                }}
              >
                {tier.key.startsWith("DROPIN") ? "BOOK A SESSION" : "GET STARTED"}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
