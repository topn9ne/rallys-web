"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { RideType } from "@prisma/client";
import { requireAdmin } from "@/lib/authGuard";

const SlotSchema = z.object({
  bikeId: z.string().min(1, "Bike is required"),
  rideType: z.nativeEnum(RideType),
  themeId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
});

export async function createSlot(formData: FormData) {
  await requireAdmin();
  const result = SlotSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { bikeId, rideType, themeId, date, startTime } = result.data;

  // Parse date + time into a full DateTime (treat as operating timezone)
  const startDateTime = new Date(`${date}T${startTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours
  const bufferEnd = new Date(endDateTime.getTime() + 1 * 60 * 60 * 1000); // +1 hour buffer

  if (rideType === "THEME" && !themeId) {
    return { error: { themeId: ["Theme is required for Theme Rides"] } };
  }

  await prisma.rideSlot.create({
    data: {
      bikeId,
      rideType,
      themeId: rideType === "THEME" ? themeId : null,
      date: new Date(date),
      startTime: startDateTime,
      endTime: endDateTime,
      bufferEndTime: bufferEnd,
      seatsTotal: 14,
      seatsBooked: 0,
      status: "AVAILABLE",
    },
  });

  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function createBulkSlots(formData: FormData) {
  await requireAdmin();
  const bikeId = formData.get("bikeId") as string;
  const rideType = formData.get("rideType") as RideType;
  const themeId = formData.get("themeId") as string | null;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const startTime = formData.get("startTime") as string;
  const daysOfWeek = formData.getAll("daysOfWeek").map(Number);

  if (!bikeId || !rideType || !startDate || !endDate || !startTime || daysOfWeek.length === 0) {
    return { error: "All fields are required and at least one day must be selected." };
  }
  if (rideType === "THEME" && !themeId) {
    return { error: "Theme is required for Theme Rides." };
  }

  const { generateDateRange } = await import("@/lib/utils");
  const dates = generateDateRange(new Date(startDate), new Date(endDate), daysOfWeek);

  let created = 0;
  const skipped: { date: string; reason: string }[] = [];

  for (const date of dates) {
    const dateStr = date.toISOString().split("T")[0];
    const startDateTime = new Date(`${dateStr}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
    const bufferEnd = new Date(endDateTime.getTime() + 1 * 60 * 60 * 1000);

    // Conflict check: same bike, overlapping time window
    const conflict = await prisma.rideSlot.findFirst({
      where: {
        bikeId,
        status: { notIn: ["CANCELLED"] },
        date: date,
        AND: [
          { startTime: { lt: bufferEnd } },
          { bufferEndTime: { gt: startDateTime } },
        ],
      },
    });

    if (conflict) {
      skipped.push({ date: dateStr, reason: "Conflicts with existing ride" });
      continue;
    }

    await prisma.rideSlot.create({
      data: {
        bikeId,
        rideType,
        themeId: rideType === "THEME" ? themeId : null,
        date,
        startTime: startDateTime,
        endTime: endDateTime,
        bufferEndTime: bufferEnd,
        seatsTotal: 14,
        seatsBooked: 0,
        status: "AVAILABLE",
      },
    });
    created++;
  }

  revalidatePath("/admin/schedule");
  return { success: true, created, skipped };
}

export async function cancelSlot(id: string) {
  await requireAdmin();
  await prisma.rideSlot.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function restoreSlot(id: string) {
  await requireAdmin();
  await prisma.rideSlot.update({
    where: { id },
    data: { status: "AVAILABLE" },
  });
  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function blockSlot(id: string, reason?: string) {
  await requireAdmin();
  await prisma.rideSlot.update({
    where: { id },
    data: { status: "BLOCKED", blockReason: reason ?? null, blockedAt: new Date() },
  });
  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function unblockSlot(id: string) {
  await requireAdmin();
  await prisma.rideSlot.update({
    where: { id },
    data: { status: "AVAILABLE", blockReason: null, blockedAt: null },
  });
  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function deleteSlot(id: string) {
  await requireAdmin();
  const slot = await prisma.rideSlot.findUnique({ where: { id }, select: { status: true } });
  // Only block deletion if ride is active and has bookings
  if (slot?.status !== "CANCELLED") {
    const count = await prisma.booking.count({ where: { slotId: id } });
    if (count > 0) {
      return { error: "Cannot delete a ride with existing bookings. Use Cancel instead." };
    }
  }
  await prisma.rideSlot.delete({ where: { id } });
  revalidatePath("/admin/schedule");
  return { success: true };
}
