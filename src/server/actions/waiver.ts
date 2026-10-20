"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getWaiverTemplateWithMeta } from "./waiverTemplate";

const WaiverSchema = z.object({
  bookingId: z.string().min(1),
  signerName: z.string().min(2, "Full name is required"),
  isMinor: z.enum(["true", "false"]),
  guardianName: z.string().optional(),
  acknowledged: z.literal("true", "You must acknowledge the waiver"),
});

export async function signWaiver(formData: FormData) {
  const result = WaiverSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { bookingId, signerName, isMinor, guardianName } = result.data;
  const minor = isMinor === "true";

  if (minor && (!guardianName || guardianName.trim().length < 2)) {
    return { error: { guardianName: ["Parent/guardian name is required for minors."] } };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "unknown";

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { waiver: true },
  });

  if (!booking || !["CONFIRMED", "PENDING"].includes(booking.status)) {
    return { error: { _form: ["Booking not found or not eligible for signing."] } };
  }

  if (booking.waiver?.status === "SIGNED") {
    return { error: { _form: ["Waiver already signed."] } };
  }

  const waiverTemplate = await prisma.waiverTemplate.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  await prisma.$transaction(async (tx: any) => {
    await tx.waiver.upsert({
      where: { bookingId },
      update: {
        signerName,
        isMinor: minor,
        guardianName: minor ? guardianName?.trim() : null,
        signedAt: new Date(),
        ipAddress: ip,
        status: "SIGNED",
      },
      create: {
        bookingId,
        memberId: booking.memberId,
        signerName,
        isMinor: minor,
        guardianName: minor ? guardianName?.trim() : null,
        signedAt: new Date(),
        ipAddress: ip,
        status: "SIGNED",
        agreementTextSnapshot: waiverTemplate?.body ?? "Waiver text not configured.",
      },
    });
  });

  redirect(`/waiver/${bookingId}/complete`);
}

// ─── Member waiver (sign once, covers all future bookings) ───────────────────

const MemberWaiverSchema = z.object({
  signerName: z.string().min(2, "Full name is required"),
  isMinor: z.enum(["true", "false"]),
  guardianName: z.string().optional(),
  acknowledged: z.literal("true", "You must acknowledge the waiver"),
});

export async function signMemberWaiver(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: { _form: ["You must be signed in."] } };

  const result = MemberWaiverSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { signerName, isMinor, guardianName } = result.data;
  const minor = isMinor === "true";

  if (minor && (!guardianName || guardianName.trim().length < 2)) {
    return { error: { guardianName: ["Parent/guardian name is required for minors."] } };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "unknown";

  const template = await getWaiverTemplateWithMeta();

  await prisma.waiver.create({
    data: {
      memberId: user.id,
      bookingId: null,
      signerName,
      isMinor: minor,
      guardianName: minor ? guardianName?.trim() : null,
      signedAt: new Date(),
      ipAddress: ip,
      status: "SIGNED",
      agreementTextSnapshot: template.body,
    },
  });

  redirect("/waiver/member/complete");
}

// ─── Member waiver status check ──────────────────────────────────────────────

export async function getMemberWaiverStatus(memberId: string) {
  const latestMemberWaiver = await prisma.waiver.findFirst({
    where: {
      memberId,
      bookingId: null,
      status: "SIGNED",
    },
    orderBy: { signedAt: "desc" },
    select: { id: true, signedAt: true },
  });

  if (!latestMemberWaiver || !latestMemberWaiver.signedAt) {
    return { signed: false, needsResign: false } as const;
  }

  const template = await getWaiverTemplateWithMeta();
  const needsResign = template.updatedAt > latestMemberWaiver.signedAt;

  return {
    signed: true,
    needsResign,
    signedAt: latestMemberWaiver.signedAt,
  } as const;
}
