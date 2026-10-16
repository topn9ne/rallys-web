"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { notifyBookingCancelled, notifyOwnerBookingCancelled } from "@/server/services/notifications";
import { requireAdmin } from "@/lib/authGuard";

export async function getBookingDetail(bookingId: string) {
  await requireAdmin();
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      slot: { include: { theme: true, bike: true } },
      waiver: true,
      bookingAddons: { include: { addon: true } },
      discountCode: true,
    },
  });
}

export async function cancelBookingAdmin(bookingId: string) {
  await requireAdmin();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "Booking not found" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  await releaseSlotCapacity(booking.slotId, booking.bookingType, booking.seats);
  await releaseDiscountUse(booking.discountCodeId);

  await notifyBookingCancelled(bookingId, undefined, "Cancelled by admin");
  await notifyOwnerBookingCancelled(bookingId, undefined, "Cancelled by admin");
  revalidatePath("/admin/bookings");
  return { success: true };
}

async function releaseDiscountUse(discountCodeId: string | null) {
  if (!discountCodeId) return;
  await prisma.discountCode.update({
    where: { id: discountCodeId },
    data: { usesCount: { decrement: 1 } },
  });
}

async function releaseSlotCapacity(slotId: string, bookingType: string, seats: number) {
  if (bookingType === "THEME_SEAT") {
    const slot = await prisma.rideSlot.update({
      where: { id: slotId },
      data: { seatsBooked: { decrement: seats } },
    });
    const seatsRemaining = slot.seatsTotal - slot.seatsBooked;
    const newStatus = seatsRemaining === 0 ? "FULL" : seatsRemaining <= 3 ? "FILLING" : "AVAILABLE";
    if (newStatus !== slot.status) {
      await prisma.rideSlot.update({ where: { id: slotId }, data: { status: newStatus } });
    }
  } else {
    // General full-bike booking — slot goes back to available
    await prisma.rideSlot.update({ where: { id: slotId }, data: { status: "AVAILABLE" } });
  }
}

export async function refundBookingAdmin(
  bookingId: string,
  amountCents?: number
) {
  await requireAdmin();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking?.stripePaymentIntentId) return { error: "No payment found" };

  const refundAmount = amountCents ?? booking.totalAmountCents;

  await stripe.refunds.create({
    payment_intent: booking.stripePaymentIntentId,
    amount: refundAmount,
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "REFUNDED" },
  });

  await releaseDiscountUse(booking.discountCodeId);

  await notifyBookingCancelled(bookingId, refundAmount, "Refunded by admin");
  await notifyOwnerBookingCancelled(bookingId, refundAmount, "Refunded by admin");
  revalidatePath("/admin/bookings");
  return { success: true };
}
