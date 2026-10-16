"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authGuard";

interface ManualBookingInput {
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bookingType: "THEME_SEAT" | "GENERAL_FULL";
  seats: number;
  pickupLocation: string;
  totalAmountCents: number;
  paymentReference?: string;
  waiverSignedOffline: boolean;
  notes?: string;
}

export async function createManualBooking(input: ManualBookingInput) {
  await requireAdmin();
  const {
    slotId,
    customerName,
    customerEmail,
    customerPhone,
    bookingType,
    seats,
    pickupLocation,
    totalAmountCents,
    paymentReference,
    waiverSignedOffline,
  } = input;

  // Validate slot exists and is bookable
  const slot = await prisma.rideSlot.findUnique({ where: { id: slotId } });
  if (!slot) return { error: "Ride slot not found." };
  if (slot.status === "CANCELLED" || slot.status === "BLOCKED") {
    return { error: "Cannot book a cancelled or blocked slot." };
  }

  // Upsert customer by email
  const customer = await prisma.customer.upsert({
    where: { email: customerEmail.toLowerCase().trim() },
    update: {
      name: customerName.trim(),
      ...(customerPhone ? { phone: customerPhone.trim() } : {}),
    },
    create: {
      name: customerName.trim(),
      email: customerEmail.toLowerCase().trim(),
      phone: customerPhone?.trim() ?? null,
    },
  });

  // Create the booking
  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      slotId,
      bookingType,
      seats,
      pickupLocation,
      status: "CONFIRMED",
      totalAmountCents,
      baseAmountCents: totalAmountCents,
      taxAmountCents: 0,
      addonsAmountCents: 0,
      discountAmountCents: 0,
      isManual: true,
      paymentReference: paymentReference?.trim() || null,
      waiverSignedOffline,
    },
  });

  // Update seatsBooked if theme seat
  if (bookingType === "THEME_SEAT") {
    await prisma.rideSlot.update({
      where: { id: slotId },
      data: { seatsBooked: { increment: seats } },
    });
  } else {
    // General full-bike booking — mark as filling
    await prisma.rideSlot.update({
      where: { id: slotId },
      data: { seatsBooked: slot.seatsTotal },
    });
  }

  // Create signed waiver record if waiver was signed offline
  if (waiverSignedOffline) {
    await prisma.waiver.create({
      data: {
        bookingId: booking.id,
        signerName: customerName.trim(),
        signedAt: new Date(),
        agreementTextSnapshot: "Waiver signed offline — recorded by admin.",
        status: "SIGNED",
      },
    });
  }

  revalidatePath("/admin/schedule");
  revalidatePath("/admin/bookings");
  return { success: true, bookingId: booking.id };
}

export async function getSlotForManualBooking(slotId: string) {
  await requireAdmin();
  return prisma.rideSlot.findUnique({
    where: { id: slotId },
    select: {
      id: true,
      rideType: true,
      seatsTotal: true,
      seatsBooked: true,
      status: true,
      date: true,
      startTime: true,
      endTime: true,
      theme: { select: { name: true } },
      bike: { select: { name: true } },
    },
  });
}
