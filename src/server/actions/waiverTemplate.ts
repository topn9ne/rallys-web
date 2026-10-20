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

ASSUMPTION OF RISK. By signing this waiver, I acknowledge that using batting cage and training facilities at Rally's Indoor Training involves inherent risks including but not limited to: being struck by pitched or batted baseballs or softballs, injury from swinging bats, bat vibration, muscle or joint strain, slips and falls, equipment malfunction, and contact with netting, structures, or other participants. I voluntarily assume all such risks and full responsibility for any injury, loss, or damage that may result from my participation.

RELEASE OF LIABILITY. I hereby release, waive, discharge, and covenant not to sue Rally's Indoor Training LLC, its owners, members, operators, agents, and their respective heirs, successors, and assigns from any and all claims, demands, damages, or causes of action arising from my use of the facility, including claims of negligence.

INDEMNIFICATION. I agree to indemnify and hold harmless Rally's Indoor Training LLC from any claims, damages, attorney's fees, judgments, or costs arising from my use of the facility, the use by any minors listed below, or any breach of this waiver.

FACILITY RULES AND SAFETY EQUIPMENT. I confirm that I will follow all posted safety rules and use provided safety equipment, including a batting helmet, at all times while in the cage area. I understand that failure to follow posted rules may result in revocation of facility access.

SELF-SERVICE FACILITY. I understand that the facility is self-service and may be unstaffed during my session. I accept full responsibility for my safety and the safety of any minors under my supervision. I acknowledge that the facility is monitored by security cameras for safety purposes and consent to being recorded while on the premises.

MEDICAL ACKNOWLEDGMENT. I represent that I (and any minors listed below) am physically capable of participating in batting cage activities and have no medical conditions that would make participation unsafe. I authorize emergency medical treatment in the event I am unable to provide consent, and I accept financial responsibility for any medical costs incurred.

MINORS. For participants under 18 years of age: A parent or legal guardian must sign this waiver on behalf of the minor participant. The signing adult assumes all responsibility for the minor's safety, conduct, and compliance with facility rules. A coach's signature does not satisfy this requirement.

GOVERNING LAW. This waiver shall be governed by and construed in accordance with the laws of the State of Nebraska.

This waiver is binding upon me, my heirs, executors, administrators, and assigns. I have read and understand this waiver in its entirety and sign it voluntarily.

Rally's Indoor Training LLC
203 S Woodland Ave, Bay 5
Hastings, NE 68901`;
