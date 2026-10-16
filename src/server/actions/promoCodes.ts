"use server";

import { revalidatePath } from "next/cache";
import { getUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DiscountType } from "@prisma/client";

export async function createPromoCode(formData: FormData) {
  const user = await getUser();
  if (!user || !(await isAdmin())) return { error: "Unauthorized." };

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return { error: "Code is required." };
  if (!/^[A-Z0-9_-]{2,20}$/.test(code)) {
    return { error: "Code must be 2–20 characters: letters, numbers, hyphens, underscores." };
  }

  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) return { error: `Code "${code}" already exists.` };

  const discountType = formData.get("discountType") as DiscountType;
  if (!["PERCENT", "FIXED"].includes(discountType)) {
    return { error: "Invalid discount type." };
  }

  const discountAmount = parseInt(formData.get("discountAmount") as string, 10);
  if (isNaN(discountAmount) || discountAmount <= 0) {
    return { error: "Discount amount must be a positive number." };
  }

  if (discountType === "PERCENT" && discountAmount > 100) {
    return { error: "Percentage discount cannot exceed 100." };
  }

  const description = (formData.get("description") as string)?.trim() || null;
  const maxUsesRaw = (formData.get("maxUses") as string)?.trim();
  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw, 10) : null;
  const validFrom = (formData.get("validFrom") as string)?.trim() || null;
  const validUntil = (formData.get("validUntil") as string)?.trim() || null;

  await prisma.promoCode.create({
    data: {
      code,
      description,
      discountType,
      discountAmount,
      maxUses,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: true,
    },
  });

  revalidatePath("/admin/promo-codes");
  return { success: true };
}

export async function togglePromoCode(formData: FormData) {
  const user = await getUser();
  if (!user || !(await isAdmin())) return { error: "Unauthorized." };

  const id = formData.get("id") as string;
  const code = await prisma.promoCode.findUnique({ where: { id } });
  if (!code) return { error: "Promo code not found." };

  await prisma.promoCode.update({
    where: { id },
    data: { isActive: !code.isActive },
  });

  revalidatePath("/admin/promo-codes");
  return { success: true };
}

export async function validatePromoCode(code: string) {
  if (!code) return { error: "No code provided." };

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!promo || !promo.isActive) {
    return { error: "Invalid promo code." };
  }

  const now = new Date();
  if (promo.validFrom && now < promo.validFrom) {
    return { error: "This code is not yet active." };
  }
  if (promo.validUntil && now > promo.validUntil) {
    return { error: "This code has expired." };
  }
  if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
    return { error: "This code has reached its usage limit." };
  }

  return {
    valid: true,
    id: promo.id,
    discountType: promo.discountType,
    discountAmount: promo.discountAmount,
    description: promo.description,
  };
}

export async function applyPromoCode(promoCodeId: string, originalAmountCents: number) {
  const promo = await prisma.promoCode.findUnique({
    where: { id: promoCodeId },
  });
  if (!promo || !promo.isActive) return { discountCents: 0 };

  let discountCents: number;
  if (promo.discountType === "PERCENT") {
    discountCents = Math.round((originalAmountCents * promo.discountAmount) / 100);
  } else {
    discountCents = promo.discountAmount;
  }

  discountCents = Math.min(discountCents, originalAmountCents);

  await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: { currentUses: { increment: 1 } },
  });

  return { discountCents };
}
