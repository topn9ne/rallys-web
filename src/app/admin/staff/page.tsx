import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StaffForm } from "@/components/admin/StaffForm";
import { StaffList } from "@/components/admin/StaffList";
import { Users, UserPlus } from "@phosphor-icons/react/dist/ssr";

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Staff"
        count={staff.length}
        icon={<Users size={18} weight="regular" color="#ffffff" />}
      />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <Users size={18} weight="duotone" color="#2B5CE6" />
              Team Members ({staff.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <StaffList staff={staff} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <UserPlus size={18} weight="duotone" color="#2B5CE6" />
              Add Staff Member
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <StaffForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
