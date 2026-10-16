import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { NotificationConfigTable } from "@/components/admin/NotificationConfigTable";
import { getNotificationConfigs } from "@/server/actions/notifications";
// Types and definitions are in @/lib/notificationDefinitions (plain module, no "use server")
import { Bell } from "@phosphor-icons/react/dist/ssr";

export default async function NotificationsPage() {
  const configs = await getNotificationConfigs();

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
                <Bell size={18} weight="duotone" color="#2B5CE6" />
                Notification Channels
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Toggle email and SMS notifications per event. Transactional staff
                notifications (invites, password resets, shift alerts) are always sent.
              </p>
            </CardHeader>
            <CardBody className="p-0">
              <NotificationConfigTable configs={configs} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
