import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { formatCents } from "@/lib/utils";
import { PricingForm } from "@/components/admin/PricingForm";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { Confetti, Users } from "@phosphor-icons/react/dist/ssr";

async function getLatestPricing() {
  const [theme, general] = await Promise.all([
    prisma.pricingConfig.findFirst({
      where: { rideType: "THEME" },
      orderBy: { effectiveFrom: "desc" },
    }),
    prisma.pricingConfig.findFirst({
      where: { rideType: "GENERAL" },
      orderBy: { effectiveFrom: "desc" },
    }),
  ]);
  return { theme, general };
}

export default async function PricingPage() {
  const { theme, general } = await getLatestPricing();

  return (
    <div>
      <SettingsTabs />
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
                <Confetti size={18} weight="duotone" color="#2B5CE6" />
                Theme Ride
              </h2>
              {theme && (
                <span className="text-xl font-bold text-brand-blue">
                  {formatCents(theme.baseAmountCents)}/seat
                </span>
              )}
            </div>
          </CardHeader>
          <CardBody className="pb-6">
            <PricingForm
              rideType="THEME"
              currentCents={theme?.baseAmountCents}
              currentTaxRate={theme?.taxRatePercent}
              currentBookingFeeCents={theme?.bookingFeeCents}
              label="Per-Seat Price"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
                <Users size={18} weight="duotone" color="#2B5CE6" />
                Group Ride
              </h2>
              {general && (
                <span className="text-xl font-bold text-brand-blue">
                  {formatCents(general.baseAmountCents)}/booking
                </span>
              )}
            </div>
          </CardHeader>
          <CardBody className="pb-6">
            <PricingForm
              rideType="GENERAL"
              currentCents={general?.baseAmountCents}
              currentTaxRate={general?.taxRatePercent}
              currentBookingFeeCents={general?.bookingFeeCents}
              label="Full Vehicle Price"
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
