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

const SETTING_KEY = "notification_config";

async function loadConfigFromDb(): Promise<Record<string, boolean>> {
  const row = await prisma.siteSetting.findUnique({
    where: { key: SETTING_KEY },
  });
  if (!row) return {};
  try {
    return JSON.parse(row.value) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export async function getNotificationConfigs(): Promise<NotificationConfigMap> {
  await requireAdmin();
  const dbMap = await loadConfigFromDb();

  const result = {} as NotificationConfigMap;
  for (const def of NOTIFICATION_DEFINITIONS) {
    for (const row of def.rows) {
      const key = `${def.trigger}:${row.channel}:${row.audience}` as ConfigKey;
      result[key] = dbMap[key] ?? true;
    }
  }

  return result;
}

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

  const key = `${trigger}:${channel}:${audience}`;
  const existing = await loadConfigFromDb();
  existing[key] = enabled;

  await prisma.siteSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(existing) },
    create: { key: SETTING_KEY, value: JSON.stringify(existing) },
  });

  revalidatePath("/admin/notifications");
  return { success: true };
}
