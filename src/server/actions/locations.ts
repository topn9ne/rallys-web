"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

export async function createLocation(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();

  const errors: Record<string, string[]> = {};
  if (!name) errors.name = ["Name is required"];
  if (!address) errors.address = ["Address is required"];
  if (Object.keys(errors).length) return { error: errors, success: false };

  await prisma.pickupLocation.create({ data: { name, address } });
  revalidatePath("/admin/locations");
  return { error: undefined, success: true };
}

export async function toggleLocationActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.pickupLocation.update({ where: { id }, data: { active } });
  revalidatePath("/admin/locations");
}

export async function deleteLocation(id: string) {
  await requireAdmin();
  try {
    await prisma.pickupLocation.delete({ where: { id } });
    revalidatePath("/admin/locations");
    return { success: true as const };
  } catch {
    return { error: "Failed to delete." };
  }
}
