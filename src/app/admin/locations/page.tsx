import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LocationForm } from "@/components/admin/LocationForm";
import { LocationToggle } from "@/components/admin/LocationToggle";
import { LocationDeleteButton } from "@/components/admin/LocationDeleteButton";
import { ArrowSquareOut, MapPin, PlusCircle } from "@phosphor-icons/react/dist/ssr";
import { SettingsTabs } from "@/components/admin/SettingsTabs";

export default async function LocationsPage() {
  const locations = await prisma.pickupLocation.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <MapPin size={18} weight="duotone" color="#2B5CE6" />
              Locations ({locations.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100">
              {locations.map((loc) => (
                <li key={loc.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{loc.name}</p>
                      {!loc.active && <Badge variant="gray">Inactive</Badge>}
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
                    >
                      {loc.address}
                      <ArrowSquareOut size={13} weight="duotone" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <LocationToggle id={loc.id} active={loc.active} />
                    <LocationDeleteButton id={loc.id} name={loc.name} />
                  </div>
                </li>
              ))}
              {locations.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-gray-500">
                  No locations yet.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <PlusCircle size={18} weight="duotone" color="#2B5CE6" />
              Add Location
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <LocationForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
