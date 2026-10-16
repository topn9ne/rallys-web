"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

const SlotSchema = z.object({
  lane: z.enum(["A", "B"]),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
});

export async function createSlot(formData: FormData) {
  await requireAdmin();
  const result = SlotSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { lane, date, startTime } = result.data;

  const startDateTime = new Date(`${date}T${startTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour slots

  const conflict = await prisma.cageSlot.findFirst({
    where: {
      lane: lane as any,
      date: new Date(date),
      status: { not: "BLOCKED" },
      AND: [
        { startTime: { lt: endDateTime } },
        { endTime: { gt: startDateTime } },
      ],
    },
  });

  if (conflict) {
    return { error: { startTime: ["Conflicts with an existing slot on this lane"] } };
  }

  await prisma.cageSlot.create({
    data: {
      lane: lane as any,
      date: new Date(date),
      startTime: startDateTime,
      endTime: endDateTime,
      status: "AVAILABLE",
    },
  });

  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function createBulkSlots(formData: FormData) {
  await requireAdmin();
  const lanes = formData.getAll("lanes") as string[];
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const slotDuration = 30; // minutes
  const daysOfWeek = formData.getAll("daysOfWeek").map(Number);

  if (!startDate || !endDate || !startTime || !endTime || lanes.length === 0 || daysOfWeek.length === 0) {
    return { error: "All fields are required." };
  }

  const { generateDateRange } = await import("@/lib/utils");
  const dates = generateDateRange(new Date(startDate), new Date(endDate), daysOfWeek);

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const dayStartMinutes = startH * 60 + startM;
  const dayEndMinutes = endH * 60 + endM;

  let created = 0;
  let skipped = 0;

  for (const date of dates) {
    const dateStr = date.toISOString().split("T")[0];

    for (const lane of lanes) {
      let current = dayStartMinutes;
      while (current + slotDuration <= dayEndMinutes) {
        const slotStart = new Date(`${dateStr}T${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}:00`);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

        const conflict = await prisma.cageSlot.findFirst({
          where: {
            lane: lane as any,
            date,
            status: { not: "BLOCKED" },
            AND: [
              { startTime: { lt: slotEnd } },
              { endTime: { gt: slotStart } },
            ],
          },
        });

        if (conflict) {
          skipped++;
        } else {
          await prisma.cageSlot.create({
            data: {
              lane: lane as any,
              date,
              startTime: slotStart,
              endTime: slotEnd,
              status: "AVAILABLE",
            },
          });
          created++;
        }

        current += slotDuration;
      }
    }
  }

  revalidatePath("/admin/schedule");
  return { success: true, created, skipped };
}

export async function blockSlot(id: string, reason?: string) {
  await requireAdmin();
  await prisma.cageSlot.update({
    where: { id },
    data: { status: "BLOCKED", blockReason: reason ?? null },
  });
  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function unblockSlot(id: string) {
  await requireAdmin();
  await prisma.cageSlot.update({
    where: { id },
    data: { status: "AVAILABLE", blockReason: null },
  });
  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function deleteSlot(id: string) {
  await requireAdmin();
  const bookingCount = await prisma.booking.count({
    where: { OR: [{ slotIdA: id }, { slotIdB: id }] },
  });
  if (bookingCount > 0) {
    return { error: "Cannot delete a slot with existing bookings. Block it instead." };
  }
  await prisma.cageSlot.delete({ where: { id } });
  revalidatePath("/admin/schedule");
  return { success: true };
}
