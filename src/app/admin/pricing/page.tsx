import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { formatCents } from "@/lib/utils";
import { PricingForm } from "@/components/admin/PricingForm";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { User, UsersThree, BaseballCap } from "@phosphor-icons/react/dist/ssr";

async function getLatestPricing() {
  const tiers = ["FAMILY", "TEAM", "DROPIN_SINGLE", "DROPIN_BOTH"] as const;
  const configs = await Promise.all(
    tiers.map((tier) =>
      prisma.pricingConfig.findFirst({
        where: { tier: tier as any },
        orderBy: { effectiveFrom: "desc" },
      })
    )
  );
  return {
    member: configs[0],
    team: configs[1],
    dropinSingle: configs[2],
    dropinBoth: configs[3],
  };
}

export default async function PricingPage() {
  const pricing = await getLatestPricing();

  const cards = [
    {
      key: "FAMILY" as const,
      label: "Family Monthly",
      sublabel: "/month",
      Icon: User,
      config: pricing.member,
      inputLabel: "Monthly Price",
    },
    {
      key: "TEAM" as const,
      label: "Team Monthly",
      sublabel: "/month",
      Icon: UsersThree,
      config: pricing.team,
      inputLabel: "Monthly Price",
    },
    {
      key: "DROPIN_SINGLE" as const,
      label: "Drop-in Single Lane",
      sublabel: "/session",
      Icon: BaseballCap,
      config: pricing.dropinSingle,
      inputLabel: "Session Price",
    },
    {
      key: "DROPIN_BOTH" as const,
      label: "Drop-in Both Lanes",
      sublabel: "/session",
      Icon: BaseballCap,
      config: pricing.dropinBoth,
      inputLabel: "Session Price",
    },
  ];

  return (
    <div>
      <SettingsTabs />
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
                  <card.Icon size={18} weight="duotone" color="#1B2A4A" />
                  {card.label}
                </h2>
                {card.config && (
                  <span className="text-xl font-bold text-brand-blue">
                    {formatCents(card.config.amountCents)}{card.sublabel}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardBody className="pb-6">
              <PricingForm
                tier={card.key}
                currentCents={card.config?.amountCents}
                currentTaxRate={card.config?.taxRatePercent}
                label={card.inputLabel}
              />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
