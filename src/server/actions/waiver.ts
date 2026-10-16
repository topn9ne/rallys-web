"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const WaiverSchema = z.object({
  bookingId: z.string().min(1),
  signerName: z.string().min(2, "Full name is required"),
  signerDob: z.string().min(1, "Date of birth is required"),
  acknowledged: z.literal("true", "You must acknowledge the waiver"),
});

export async function signWaiver(formData: FormData) {
  const result = WaiverSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { bookingId, signerName, signerDob } = result.data;
  const riderRoster = (formData.get("riderRoster") as string | null)?.trim() || null;

  // Validate 21+ age
  const birth = new Date(signerDob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 21) {
    return { error: { signerDob: ["You must be 21 or older to sign this waiver."] } };
  }

  // Get IP from headers
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "unknown";

  // Verify booking exists and is in a signable state
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { waiver: true },
  });

  if (!booking || !["CONFIRMED", "PENDING"].includes(booking.status)) {
    return { error: { _form: ["Booking not found or not eligible for signing"] } };
  }

  if (booking.waiver?.status === "SIGNED") {
    return { error: { _form: ["Waiver already signed"] } };
  }

  await prisma.$transaction(async (tx) => {
    await tx.waiver.upsert({
      where: { bookingId },
      update: {
        signerName,
        signerDob,
        signedAt: new Date(),
        ipAddress: ip,
        status: "SIGNED",
      },
      create: {
        bookingId,
        signerName,
        signerDob,
        signedAt: new Date(),
        ipAddress: ip,
        status: "SIGNED",
        agreementTextSnapshot: "",
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED", ...(riderRoster ? { riderRoster } : {}) },
    });
  });

  redirect(`/waiver/${bookingId}/complete`);
}
