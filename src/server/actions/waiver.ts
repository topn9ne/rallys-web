"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
