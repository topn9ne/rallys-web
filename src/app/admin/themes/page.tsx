import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ThemeForm } from "@/components/admin/ThemeForm";
import { ThemeList } from "@/components/admin/ThemeList";
import { Confetti, PlusCircle } from "@phosphor-icons/react/dist/ssr";

async function getThemes() {
  return prisma.theme.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { rideSlots: true } } },
  });
}

export default async function ThemesPage() {
  const themes = await getThemes();

  return (
    <div>
      <AdminPageHeader
        title="Themed Rides"
        count={themes.length}
        icon={<Confetti size={18} weight="regular" color="#ffffff" />}
      />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <Confetti size={18} weight="duotone" color="#2B5CE6" />
              All Themes ({themes.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <ThemeList themes={themes} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <PlusCircle size={18} weight="duotone" color="#2B5CE6" />
              Add Theme
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <ThemeForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
