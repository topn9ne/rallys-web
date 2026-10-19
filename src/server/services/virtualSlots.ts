import { prisma } from "@/lib/prisma";
import type { CageSlot, Lane } from "@prisma/client";

export interface SlotInfo {
  id: string;
  lane: Lane;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED" | "COMPLETED";
  isVirtual: boolean;
  blockReason?: string | null;
  booking?: {
    id: string;
    memberName?: string | null;
    guestName?: string | null;
    bookingType: string;
    status: string;
  } | null;
}

const SLOT_DURATION = 60;
const LANES: Lane[] = ["A", "B"];

export function parseVirtualSlotId(id: string) {
  const match = id.match(/^vs_(\d{4}-\d{2}-\d{2})_(\d{4})_([AB])$/);
  if (!match) return null;
  return {
    date: match[1],
    time: match[2],
    lane: match[3] as Lane,
  };
}

export function buildVirtualSlotId(dateStr: string, hh: string, mm: string, lane: Lane) {
  return `vs_${dateStr}_${hh}${mm}_${lane}`;
}

export function pairedVirtualSlotId(id: string): string | null {
  const parsed = parseVirtualSlotId(id);
  if (!parsed) return null;
  const otherLane: Lane = parsed.lane === "A" ? "B" : "A";
  return `vs_${parsed.date}_${parsed.time}_${otherLane}`;
}

export async function generateVirtualSlots(options: {
  startDate: Date;
  endDate: Date;
}): Promise<SlotInfo[]> {
  const hours = await prisma.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  const hoursByDay = new Map(hours.map((h) => [h.dayOfWeek, h]));

  const existingSlots = await prisma.cageSlot.findMany({
    where: {
      date: { gte: options.startDate, lte: options.endDate },
    },
    include: {
      bookingsA: {
        where: { status: { in: ["CONFIRMED", "PENDING"] } },
        include: { member: { select: { name: true } } },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { lane: "asc" }],
  });

  const existingMap = new Map<string, (typeof existingSlots)[0]>();
  for (const slot of existingSlots) {
    const dateStr = slot.date.toISOString().split("T")[0];
    const timeStr = slot.startTime.toISOString();
    existingMap.set(`${slot.lane}_${dateStr}_${timeStr}`, slot);
  }

  const result: SlotInfo[] = [];
  const current = new Date(options.startDate);

  while (current <= options.endDate) {
    const dow = current.getUTCDay();
    const dayHours = hoursByDay.get(dow);
    const dateStr = current.toISOString().split("T")[0];

    if (dayHours && dayHours.isOpen) {
      const [openH, openM] = dayHours.openTime.split(":").map(Number);
      const [closeH, closeM] = dayHours.closeTime.split(":").map(Number);
      const dayStart = openH * 60 + openM;
      const dayEnd = closeH * 60 + closeM;

      for (const lane of LANES) {
        let mins = dayStart;
        while (mins + SLOT_DURATION <= dayEnd) {
          const hh = String(Math.floor(mins / 60)).padStart(2, "0");
          const mm = String(mins % 60).padStart(2, "0");
          const startTime = new Date(`${dateStr}T${hh}:${mm}:00`);
          const endTime = new Date(startTime.getTime() + SLOT_DURATION * 60_000);

          const key = `${lane}_${dateStr}_${startTime.toISOString()}`;
          const existing = existingMap.get(key);

          if (existing) {
            const booking = existing.bookingsA?.[0];
            result.push({
              id: existing.id,
              lane: existing.lane,
              date: existing.date,
              startTime: existing.startTime,
              endTime: existing.endTime,
              status: existing.status as SlotInfo["status"],
              isVirtual: false,
              blockReason: existing.blockReason,
              booking: booking
                ? {
                    id: booking.id,
                    memberName: booking.member?.name ?? null,
                    guestName: booking.guestName,
                    bookingType: booking.bookingType,
                    status: booking.status,
                  }
                : null,
            });
          } else {
            result.push({
              id: buildVirtualSlotId(dateStr, hh, mm, lane),
              lane,
              date: new Date(`${dateStr}T00:00:00`),
              startTime,
              endTime,
              status: "AVAILABLE",
              isVirtual: true,
            });
          }

          mins += SLOT_DURATION;
        }
      }
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
}

export async function resolveSlot(
  slotId: string
): Promise<CageSlot | null> {
  const parsed = parseVirtualSlotId(slotId);
  if (!parsed) {
    return prisma.cageSlot.findUnique({ where: { id: slotId } });
  }

  const { date, time, lane } = parsed;
  const dateObj = new Date(`${date}T00:00:00`);
  const hh = time.substring(0, 2);
  const mm = time.substring(2, 4);
  const startTime = new Date(`${date}T${hh}:${mm}:00`);
  const endTime = new Date(startTime.getTime() + SLOT_DURATION * 60_000);

  const dow = dateObj.getUTCDay();
  const dayHours = await prisma.operatingHours.findFirst({
    where: { dayOfWeek: dow },
  });
  if (!dayHours || !dayHours.isOpen) return null;

  const slotMins = parseInt(hh) * 60 + parseInt(mm);
  const [openH, openM] = dayHours.openTime.split(":").map(Number);
  const [closeH, closeM] = dayHours.closeTime.split(":").map(Number);
  if (slotMins < openH * 60 + openM || slotMins + SLOT_DURATION > closeH * 60 + closeM) {
    return null;
  }

  const existing = await prisma.cageSlot.findFirst({
    where: { lane: lane as any, date: dateObj, startTime },
  });
  if (existing) return existing;

  return {
    id: slotId,
    lane: lane as any,
    date: dateObj,
    startTime,
    endTime,
    status: "AVAILABLE" as any,
    blockReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function materializeSlot(
  slotId: string,
  status: "BOOKED" | "BLOCKED" = "BOOKED",
  blockReason?: string
): Promise<CageSlot> {
  const parsed = parseVirtualSlotId(slotId);
  if (!parsed) {
    return prisma.cageSlot.update({
      where: { id: slotId },
      data: { status, ...(blockReason ? { blockReason } : {}) },
    });
  }

  const { date, time, lane } = parsed;
  const dateObj = new Date(`${date}T00:00:00`);
  const hh = time.substring(0, 2);
  const mm = time.substring(2, 4);
  const startTime = new Date(`${date}T${hh}:${mm}:00`);
  const endTime = new Date(startTime.getTime() + SLOT_DURATION * 60_000);

  const existing = await prisma.cageSlot.findFirst({
    where: { lane: lane as any, date: dateObj, startTime },
  });

  if (existing) {
    if (existing.status !== "AVAILABLE") {
      throw new Error("Slot is no longer available");
    }
    return prisma.cageSlot.update({
      where: { id: existing.id },
      data: { status, ...(blockReason ? { blockReason } : {}) },
    });
  }

  return prisma.cageSlot.create({
    data: {
      lane: lane as any,
      date: dateObj,
      startTime,
      endTime,
      status,
      ...(blockReason ? { blockReason } : {}),
    },
  });
}

export function getBookingWindow(userType: "member" | "dropin" | "admin") {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(today);
  switch (userType) {
    case "member":
      endDate.setUTCDate(endDate.getUTCDate() + 30);
      break;
    case "dropin":
      endDate.setUTCDate(endDate.getUTCDate() + 15);
      break;
    case "admin":
      endDate.setUTCDate(endDate.getUTCDate() + 90);
      break;
  }

  return { startDate: today, endDate };
}
