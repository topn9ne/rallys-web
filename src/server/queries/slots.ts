import { prisma } from "@/lib/prisma";

/** Fetch all available/filling slots from today forward (up to 2 months) */
export async function getAvailableSlots() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoMonthsOut = new Date(today);
  twoMonthsOut.setMonth(twoMonthsOut.getMonth() + 2);

  return prisma.rideSlot.findMany({
    where: {
      date: { gte: today, lte: twoMonthsOut },
      status: { in: ["AVAILABLE", "FILLING"] },
    },
    include: { theme: true, bike: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

/** Fetch a single slot with full details for the booking page */
export async function getSlotById(id: string) {
  return prisma.rideSlot.findUnique({
    where: { id },
    include: {
      theme: true,
      bike: true,
      staffAssignments: { include: { staff: true } },
    },
  });
}

/** Get active addons for a specific ride type and bike */
export async function getAddonsForRideType(
  rideType: "THEME" | "GENERAL",
  bikeId?: string
) {
  return prisma.addOn.findMany({
    where: {
      active: true,
      appliesTo: { in: ["ALL", rideType] },
      ...(bikeId
        ? {
            OR: [
              { bikeRestrictions: { none: {} } },
              { bikeRestrictions: { some: { bikeId } } },
            ],
          }
        : {}),
    },
    orderBy: { displayOrder: "asc" },
  });
}

/** Get active pickup locations */
export async function getPickupLocations() {
  return prisma.pickupLocation.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

/** Validate a discount code for a given booking context */
export async function validateDiscountCode(
  code: string,
  rideType: "THEME" | "GENERAL",
  themeId: string | null,
  customerId: string
) {
  const discount = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase(), active: true },
  });

  if (!discount) return { valid: false, reason: "Invalid code" };
  if (discount.maxUses && discount.usesCount >= discount.maxUses) {
    return { valid: false, reason: "Code has reached its usage limit" };
  }
  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return { valid: false, reason: "Code has expired" };
  }
  if (
    discount.appliesTo === "THEME" && rideType !== "THEME"
  ) return { valid: false, reason: "Code is for theme rides only" };
  if (
    discount.appliesTo === "GENERAL" && rideType !== "GENERAL"
  ) return { valid: false, reason: "Code is for group rides only" };
  if (
    discount.appliesTo === "SPECIFIC_THEME" &&
    discount.themeId !== themeId
  ) return { valid: false, reason: "Code is not valid for this theme" };

  if (discount.firstTimeCustomerOnly) {
    const priorBooking = await prisma.booking.findFirst({
      where: {
        customerId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    });
    if (priorBooking) {
      return { valid: false, reason: "Code is for first-time customers only" };
    }
  }

  // Use generalValue for group rides when set, otherwise fall back to value
  const effectiveValue =
    rideType === "GENERAL" && discount.generalValue != null
      ? discount.generalValue
      : discount.value;

  return { valid: true, discount: { ...discount, value: effectiveValue } };
}
