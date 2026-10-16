import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateMemberProfile } from "@/server/actions/member";

export default async function AccountProfilePage() {
  const user = await requireUser();
  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true },
  });

  if (!member) return null;

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profile</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form action={updateMemberProfile} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            defaultValue={member.name}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
              {member.email}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Email cannot be changed here.
            </p>
          </div>
          <Input
            label="Phone number"
            name="phone"
            type="tel"
            defaultValue={member.phone ?? ""}
            placeholder="+1 (555) 000-0000"
          />
          <Button type="submit" variant="primary" className="w-full">
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
}
