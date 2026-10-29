"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toE164, isValidUSPhone } from "@/lib/phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateMemberProfile(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || "";
  const contactEmail = (formData.get("contactEmail") as string)?.trim() || null;
  const notificationSms = formData.get("notificationSms") === "on";

  if (!name) throw new Error("Name is required.");
  if (!phone) throw new Error("Phone number is required for door code delivery.");
  if (!isValidUSPhone(phone)) throw new Error("Enter a valid 10-digit phone number.");
  if (contactEmail && !EMAIL_RE.test(contactEmail)) throw new Error("Enter a valid email address.");

  await prisma.member.update({
    where: { id: user.id },
    data: { name, phone: toE164(phone), contactEmail, notificationSms },
  });

  revalidatePath("/account/profile");
}
