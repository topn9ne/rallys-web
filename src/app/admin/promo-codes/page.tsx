export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { PromoCodeRow } from "@/components/admin/PromoCodeRow";

export default async function PromoCodesPage() {
  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <h2 className="font-extrabold text-brand-blue">Create Promo Code</h2>
          </CardHeader>
          <CardBody>
            <PromoCodeForm />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-extrabold text-brand-blue">
              Active Codes ({codes.filter((c: typeof codes[number]) => c.isActive).length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {codes.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">
                No promo codes yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {codes.map((code: typeof codes[number]) => (
                  <PromoCodeRow
                    key={code.id}
                    code={{
                      id: code.id,
                      code: code.code,
                      description: code.description,
                      discountType: code.discountType,
                      discountAmount: code.discountAmount,
                      maxUses: code.maxUses,
                      currentUses: code.currentUses,
                      isActive: code.isActive,
                      validFrom: code.validFrom?.toISOString() ?? null,
                      validUntil: code.validUntil?.toISOString() ?? null,
                    }}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
