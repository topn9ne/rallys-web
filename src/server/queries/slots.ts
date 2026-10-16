import { prisma } from "@/lib/prisma";

export async function getAllUpcomingSlots() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const advanceDays = 7;
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + advanceDays);

  return prisma.cageSlot.findMany({
    where: {
      date: { gte: today, lte: maxDate },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { lane: "asc" }],
  });
}

export async function getSlotById(id: string) {
  return prisma.cageSlot.findUnique({
    where: { id },
  });
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
