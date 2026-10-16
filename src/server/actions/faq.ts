"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

export async function createFaqItem(formData: FormData) {
  await requireAdmin();
  const question = (formData.get("question") as string)?.trim();
  const answer = (formData.get("answer") as string)?.trim();
  if (!question || !answer) return { error: "Question and answer are required." };

  const count = await prisma.faqItem.count();
  await prisma.faqItem.create({ data: { question, answer, sortOrder: count } });
  revalidatePath("/");
  revalidatePath("/faqs");
  revalidatePath("/admin/website/faq");
  return { success: true };
}

export async function updateFaqItem(id: string, formData: FormData) {
  await requireAdmin();
  const question = (formData.get("question") as string)?.trim();
  const answer = (formData.get("answer") as string)?.trim();
  if (!question || !answer) return { error: "Question and answer are required." };

  await prisma.faqItem.update({ where: { id }, data: { question, answer } });
  revalidatePath("/");
  revalidatePath("/faqs");
  revalidatePath("/admin/website/faq");
  return { success: true };
}

export async function toggleFaqItem(id: string, active: boolean) {
  await requireAdmin();
  await prisma.faqItem.update({ where: { id }, data: { active } });
  revalidatePath("/");
  revalidatePath("/faqs");
  revalidatePath("/admin/website/faq");
}

export async function deleteFaqItem(id: string) {
  await requireAdmin();
  await prisma.faqItem.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/faqs");
  revalidatePath("/admin/website/faq");
  return { success: true };
}

export async function reorderFaqItems(orderedIds: string[]) {
  await requireAdmin();
  await Promise.all(
    orderedIds.map((id, i) =>
      prisma.faqItem.update({ where: { id }, data: { sortOrder: i } })
    )
  );
  revalidatePath("/");
  revalidatePath("/faqs");
  revalidatePath("/admin/website/faq");
}
