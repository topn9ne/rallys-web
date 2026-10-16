"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

const UpsellItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priceDollars: z.coerce.number().min(0, "Price must be non-negative"),
});

export async function createUpsellItem(formData: FormData) {
  await requireAdmin();
  const result = UpsellItemSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { priceDollars, ...rest } = result.data;
  await prisma.inRideUpsellItem.create({
    data: {
      ...rest,
      priceCents: Math.round(priceDollars * 100),
    },
  });

  revalidatePath("/admin/upsells");
  return { success: true };
}

export async function toggleUpsellItem(id: string, active: boolean) {
  await requireAdmin();
  await prisma.inRideUpsellItem.update({ where: { id }, data: { active } });
  revalidatePath("/admin/upsells");
  return { success: true };
}

export async function deleteUpsellItem(id: string) {
  await requireAdmin();
  try {
    await prisma.inRideUpsellItem.delete({ where: { id } });
    revalidatePath("/admin/upsells");
    return { success: true as const };
  } catch {
    return { error: "Failed to delete." };
  }
}
