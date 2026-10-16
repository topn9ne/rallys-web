"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BikeStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/authGuard";

const BikeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  passengerCap: z.coerce.number().int().min(1).max(20),
  status: z.nativeEnum(BikeStatus),
});

export async function createBike(formData: FormData) {
  await requireAdmin();
  const result = BikeSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  await prisma.bike.create({ data: result.data });
  revalidatePath("/admin/fleet");
  return { success: true };
}

export async function updateBike(id: string, formData: FormData) {
  await requireAdmin();
  const result = BikeSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  await prisma.bike.update({ where: { id }, data: result.data });
  revalidatePath("/admin/fleet");
  return { success: true };
}

export async function toggleBikeStatus(id: string, status: BikeStatus) {
  await requireAdmin();
  await prisma.bike.update({ where: { id }, data: { status } });
  revalidatePath("/admin/fleet");
  return { success: true };
}

export async function deleteBike(id: string) {
  await requireAdmin();
  try {
    await prisma.bike.delete({ where: { id } });
    revalidatePath("/admin/fleet");
    return { success: true as const };
  } catch {
    return { error: "Failed to delete." };
  }
}
