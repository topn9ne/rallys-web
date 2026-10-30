"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getWaiverTemplateWithMeta } from "./waiverTemplate";
import { notifyWaiverSigned, notifyDoorCodeReady } from "@/server/services/notify";
import { createAccessCode } from "@/server/services/seam";

const ParticipantSchema = z.object({
  name: z.string().min(2, "Name is required"),
  isMinor: z.boolean(),
});

export type WaiverParticipant = z.infer<typeof ParticipantSchema>;

// ─── Drop-in / booking waiver ────────────────────────────────────────────────

const WaiverInput = z.object({
  bookingId: z.string().min(1),
  signerName: z.string().min(2, "Full name is required"),
  participants: z.array(ParticipantSchema).min(1, "At least one participant is required"),
  acknowledged: z.boolean(),
});

export async function signWaiver(input: z.infer<typeof WaiverInput>) {
  const result = WaiverInput.safeParse(input);
  if (!result.success) {
    return { error: { _form: [result.error.issues[0]?.message ?? "Invalid input."] } };
  }

  const { bookingId, signerName, participants, acknowledged } = result.data;
  if (!acknowledged) {
    return { error: { _form: ["You must acknowledge the waiver."] } };
  }

  const hasMinor = participants.some((p) => p.isMinor);

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
        isMinor: hasMinor,
        guardianName: hasMinor ? signerName : null,
        participants,
        signedAt: new Date(),
        ipAddress: ip,
        status: "SIGNED",
      },
      create: {
        bookingId,
        memberId: booking.memberId,
        signerName,
        isMinor: hasMinor,
        guardianName: hasMinor ? signerName : null,
        participants,
        signedAt: new Date(),
        ipAddress: ip,
        status: "SIGNED",
        agreementTextSnapshot: waiverTemplate?.body ?? "Waiver text not configured.",
      },
    });
  });

  // Generate access code now that waiver is signed
  if (!booking.accessCodePin) {
    try {
      const { pin } = await createAccessCode(booking.id);
      await notifyDoorCodeReady(booking.id, pin);
    } catch (err) {
      console.error(`[waiver] Code generation failed for booking ${booking.id}:`, err);
    }
  }

  redirect(`/waiver/${bookingId}/complete`);
}

// ─── Member waiver (sign once, covers all future bookings) ───────────────────

const MemberWaiverInput = z.object({
  signerName: z.string().min(2, "Full name is required"),
  participants: z.array(ParticipantSchema).min(1, "At least one participant is required"),
  acknowledged: z.boolean(),
});

export async function signMemberWaiver(input: z.infer<typeof MemberWaiverInput>) {
  const user = await getUser();
  if (!user) return { error: { _form: ["You must be signed in."] } };

  const result = MemberWaiverInput.safeParse(input);
  if (!result.success) {
    return { error: { _form: [result.error.issues[0]?.message ?? "Invalid input."] } };
  }

  const { signerName, participants, acknowledged } = result.data;
  if (!acknowledged) {
    return { error: { _form: ["You must acknowledge the waiver."] } };
  }

  const hasMinor = participants.some((p) => p.isMinor);

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
      isMinor: hasMinor,
      guardianName: hasMinor ? signerName : null,
      participants,
      signedAt: new Date(),
      ipAddress: ip,
      status: "SIGNED",
      agreementTextSnapshot: template.body,
    },
  });

  notifyWaiverSigned(user.id).catch(() => {});

  generatePendingCodes(user.id).catch((err) =>
    console.error("[waiver] Pending code generation failed:", err)
  );

  redirect("/waiver/member/complete");
}

// ─── Generate codes for bookings that were made without a waiver ─────────────

async function generatePendingCodes(memberId: string) {
  const pendingBookings = await prisma.booking.findMany({
    where: {
      memberId,
      status: "CONFIRMED",
      accessCodePin: null,
      slotA: { date: { gte: new Date() } },
    },
    select: { id: true },
  });

  for (const b of pendingBookings) {
    try {
      const { pin } = await createAccessCode(b.id);
      await notifyDoorCodeReady(b.id, pin);
    } catch (err) {
      console.error(`[waiver] Code generation failed for booking ${b.id}:`, err);
    }
  }
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
  const needsResign = template.resignRequiredAt !== null
    && template.resignRequiredAt > latestMemberWaiver.signedAt;

  return {
    signed: true,
    needsResign,
    signedAt: latestMemberWaiver.signedAt,
  } as const;
}
