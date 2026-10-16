"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateCustomerProfile(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.userType !== "customer") {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const notificationSms = formData.get("notificationSms") === "on";

  if (!name) throw new Error("Name is required.");

  await prisma.customer.update({
    where: { id: session.user.id },
    data: { name, phone, notificationSms },
  });

  revalidatePath("/account/profile");
}
