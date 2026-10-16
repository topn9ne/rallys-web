import { prisma } from "@/lib/prisma";
import { PricingCards } from "./PricingCards";

export async function Pricing() {
  const configs = await prisma.pricingConfig.findMany({
    orderBy: { effectiveFrom: "desc" },
  });

  const prices: Record<string, number | null> = {};
  for (const c of configs) {
    if (!(c.tier in prices)) {
      prices[c.tier] = c.amountCents;
    }
  }

  return (
    <section id="pricing" className="bg-navy px-6 py-24 md:px-14">
      <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="m-0 text-5xl font-bold uppercase leading-[0.95] tracking-[-1px] text-white sm:text-6xl lg:text-[72px]">
          Simple <span className="text-gold">Pricing</span>
        </h2>
        <div className="text-sm font-medium uppercase tracking-[1px] text-white/50">
          No contracts. Cancel anytime. Annual saves two months.
        </div>
      </div>

      <PricingCards prices={prices} />
    </section>
  );
}
