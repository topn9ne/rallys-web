"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";
import {
  NOTIFICATION_DEFINITIONS,
  type NotificationTrigger,
  type NotificationChannel,
  type NotificationAudience,
  type NotificationConfigMap,
  type ConfigKey,
} from "@/lib/notificationDefinitions";

/**
 * Returns a flat map of all defined notification rows → enabled boolean.
 * Rows with no DB record default to true (all enabled by default).
 */
export async function getNotificationConfigs(): Promise<NotificationConfigMap> {
  await requireAdmin();
  const rows = await prisma.notificationConfig.findMany();

  const dbMap = new Map<string, boolean>();
  for (const row of rows) {
    dbMap.set(`${row.trigger}:${row.channel}:${row.audience}`, row.enabled);
  }

  const result = {} as NotificationConfigMap;
  for (const def of NOTIFICATION_DEFINITIONS) {
    for (const row of def.rows) {
      const key = `${def.trigger}:${row.channel}:${row.audience}` as ConfigKey;
      result[key] = dbMap.get(key) ?? true;
    }
  }

  return result;
}

/**
 * Upserts a single notification config row.
 * Validates trigger/channel/audience against NOTIFICATION_DEFINITIONS.
 */
export async function setNotificationEnabled(
  trigger: NotificationTrigger,
  channel: NotificationChannel,
  audience: NotificationAudience,
  enabled: boolean
): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  const def = NOTIFICATION_DEFINITIONS.find((d) => d.trigger === trigger);
  if (!def) return { error: "Unknown trigger" };
  const rowDef = def.rows.find((r) => r.channel === channel && r.audience === audience);
  if (!rowDef) return { error: "Unknown channel/audience combination for this trigger" };

  await prisma.notificationConfig.upsert({
    where: { trigger_channel_audience: { trigger, channel, audience } },
    update: { enabled },
    create: { trigger, channel, audience, enabled },
  });

  revalidatePath("/admin/notifications");
  return { success: true };
}
