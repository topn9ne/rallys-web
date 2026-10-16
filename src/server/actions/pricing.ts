"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { RideType } from "@prisma/client";
import { requireAdmin } from "@/lib/authGuard";

const PricingSchema = z.object({
  rideType: z.nativeEnum(RideType),
  baseAmountDollars: z.coerce.number().positive("Price must be positive"),
  taxRatePercent: z.coerce.number().min(0).max(100),
  bookingFeeDollars: z.coerce.number().min(0),
});

export async function updatePricing(formData: FormData) {
  await requireAdmin();
  const result = PricingSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { rideType, baseAmountDollars, taxRatePercent, bookingFeeDollars } = result.data;
  await prisma.pricingConfig.create({
    data: {
      rideType,
      baseAmountCents: Math.round(baseAmountDollars * 100),
      taxRatePercent,
      bookingFeeCents: Math.round(bookingFeeDollars * 100),
      effectiveFrom: new Date(),
    },
  });

  revalidatePath("/admin/pricing");
  return { success: true };
}

export async function getCurrentPricing() {
  const [theme, general] = await Promise.all([
    prisma.pricingConfig.findFirst({
      where: { rideType: "THEME" },
      orderBy: { effectiveFrom: "desc" },
    }),
    prisma.pricingConfig.findFirst({
      where: { rideType: "GENERAL" },
      orderBy: { effectiveFrom: "desc" },
    }),
  ]);
  return { theme, general };
}
