import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BikeForm } from "@/components/admin/BikeForm";
import { BikeStatusToggle } from "@/components/admin/BikeStatusToggle";
import { BikeDeleteButton } from "@/components/admin/BikeDeleteButton";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { Bicycle, PlusCircle } from "@phosphor-icons/react/dist/ssr";

export default async function FleetPage() {
  const bikes = await prisma.bike.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Bike list */}
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <Bicycle size={18} weight="duotone" color="#2B5CE6" />
              Fleet ({bikes.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100">
              {bikes.map((bike) => (
                <li key={bike.id} className="flex items-start justify-between px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{bike.name}</p>
                      <Badge variant={bike.status === "ACTIVE" ? "green" : "red"}>
                        {bike.status === "ACTIVE" ? "Active" : "Out of Service"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Up to {bike.passengerCap} passengers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <BikeStatusToggle bike={bike} />
                    <BikeDeleteButton id={bike.id} name={bike.name} />
                  </div>
                </li>
              ))}
              {bikes.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-gray-500">
                  No vehicles yet. Add your first vehicle.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        {/* Add bike form */}
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <PlusCircle size={18} weight="duotone" color="#2B5CE6" />
              Add Vehicle
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <BikeForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
