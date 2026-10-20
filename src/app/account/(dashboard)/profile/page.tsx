export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateMemberProfile } from "@/server/actions/member";
import { PasswordReset } from "@/components/account/PasswordReset";

export const metadata = { title: "Profile | Rally's Indoor Training" };

export default async function AccountProfilePage() {
  const user = await requireUser("/account/profile");
  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, phone: true, contactEmail: true },
  });

  if (!member) return null;

  return (
    <div className="max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">Your account info.</p>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
              required
            />
            <p className="text-xs text-gray-400 -mt-2">
              Required for door code delivery.
            </p>
            <Input
              label="Notification email"
              name="contactEmail"
              type="email"
              defaultValue={member.contactEmail ?? ""}
              placeholder={member.email}
            />
            <p className="text-xs text-gray-400 -mt-2">
              Optional. Booking confirmations and receipts go here instead of your login email.
            </p>
            <Button type="submit" variant="primary" className="w-full">
              Save changes
            </Button>
          </form>
        </div>
      </div>

      <PasswordReset />
    </div>
  );
}
