"use server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { calcDiscount } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

const STRIPE_TAX_RATE_ID = "txr_1Tds8JAH2pgWWjUlRIUkgUHQ";

export async function createCheckoutSession(formData: FormData) {
  const user = await getUser();

  let customerId: string;
  let customerEmail: string | undefined;

  if (user) {
    customerId = user.id;
    customerEmail = user.email ?? undefined;
    const phone = (formData.get("guestPhone") as string)?.trim() || null;
    if (!phone) {
      return { error: "Phone number is required." };
    }
    const notificationSms = formData.get("notificationSms") === "on";
    await prisma.customer.update({
      where: { id: customerId },
      data: { phone, notificationSms },
    });
  } else {
    // Guest checkout — find or create customer by email
    const guestEmail = (formData.get("guestEmail") as string)?.trim().toLowerCase();
    const guestName = (formData.get("guestName") as string)?.trim();
    if (!guestEmail || !guestName) {
      return { error: "Your name and email are required to continue." };
    }
    const guestPhone = (formData.get("guestPhone") as string)?.trim() || null;
    if (!guestPhone) {
      return { error: "Phone number is required." };
    }
    const notificationSms = formData.get("notificationSms") === "on";
    const customer = await prisma.customer.upsert({
      where: { email: guestEmail },
      update: { ...(guestPhone ? { phone: guestPhone, notificationSms } : {}) },
      create: { email: guestEmail, name: guestName, phone: guestPhone, notificationSms },
    });
    customerId = customer.id;
    customerEmail = guestEmail;
  }

  // Rate limit: 5 checkout attempts per customer per minute
  const allowed = rateLimit(`checkout:${customerId}`, { limit: 5, windowSecs: 60 });
  if (!allowed) {
    return { error: "Too many requests. Please wait a moment and try again." };
  }

  const slotId = formData.get("slotId") as string;
  const seats = Number(formData.get("seats")) || 1;
  const passengerCount = Number(formData.get("passengerCount")) || null;
  const pickupLocationId = formData.get("pickupLocationId") as string;
  const addonIds: string[] = JSON.parse(
    (formData.get("addonIds") as string) || "[]"
  );
  const discountCodeId = formData.get("discountCodeId") as string | null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const riderRoster = (formData.get("riderRoster") as string)?.trim() || null;

  // Fetch slot and validate it's still available
  const slot = await prisma.rideSlot.findUnique({
    where: { id: slotId },
    include: { theme: true },
  });

  if (!slot || slot.status === "FULL" || slot.status === "CANCELLED") {
    return { error: "This ride is no longer available." };
  }

  if (slot.rideType === "THEME" && slot.seatsBooked + seats > slot.seatsTotal) {
    return { error: `Only ${slot.seatsTotal - slot.seatsBooked} seats remaining.` };
  }

  // Fetch pricing
  const pricing = await prisma.pricingConfig.findFirst({
    where: { rideType: slot.rideType },
    orderBy: { effectiveFrom: "desc" },
  });
  const pricePerUnit = pricing?.baseAmountCents ?? (slot.rideType === "THEME" ? 3000 : 40000);

  // Fetch addons
  const addons = addonIds.length
    ? await prisma.addOn.findMany({ where: { id: { in: addonIds }, active: true } })
    : [];

  // Fetch pickup location
  const pickup = await prisma.pickupLocation.findUnique({
    where: { id: pickupLocationId },
  });

  // Fetch discount
  let discountAmount = 0;
  let discountCode = null;
  if (discountCodeId) {
    discountCode = await prisma.discountCode.findUnique({
      where: { id: discountCodeId, active: true },
    });
    if (discountCode) {
      const base = slot.rideType === "THEME" ? pricePerUnit * seats : pricePerUnit;
      const effectiveValue =
        slot.rideType === "GENERAL" && discountCode.generalValue != null
          ? discountCode.generalValue
          : discountCode.value;
      discountAmount = calcDiscount(base, discountCode.type, effectiveValue);
    }
  }

  // Calculate totals
  const baseAmountCents =
    slot.rideType === "THEME" ? pricePerUnit * seats : pricePerUnit;
  const addonsAmountCents = addons.reduce((sum, a) => sum + a.priceCents, 0);
  const subtotalAfterDiscount = baseAmountCents + addonsAmountCents - discountAmount;
  const taxRate = (pricing?.taxRatePercent ?? 0) / 100;
  const taxAmountCents = Math.round(subtotalAfterDiscount * taxRate);
  const totalAmountCents = subtotalAfterDiscount + taxAmountCents;

  // Build Stripe line items
  const lineItems = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name:
            slot.rideType === "THEME"
              ? `${slot.theme?.name ?? "Theme Ride"} — ${seats} seat${seats > 1 ? "s" : ""}`
              : "Group Ride — Full Vehicle",
        },
        unit_amount:
          slot.rideType === "THEME"
            ? pricePerUnit
            : pricePerUnit,
      },
      quantity: slot.rideType === "THEME" ? seats : 1,
      tax_rates: [STRIPE_TAX_RATE_ID],
    },
    ...addons.map((a) => ({
      price_data: {
        currency: "usd",
        product_data: { name: a.name },
        unit_amount: a.priceCents,
      },
      quantity: 1,
      tax_rates: [STRIPE_TAX_RATE_ID],
    })),
  ];

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  // Reuse or create a pending booking record
  const existingPending = await prisma.booking.findFirst({
    where: { customerId, slotId, status: "PENDING" },
  });

  let booking;
  if (existingPending) {
    // Update the existing pending booking with the latest selections
    await prisma.bookingAddon.deleteMany({ where: { bookingId: existingPending.id } });
    booking = await prisma.booking.update({
      where: { id: existingPending.id },
      data: {
        seats,
        passengerCount,
        pickupLocation: pickup?.name ?? pickupLocationId,
        pickupAddress: pickup?.address,
        totalAmountCents,
        baseAmountCents,
        taxAmountCents,
        addonsAmountCents,
        discountCodeId: discountCode?.id ?? null,
        discountAmountCents: discountAmount,
        notes,
        riderRoster,
      },
    });
  } else {
    booking = await prisma.booking.create({
      data: {
        customerId,
        slotId,
        bookingType: slot.rideType === "THEME" ? "THEME_SEAT" : "GENERAL_FULL",
        seats,
        passengerCount,
        pickupLocation: pickup?.name ?? pickupLocationId,
        pickupAddress: pickup?.address,
        status: "PENDING",
        totalAmountCents,
        baseAmountCents,
        taxAmountCents,
        addonsAmountCents,
        discountCodeId: discountCode?.id ?? null,
        discountAmountCents: discountAmount,
        notes,
        riderRoster,
      },
    });
  }

  // Create booking addons
  if (addons.length) {
    await prisma.bookingAddon.createMany({
      data: addons.map((a) => ({
        bookingId: booking.id,
        addonId: a.id,
        priceCentsAtPurchase: a.priceCents,
      })),
    });
  }

  // Create Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    ...(discountAmount > 0
      ? {
          discounts: [
            {
              coupon: await getOrCreateStripeCoupon(
                discountCode!,
                discountAmount
              ),
            },
          ],
        }
      : {}),
    metadata: {
      bookingId: booking.id,
      slotId,
      customerId,
      rideType: slot.rideType,
      themeName: slot.theme?.name ?? "",
      rideDate: slot.date ? new Date(slot.date).toISOString().slice(0, 10) : "",
      seats: String(seats),
      addons: addons.map((a) => a.name).join(", "),
      discountCode: discountCode?.code ?? "",
      pickupLocation: pickup?.name ?? "",
    },
    customer_email: customerEmail,
    success_url: `${appUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/book/${slotId}`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
  });

  // Update booking with Stripe session ID
  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return { url: checkoutSession.url };
}

