"use server";

import { prisma } from "@/lib/prisma";

const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);

async function insertWaitlist(email: string) {
  await prisma.waitlist.create({ data: { email } });
}

export async function joinWaitlist(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  let lastErr: any;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await insertWaitlist(email);
      return { success: true, message: "You're on the list!" };
    } catch (err: any) {
      if (err?.code === "P2002") {
        return { success: true, message: "You're already on the list!" };
      }
      lastErr = err;
      if (!TRANSIENT_CODES.has(err?.code)) break;
    }
  }

  console.error("[waitlist] Error:", lastErr);
  return { error: "Something went wrong — please try again in a moment." };
}
