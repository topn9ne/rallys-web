"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

const SINGLETON_ID = "singleton";

const TemplateSchema = z.object({
  body: z.string().min(20, "Waiver text must be at least 20 characters"),
});

export async function updateWaiverTemplate(formData: FormData) {
  await requireAdmin();
  const result = TemplateSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  await prisma.waiverTemplate.upsert({
    where: { id: SINGLETON_ID },
    update: { body: result.data.body },
    create: { id: SINGLETON_ID, body: result.data.body },
  });

  revalidatePath("/admin/waivers");
  return { success: true };
}

export async function getWaiverTemplate(): Promise<string> {
  const template = await prisma.waiverTemplate.findUnique({
    where: { id: SINGLETON_ID },
  });
  return template?.body ?? FALLBACK_WAIVER_TEXT;
}

const FALLBACK_WAIVER_TEXT = `RAILSIDE RIDES — PARTICIPANT WAIVER AND RELEASE OF LIABILITY

By signing this waiver, I acknowledge that participating in a Railside Rides pedal bike experience involves inherent risks including but not limited to physical injury, property damage, and other unforeseen circumstances. I voluntarily assume all such risks.

I hereby release, waive, discharge, and covenant not to sue Railside Rides, its owners, operators, employees, and agents from any and all claims, damages, or causes of action arising from my participation in this activity.

I confirm that I am in good physical health and capable of participating. I agree to follow all safety instructions provided by Railside Rides staff.

This waiver is binding upon me and my heirs, executors, administrators, and assigns.`;