export async function cancelBooking(bookingId: string) {
  const user = await getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.customerId !== user.id) {
    return { error: "Booking not found." };
  }

  if (booking.status !== "CONFIRMED") {
    return { error: "Only confirmed bookings can be cancelled." };
  }

  // Look up non-refundable booking fee from pricing config
  const slot = await prisma.rideSlot.findUnique({ where: { id: booking.slotId } });
  const pricingConfig = slot
    ? await prisma.pricingConfig.findFirst({
        where: { rideType: slot.rideType },
        orderBy: { effectiveFrom: "desc" },
      })
    : null;
  const bookingFeeCents = pricingConfig?.bookingFeeCents ?? 0;
  const refundAmount = Math.max(0, booking.totalAmountCents - bookingFeeCents);

  // Issue Stripe refund (minus non-refundable booking fee)
  if (booking.stripeSessionId && refundAmount > 0) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(
        booking.stripeSessionId
      );
      if (stripeSession.payment_intent) {
        await stripe.refunds.create({
          payment_intent: stripeSession.payment_intent as string,
          amount: refundAmount,
        });
      }
    } catch {
      // Log but don't block — staff can reconcile manually
    }
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  // Release discount code use
  if (updated.discountCodeId) {
    await prisma.discountCode.update({
      where: { id: updated.discountCodeId },
      data: { usesCount: { decrement: 1 } },
    });
  }

  if (updated.bookingType === "THEME_SEAT") {
    const slot = await prisma.rideSlot.update({
      where: { id: updated.slotId },
      data: { seatsBooked: { decrement: updated.seats } },
    });
    const seatsRemaining = slot.seatsTotal - slot.seatsBooked;
    const newStatus = seatsRemaining === 0 ? "FULL" : seatsRemaining <= 3 ? "FILLING" : "AVAILABLE";
    if (newStatus !== slot.status) {
      await prisma.rideSlot.update({ where: { id: slot.id }, data: { status: newStatus } });
    }
  } else {
    await prisma.rideSlot.update({ where: { id: updated.slotId }, data: { status: "AVAILABLE" } });
  }

  return { success: true };
}

async function getOrCreateStripeCoupon(
  discountCode: { id: string; type: string; value: number; code: string },
  discountAmountCents: number
): Promise<string> {
  const couponId = `dc_${discountCode.id}_${discountAmountCents}`;
  try {
    await stripe.coupons.retrieve(couponId);
    return couponId;
  } catch {
    await stripe.coupons.create({
      id: couponId,
      name: discountCode.code,
      amount_off: discountAmountCents,
      currency: "usd",
      duration: "once",
    });
    return couponId;
  }
}
