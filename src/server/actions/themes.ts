"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

const ThemeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export async function createTheme(formData: FormData) {
  await requireAdmin();
  const result = ThemeSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  await prisma.theme.create({ data: result.data });
  revalidatePath("/admin/themes");
  return { success: true };
}

export async function updateTheme(id: string, formData: FormData) {
  await requireAdmin();
  const result = ThemeSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  await prisma.theme.update({ where: { id }, data: result.data });
  revalidatePath("/admin/themes");
  return { success: true };
}

export async function deleteTheme(id: string) {
  await requireAdmin();
  const rideCount = await prisma.rideSlot.count({
    where: { themeId: id, status: { notIn: ["CANCELLED"] } },
  });
  if (rideCount > 0) {
    return { error: `Cannot delete — ${rideCount} active ride(s) use this theme.` };
  }
  await prisma.theme.delete({ where: { id } });
  revalidatePath("/admin/themes");
  return { success: true };
}
