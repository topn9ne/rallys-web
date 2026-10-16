"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";
import { createAccessCode } from "@/server/services/seam";
import { notifyBookingConfirmed } from "@/server/services/notify";

interface ManualBookingInput {
  slotId: string;
  bookingType: "SINGLE_LANE" | "BOTH_LANES";
  memberEmail?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  totalAmountCents: number;
  waiverSignedOffline: boolean;
  notes?: string;
}

export async function createManualBooking(input: ManualBookingInput) {
  await requireAdmin();

  const slot = await prisma.cageSlot.findUnique({ where: { id: input.slotId } });
  if (!slot) return { error: "Cage slot not found." };
  if (slot.status === "BLOCKED") return { error: "Cannot book a blocked slot." };
  if (slot.status === "BOOKED") return { error: "Slot is already booked." };

  let memberId: string | null = null;
  if (input.memberEmail) {
    const member = await prisma.member.findUnique({
      where: { email: input.memberEmail.toLowerCase().trim() },
    });
    if (!member) return { error: "Member not found with that email." };
    memberId = member.id;
  }

  let slotIdB: string | null = null;
  if (input.bookingType === "BOTH_LANES") {
    const otherLane = slot.lane === "A" ? "B" : "A";
    const paired = await prisma.cageSlot.findFirst({
      where: {
        lane: otherLane as any,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: "AVAILABLE",
      },
    });
    if (!paired) return { error: `No available ${otherLane} lane slot at this time.` };
    slotIdB = paired.id;
  }

  const booking = await prisma.booking.create({
    data: {
      memberId,
      guestName: memberId ? null : input.guestName?.trim() || null,
      guestEmail: memberId ? null : input.guestEmail?.toLowerCase().trim() || null,
      guestPhone: memberId ? null : input.guestPhone?.trim() || null,
      bookingType: input.bookingType as any,
      slotIdA: input.slotId,
      slotIdB,
      status: "CONFIRMED",
      totalAmountCents: input.totalAmountCents,
      baseAmountCents: input.totalAmountCents,
      taxAmountCents: 0,
      notes: input.notes?.trim() || null,
    },
  });

  await prisma.cageSlot.update({
    where: { id: input.slotId },
    data: { status: "BOOKED" },
  });
  if (slotIdB) {
    await prisma.cageSlot.update({
      where: { id: slotIdB },
      data: { status: "BOOKED" },
    });
  }

  if (input.waiverSignedOffline) {
    await prisma.waiver.create({
      data: {
        bookingId: booking.id,
        memberId,
        signerName: input.guestName?.trim() || "Admin entry",
        signedAt: new Date(),
        agreementTextSnapshot: "Waiver signed offline — recorded by admin.",
        status: "SIGNED" as any,
        isMinor: false,
      },
    });
  }

  try {
    const code = await createAccessCode(booking.id);
    await notifyBookingConfirmed(booking.id, code.pin);
  } catch {}

  revalidatePath("/admin/schedule");
  revalidatePath("/admin/bookings");
  return { success: true, bookingId: booking.id };
}

export async function getSlotForManualBooking(slotId: string) {
  await requireAdmin();
  return prisma.cageSlot.findUnique({
    where: { id: slotId },
    select: {
      id: true,
      lane: true,
      status: true,
      date: true,
      startTime: true,
      endTime: true,
    },
  });
}
