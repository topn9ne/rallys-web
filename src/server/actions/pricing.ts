"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

const PricingSchema = z.object({
  tier: z.enum(["FAMILY", "FAMILY_ANNUAL", "TEAM", "TEAM_ANNUAL", "DROPIN_SINGLE", "DROPIN_BOTH"]),
  amountDollars: z.coerce.number().positive("Price must be positive"),
  taxRatePercent: z.coerce.number().min(0).max(100),
});

export async function updatePricing(formData: FormData) {
  await requireAdmin();
  const result = PricingSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { tier, amountDollars, taxRatePercent } = result.data;
  await prisma.pricingConfig.create({
    data: {
      tier: tier as any,
      amountCents: Math.round(amountDollars * 100),
      taxRatePercent,
      effectiveFrom: new Date(),
    },
  });

  revalidatePath("/admin/pricing");
  return { success: true };
}

export async function getCurrentPricing() {
  const tiers = ["FAMILY", "TEAM", "DROPIN_SINGLE", "DROPIN_BOTH"] as const;
  const configs = await Promise.all(
    tiers.map((tier) =>
      prisma.pricingConfig.findFirst({
        where: { tier: tier as any },
        orderBy: { effectiveFrom: "desc" },
      })
    )
  );
  return {
    member: configs[0],
    team: configs[1],
    dropinSingle: configs[2],
    dropinBoth: configs[3],
  };
}
