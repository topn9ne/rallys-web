export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopUpsellForm } from "@/components/booking/ShopUpsellForm";
import { getActiveSlotForBike } from "@/server/actions/shopCheckout";
import type { Staff } from "@prisma/client";

function getDriverLabel(staff: Staff | null): string {
  if (!staff) return "Add Gratuity";
  return `Tip ${staff.name}`;
}

interface Props {
  params: Promise<{ bikeId: string }>;
}

export default async function ShopPage({ params }: Props) {
  const { bikeId } = await params;

  const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
  if (!bike) return notFound();

  const [items, activeSlot] = await Promise.all([
    prisma.inRideUpsellItem.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    }),
    getActiveSlotForBike(bikeId),
  ]);

  const driver = activeSlot?.staffAssignments?.[0]?.staff ?? null;
  const driverLabel = getDriverLabel(driver);

  return (
    <div className="page-wrapper bg-gray-900 text-white">
      <div className="bg-brand-blue px-6 py-8 text-center">
        <div className="text-4xl mb-2">🍺</div>
        <h1 className="text-2xl font-bold">Railside Extras</h1>
        <p className="mt-1 text-blue-200 text-sm">{bike.name}</p>
      </div>

      <div className="mx-auto max-w-sm px-4 py-6">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">
            No items available right now.
          </p>
        ) : (
          <ShopUpsellForm bikeId={bikeId} items={items} driverLabel={driverLabel} />
        )}
      </div>
    </div>
  );
}
