"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

interface HoursUpdate {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export async function updateOperatingHours(updates: HoursUpdate[]) {
  await requireAdmin();

  for (const u of updates) {
    if (u.dayOfWeek < 0 || u.dayOfWeek > 6) continue;

    const id = `hours-${u.dayOfWeek}`;
    await prisma.operatingHours.upsert({
      where: { id },
      update: {
        isOpen: u.isOpen,
        openTime: u.openTime,
        closeTime: u.closeTime,
      },
      create: {
        id,
        dayOfWeek: u.dayOfWeek,
        isOpen: u.isOpen,
        openTime: u.openTime,
        closeTime: u.closeTime,
      },
    });
  }

  revalidatePath("/admin/schedule");
  revalidatePath("/book");
  return { success: true };
}

export async function getOperatingHoursAction() {
  return prisma.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
}
