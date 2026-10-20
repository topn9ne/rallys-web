"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";
import { toE164 } from "@/lib/phone";
import { createAccessCode } from "@/server/services/seam";
import { notifyBookingConfirmed } from "@/server/services/notify";
import { resolveSlot, materializeSlot, pairedVirtualSlotId } from "@/server/services/virtualSlots";

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

  const slot = await resolveSlot(input.slotId);
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

  const materializedA = await materializeSlot(input.slotId, "BOOKED");

  let materializedB = null;
  if (input.bookingType === "BOTH_LANES") {
    const pairedId = pairedVirtualSlotId(input.slotId);
    if (pairedId) {
      const pairedSlot = await resolveSlot(pairedId);
      if (!pairedSlot || pairedSlot.status !== "AVAILABLE") {
        return { error: `No available paired lane slot at this time.` };
      }
      materializedB = await materializeSlot(pairedId, "BOOKED");
    } else {
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
      materializedB = await materializeSlot(paired.id, "BOOKED");
    }
  }

  const booking = await prisma.booking.create({
    data: {
      memberId,
      guestName: memberId ? null : input.guestName?.trim() || null,
      guestEmail: memberId ? null : input.guestEmail?.toLowerCase().trim() || null,
      guestPhone: memberId ? null : (input.guestPhone?.trim() ? toE164(input.guestPhone.trim()) : null),
      bookingType: input.bookingType as any,
      slotIdA: materializedA.id,
      slotIdB: materializedB?.id ?? null,
      status: "CONFIRMED",
      totalAmountCents: input.totalAmountCents,
      baseAmountCents: input.totalAmountCents,
      taxAmountCents: 0,
      notes: input.notes?.trim() || null,
    },
  });

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
  const slot = await resolveSlot(slotId);
  if (!slot) return null;
  return {
    id: slot.id,
    lane: slot.lane,
    status: slot.status,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
  };
}
