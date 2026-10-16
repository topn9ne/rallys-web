"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AddonAppliesTo } from "@prisma/client";
import { requireAdmin } from "@/lib/authGuard";

const AddonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priceDollars: z.coerce.number().min(0, "Price must be non-negative"),
  appliesTo: z.nativeEnum(AddonAppliesTo),
});

export async function createAddon(formData: FormData) {
  await requireAdmin();
  const result = AddonSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { priceDollars, ...rest } = result.data;
  const bikeIds = formData.getAll("bikeIds") as string[];

  const addon = await prisma.addOn.create({
    data: {
      ...rest,
      priceCents: Math.round(priceDollars * 100),
      ...(bikeIds.length > 0
        ? { bikeRestrictions: { create: bikeIds.map((bikeId) => ({ bikeId })) } }
        : {}),
    },
  });

  revalidatePath("/admin/addons");
  return { success: true };
}

export async function updateAddonBikes(addonId: string, bikeIds: string[]) {
  await requireAdmin();
  await prisma.addOnBike.deleteMany({ where: { addonId } });
  if (bikeIds.length > 0) {
    await prisma.addOnBike.createMany({
      data: bikeIds.map((bikeId) => ({ addonId, bikeId })),
    });
  }
  revalidatePath("/admin/addons");
  return { success: true };
}

export async function toggleAddon(id: string, active: boolean) {
  await requireAdmin();
  await prisma.addOn.update({ where: { id }, data: { active } });
  revalidatePath("/admin/addons");
  return { success: true };
}

export async function deleteAddon(id: string) {
  await requireAdmin();
  try {
    await prisma.addOn.delete({ where: { id } });
    revalidatePath("/admin/addons");
    return { success: true as const };
  } catch {
    return { error: "Failed to delete." };
  }
}
