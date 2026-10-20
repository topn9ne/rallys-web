"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

const SINGLETON_ID = "default";

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

export async function getWaiverTemplateWithMeta() {
  const template = await prisma.waiverTemplate.findUnique({
    where: { id: SINGLETON_ID },
  });
  return {
    body: template?.body ?? FALLBACK_WAIVER_TEXT,
    updatedAt: template?.updatedAt ?? new Date(0),
  };
}

const FALLBACK_WAIVER_TEXT = `RALLY'S INDOOR TRAINING — PARTICIPANT WAIVER AND RELEASE OF LIABILITY

By signing this waiver, I acknowledge that using batting cage facilities at Rally's Indoor Training involves inherent risks including but not limited to physical injury from pitched baseballs, bat vibration, and other unforeseen circumstances. I voluntarily assume all such risks.

I hereby release, waive, discharge, and covenant not to sue Rally's Indoor Training LLC, its owners, operators, and agents from any and all claims, damages, or causes of action arising from my use of the batting cage facilities.

I confirm that I will follow all posted safety rules and use provided safety equipment, including a batting helmet, at all times while in the cage. I understand that the facility is self-service and unstaffed, and I accept full responsibility for my safety and the safety of any minors under my supervision.

For participants under 18: A parent or legal guardian must sign this waiver on behalf of the minor participant. The signing adult assumes all responsibility for the minor's safety and compliance with facility rules.

This waiver is binding upon me and my heirs, executors, administrators, and assigns.

Rally's Indoor Training LLC
203 S Woodland Ave, Bay 5
Hastings, NE 68901`;
