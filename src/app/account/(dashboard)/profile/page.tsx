import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateCustomerProfile } from "@/server/actions/customer";

export default async function AccountProfilePage() {
  const session = await auth();
  const customer = await prisma.customer.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, phone: true, notificationSms: true },
  });

  if (!customer) return null;

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profile</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form action={updateCustomerProfile} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            defaultValue={customer.name}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
              {customer.email}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Email cannot be changed here.
            </p>
          </div>
          <Input
            label="Phone number"
            name="phone"
            type="tel"
            defaultValue={customer.phone ?? ""}
            placeholder="+1 (555) 000-0000"
          />
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
            <input
              type="checkbox"
              id="notificationSms"
              name="notificationSms"
              defaultChecked={customer.notificationSms}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <label htmlFor="notificationSms" className="text-sm">
              <span className="font-medium text-gray-900">SMS notifications</span>
              <p className="text-gray-500">
                Receive ride reminders and updates via text message.
              </p>
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
}
