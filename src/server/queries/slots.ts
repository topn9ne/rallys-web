import { prisma } from "@/lib/prisma";
import {
  generateVirtualSlots,
  getBookingWindow,
  resolveSlot,
  type SlotInfo,
} from "@/server/services/virtualSlots";

export async function getAllUpcomingSlots(
  userType: "member" | "dropin" | "admin" = "dropin"
): Promise<SlotInfo[]> {
  const { startDate, endDate } = getBookingWindow(userType);
  return generateVirtualSlots({ startDate, endDate });
}

export async function getSlotById(id: string) {
  return resolveSlot(id);
}

export async function getSlotPairForTime(date: Date, startTime: Date) {
  return prisma.cageSlot.findMany({
    where: {
      date,
      startTime,
      status: "AVAILABLE",
    },
    orderBy: { lane: "asc" },
  });
}

export async function getOperatingHours() {
  return prisma.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function getActivePricing() {
  const prices = await prisma.pricingConfig.findMany({
    orderBy: { effectiveFrom: "desc" },
  });
  // Latest record per tier
  const latest = new Map<string, (typeof prices)[0]>();
  for (const p of prices) {
    if (!latest.has(p.tier)) {
      latest.set(p.tier, p);
    }
  }
  return Object.fromEntries(latest);
}

export async function getSiteSettings() {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
}
