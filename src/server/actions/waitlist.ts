"use server";

import { prisma } from "@/lib/prisma";

export async function joinWaitlist(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  try {
    await prisma.waitlist.create({ data: { email } });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { success: true, message: "You're already on the list!" };
    }
    console.error("[waitlist] Error:", err);
    return { error: "Something went wrong. Try again." };
  }

  return { success: true, message: "You're on the list!" };
}
