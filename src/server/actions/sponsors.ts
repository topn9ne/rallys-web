"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";
import { requireAdmin } from "@/lib/authGuard";

export async function createSponsor(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim() || null;
  if (!name) return { error: "Name is required." };

  const count = await prisma.sponsor.count();
  await prisma.sponsor.create({ data: { name, websiteUrl, logoUrl: "", sortOrder: count } });
  revalidatePath("/");
  revalidatePath("/admin/website/sponsors");
  return { success: true };
}

export async function updateSponsor(id: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim() || null;
  if (!name) return { error: "Name is required." };

  await prisma.sponsor.update({ where: { id }, data: { name, websiteUrl } });
  revalidatePath("/");
  revalidatePath("/admin/website/sponsors");
  return { success: true };
}

export async function toggleSponsor(id: string, active: boolean) {
  await requireAdmin();
  await prisma.sponsor.update({ where: { id }, data: { active } });
  revalidatePath("/");
  revalidatePath("/admin/website/sponsors");
}

export async function deleteSponsor(id: string) {
  await requireAdmin();
  const sponsor = await prisma.sponsor.findUnique({ where: { id } });
  if (sponsor?.logoUrl) {
    try { await del(sponsor.logoUrl); } catch { /* already gone */ }
  }
  await prisma.sponsor.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/website/sponsors");
  return { success: true };
}
