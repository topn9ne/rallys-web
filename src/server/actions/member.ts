"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateMemberProfile(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || "";
  const contactEmail = (formData.get("contactEmail") as string)?.trim() || null;

  if (!name) throw new Error("Name is required.");
  if (!phone) throw new Error("Phone number is required for door code delivery.");

  await prisma.member.update({
    where: { id: user.id },
    data: { name, phone, contactEmail },
  });

  revalidatePath("/account/profile");
}
