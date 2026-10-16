"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { notifyBookingCancelled } from "@/server/services/notify";
import { deleteAccessCode } from "@/server/services/seam";
import { requireAdmin } from "@/lib/authGuard";

export async function getBookingDetail(bookingId: string) {
  await requireAdmin();
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      member: true,
      slotA: true,
      slotB: true,
      waiver: true,
      accessCode: true,
    },
  });
}

export async function cancelBookingAdmin(bookingId: string) {
  await requireAdmin();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slotA: true, slotB: true },
  });
  if (!booking) return { error: "Booking not found" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  await prisma.cageSlot.update({
    where: { id: booking.slotIdA },
    data: { status: "AVAILABLE" },
  });
  if (booking.slotIdB) {
    await prisma.cageSlot.update({
      where: { id: booking.slotIdB },
      data: { status: "AVAILABLE" },
    });
  }

  try { await deleteAccessCode(bookingId); } catch {}
  try { await notifyBookingCancelled(bookingId); } catch {}

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function refundBookingAdmin(bookingId: string, amountCents?: number) {
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
    data: { status: "CANCELLED" },
  });

  await prisma.cageSlot.update({
    where: { id: booking.slotIdA },
    data: { status: "AVAILABLE" },
  });
  if (booking.slotIdB) {
    await prisma.cageSlot.update({
      where: { id: booking.slotIdB },
      data: { status: "AVAILABLE" },
    });
  }

  try { await deleteAccessCode(bookingId); } catch {}
  try { await notifyBookingCancelled(bookingId); } catch {}

  revalidatePath("/admin/bookings");
  return { success: true };
}
