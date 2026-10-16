"use server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rateLimit";
import { createAccessCode, deleteAccessCode } from "@/server/services/seam";
import { notifyBookingConfirmed, notifyBookingCancelled } from "@/server/services/notify";
import type { BookingType } from "@prisma/client";

interface CreateBookingInput {
  slotIdA: string;
  slotIdB?: string;
  bookingType: BookingType;
  phone: string;
  smsOptIn: boolean;
  notes?: string;
}

export async function createBooking(input: CreateBookingInput) {
  const user = await getUser();
  if (!user) return { error: "You must be signed in to book." };

  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: { subscriptionStatus: true },
  });
  if (!member || member.subscriptionStatus !== "ACTIVE") {
    return { error: "Active membership required. Subscribe or use drop-in booking." };
  }

  const allowed = rateLimit(`booking:${user.id}`, { limit: 5, windowSecs: 60 });
  if (!allowed) return { error: "Too many requests. Please wait a moment." };

  const slotA = await prisma.cageSlot.findUnique({ where: { id: input.slotIdA } });
  if (!slotA || slotA.status !== "AVAILABLE") {
    return { error: "This time slot is no longer available." };
  }

  let slotB = null;
  if (input.bookingType === "BOTH_LANES" && input.slotIdB) {
    slotB = await prisma.cageSlot.findUnique({ where: { id: input.slotIdB } });
    if (!slotB || slotB.status !== "AVAILABLE") {
      return { error: "The second lane is no longer available." };
    }
  }

  await prisma.member.update({
    where: { id: user.id },
    data: { phone: input.phone },
  });

  const pricing = await prisma.pricingConfig.findFirst({
    where: { tier: input.bookingType === "BOTH_LANES" ? "TEAM" : "MEMBER" },
    orderBy: { effectiveFrom: "desc" },
  });
  const taxRate = (pricing?.taxRatePercent ?? 7) / 100;
  const baseCents = 0;
  const taxCents = 0;

  const booking = await prisma.booking.create({
    data: {
      memberId: user.id,
      slotIdA: slotA.id,
      slotIdB: slotB?.id ?? null,
      bookingType: input.bookingType,
      status: "CONFIRMED",
      totalAmountCents: 0,
      baseAmountCents: 0,
      taxAmountCents: 0,
      notes: input.notes ?? null,
    },
  });

  await prisma.cageSlot.update({
    where: { id: slotA.id },
    data: { status: "BOOKED" },
  });
  if (slotB) {
    await prisma.cageSlot.update({
      where: { id: slotB.id },
      data: { status: "BOOKED" },
    });
  }

  try {
    const { pin } = await createAccessCode(booking.id);
    await notifyBookingConfirmed(booking.id, pin);
  } catch (err) {
    console.error("[booking] Access code / notification failed:", err);
  }

  return { bookingId: booking.id };
}

interface CreateDropInInput {
  slotIdA: string;
  slotIdB?: string;
  bookingType: BookingType;
  guestName?: string;
  guestEmail?: string;
  phone: string;
  smsOptIn: boolean;
  notes?: string;
}

export async function createDropInCheckout(input: CreateDropInInput) {
  const user = await getUser();

  let memberId: string | undefined;
  let customerEmail: string | undefined;

  if (user) {
    memberId = user.id;
    customerEmail = user.email ?? undefined;
    await prisma.member.update({
      where: { id: user.id },
      data: { phone: input.phone },
    });
  } else {
    if (!input.guestName || !input.guestEmail) {
      return { error: "Name and email are required." };
    }
    if (!input.phone) {
      return { error: "Phone number is required for your door code." };
    }
    customerEmail = input.guestEmail;
  }

  const rateLimitKey = memberId ?? input.guestEmail ?? "anon";
  const allowed = rateLimit(`checkout:${rateLimitKey}`, { limit: 5, windowSecs: 60 });
  if (!allowed) return { error: "Too many requests. Please wait a moment." };

  const slotA = await prisma.cageSlot.findUnique({ where: { id: input.slotIdA } });
  if (!slotA || slotA.status !== "AVAILABLE") {
    return { error: "This time slot is no longer available." };
  }

  let slotB = null;
  if (input.bookingType === "BOTH_LANES" && input.slotIdB) {
    slotB = await prisma.cageSlot.findUnique({ where: { id: input.slotIdB } });
    if (!slotB || slotB.status !== "AVAILABLE") {
      return { error: "The second lane is no longer available." };
    }
  }

  const pricingTier = input.bookingType === "BOTH_LANES" ? "DROPIN_BOTH" : "DROPIN_SINGLE";
  const pricing = await prisma.pricingConfig.findFirst({
    where: { tier: pricingTier },
    orderBy: { effectiveFrom: "desc" },
  });
  const baseCents = pricing?.amountCents ?? (input.bookingType === "BOTH_LANES" ? 2500 : 1500);
  const taxRate = (pricing?.taxRatePercent ?? 7) / 100;
  const taxCents = Math.round(baseCents * taxRate);
  const totalCents = baseCents + taxCents;

  const booking = await prisma.booking.create({
    data: {
      memberId: memberId ?? null,
      slotIdA: slotA.id,
      slotIdB: slotB?.id ?? null,
      bookingType: input.bookingType,
      status: "PENDING",
      totalAmountCents: totalCents,
      baseAmountCents: baseCents,
      taxAmountCents: taxCents,
      guestName: !memberId ? input.guestName : null,
      guestEmail: !memberId ? input.guestEmail : null,
      guestPhone: input.phone,
      notes: input.notes ?? null,
    },
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const STRIPE_TAX_RATE_ID = process.env.STRIPE_TAX_RATE_ID;

  const lineItems: any[] = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: input.bookingType === "BOTH_LANES"
            ? "Batting Cage — Both Lanes (30 min)"
            : "Batting Cage — Single Lane (30 min)",
        },
        unit_amount: baseCents,
      },
      quantity: 1,
      ...(STRIPE_TAX_RATE_ID ? { tax_rates: [STRIPE_TAX_RATE_ID] } : {}),
    },
  ];

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    metadata: {
      bookingId: booking.id,
      slotIdA: slotA.id,
      slotIdB: slotB?.id ?? "",
      bookingType: input.bookingType,
      guestPhone: input.phone,
    },
    customer_email: customerEmail,
    success_url: `${appUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/book/${slotA.id}?type=${input.bookingType}${slotB ? `&slotB=${slotB.id}` : ""}`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return { url: checkoutSession.url };
}

export async function cancelBooking(bookingId: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.memberId !== user.id) {
    return { error: "Booking not found." };
  }

  if (booking.status !== "CONFIRMED") {
    return { error: "Only confirmed bookings can be cancelled." };
  }

  if (booking.stripeSessionId && booking.totalAmountCents > 0) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
      if (stripeSession.payment_intent) {
        await stripe.refunds.create({
          payment_intent: stripeSession.payment_intent as string,
        });
      }
    } catch {
      // Log but don't block — reconcile manually
    }
  }

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

  try {
    await deleteAccessCode(bookingId);
    await notifyBookingCancelled(bookingId);
  } catch (err) {
    console.error("[booking] Access code deletion / notification failed:", err);
  }

  return { success: true };
}
