"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DiscountType, DiscountAppliesTo } from "@prisma/client";
import { requireAdmin } from "@/lib/authGuard";

const DiscountSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  type: z.nativeEnum(DiscountType),
  value: z.coerce.number().positive("Value must be positive"),
  generalValue: z.coerce.number().positive().optional().or(z.literal("")),
  appliesTo: z.nativeEnum(DiscountAppliesTo),
  themeId: z.string().optional(),
  maxUses: z.coerce.number().int().positive().optional().or(z.literal("")),
  firstTimeCustomerOnly: z.coerce.boolean().default(false),
  expiresAt: z.string().optional(),
});

export async function createDiscountCode(formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData);
  const result = DiscountSchema.safeParse(raw);
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { maxUses, expiresAt, value, generalValue, type, ...rest } = result.data;

  // For PERCENT_OFF, value is 0-100; for FIXED_OFF, convert dollars to cents
  const toStoredValue = (v: number) =>
    type === "PERCENT_OFF" ? v : Math.round(v * 100);

  await prisma.discountCode.create({
    data: {
      ...rest,
      type,
      value: toStoredValue(value),
      generalValue: generalValue ? toStoredValue(generalValue) : null,
      maxUses: maxUses || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function toggleDiscountCode(id: string, active: boolean) {
  await requireAdmin();
  await prisma.discountCode.update({ where: { id }, data: { active } });
  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function deleteDiscountCode(id: string) {
  await requireAdmin();
  try {
    await prisma.discountCode.delete({ where: { id } });
    revalidatePath("/admin/discounts");
    return { success: true as const };
  } catch {
    return { error: "Failed to delete." };
  }
}
