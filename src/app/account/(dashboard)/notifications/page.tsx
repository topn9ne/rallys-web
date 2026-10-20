export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { NotificationContacts } from "@/components/account/NotificationContacts";
import {
  getNotificationContacts,
  ensurePrimaryContact,
} from "@/server/actions/notificationContacts";

export const metadata = { title: "Notifications | Rally's Indoor Training" };

export default async function NotificationsPage() {
  await requireUser("/account/notifications");

  await ensurePrimaryContact();
  const contacts = await getNotificationContacts();

  return <NotificationContacts contacts={contacts} />;
}
