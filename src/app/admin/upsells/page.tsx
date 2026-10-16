import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { UpsellItemForm } from "@/components/admin/UpsellItemForm";
import { UpsellItemToggle } from "@/components/admin/UpsellItemToggle";
import { UpsellItemDeleteButton } from "@/components/admin/UpsellItemDeleteButton";
import { BikeShopQr } from "@/components/admin/BikeShopQr";
import { ShoppingCart, PlusCircle, QrCode } from "@phosphor-icons/react/dist/ssr";
import { formatCents } from "@/lib/utils";

export default async function UpsellsPage() {
  const [items, bikes] = await Promise.all([
    prisma.inRideUpsellItem.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.bike.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Items list */}
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <ShoppingCart size={18} weight="duotone" color="#2B5CE6" />
              In-Ride Items ({items.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <Badge variant={item.active ? "green" : "gray"}>
                        {item.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
                    )}
                    <p className="mt-0.5 text-sm text-gray-600">
                      {formatCents(item.priceCents)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UpsellItemToggle id={item.id} active={item.active} />
                    <UpsellItemDeleteButton id={item.id} name={item.name} />
                  </div>
                </li>
              ))}
              {items.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-gray-500">
                  No in-ride items yet.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        {/* Add item form */}
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <PlusCircle size={18} weight="duotone" color="#2B5CE6" />
              Add Item
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <UpsellItemForm />
          </CardBody>
        </Card>
      </div>

      {/* Per-bike QR codes */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
            <QrCode size={18} weight="duotone" color="#2B5CE6" />
            Vehicle QR Codes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Print and mount one per vehicle. Customers scan to order extras and tip their guide.
          </p>
        </CardHeader>
        <CardBody>
          {bikes.length === 0 ? (
            <p className="text-sm text-gray-500">No active vehicles found.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {bikes.map((bike) => (
                <BikeShopQr key={bike.id} bikeId={bike.id} bikeName={bike.name} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
