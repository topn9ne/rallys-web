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

  if (!name) throw new Error("Name is required.");

  await prisma.member.update({
    where: { id: user.id },
    data: { name, phone },
  });

  revalidatePath("/account/profile");
}
