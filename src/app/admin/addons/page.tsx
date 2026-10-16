import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCents } from "@/lib/utils";
import { AddonForm } from "@/components/admin/AddonForm";
import { AddonToggle } from "@/components/admin/AddonToggle";
import { AddonDeleteButton } from "@/components/admin/AddonDeleteButton";
import { AddonBikeSelector } from "@/components/admin/AddonBikeSelector";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { Star, PlusCircle } from "@phosphor-icons/react/dist/ssr";

export default async function AddonsPage() {
  const [addons, bikes] = await Promise.all([
    prisma.addOn.findMany({
      orderBy: { displayOrder: "asc" },
      include: { bikeRestrictions: { select: { bikeId: true } } },
    }),
    prisma.bike.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);

  const appliesLabel: Record<string, string> = {
    ALL: "All rides",
    THEME: "Theme rides only",
    GENERAL: "Group rides only",
  };

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <Star size={18} weight="duotone" color="#2B5CE6" />
              Add-ons ({addons.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100">
              {addons.map((addon) => {
                const restrictedBikeIds = addon.bikeRestrictions.map((r) => r.bikeId);
                const bikeLabel =
                  restrictedBikeIds.length === 0
                    ? "All vehicles"
                    : bikes
                        .filter((b) => restrictedBikeIds.includes(b.id))
                        .map((b) => b.name)
                        .join(", ");

                return (
                  <li key={addon.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{addon.name}</p>
                          <Badge variant={addon.active ? "green" : "gray"}>
                            {addon.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {addon.description && (
                          <p className="mt-0.5 text-sm text-gray-500">{addon.description}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-600">
                          {formatCents(addon.priceCents)} · {appliesLabel[addon.appliesTo]}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">Bikes: {bikeLabel}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AddonToggle addon={addon} />
                        <AddonDeleteButton id={addon.id} name={addon.name} />
                      </div>
                    </div>
                    {bikes.length > 0 && (
                      <AddonBikeSelector
                        addonId={addon.id}
                        bikes={bikes}
                        selectedBikeIds={restrictedBikeIds}
                      />
                    )}
                  </li>
                );
              })}
              {addons.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-gray-500">
                  No add-ons yet.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <PlusCircle size={18} weight="duotone" color="#2B5CE6" />
              Add Add-on
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <AddonForm bikes={bikes} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
