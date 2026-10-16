import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notifyBookingConfirmed, notifyOwnerBookingConfirmed } from "@/server/services/notifications";
import { rateLimit } from "@/lib/rateLimit";
import { getWaiverTemplate } from "@/server/actions/waiverTemplate";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  // Rate limit: 100 webhook calls per minute from any single IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`webhook:${ip}`, { limit: 100, windowSecs: 60 })) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Route to the appropriate handler based on session type
  if (session.metadata?.type === "shop") {
    await handleShopPurchase(session);
    return;
  }

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  // Idempotency guard — skip if already confirmed
  const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!existing || existing.status !== "PENDING") return;

  // Atomic: confirm booking + decrement seats + increment discount uses
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        stripePaymentIntentId: session.payment_intent as string,
      },
    });

    // Decrement seats on the slot
    if (booking.bookingType === "THEME_SEAT") {
      const slot = await tx.rideSlot.update({
        where: { id: booking.slotId },
        data: { seatsBooked: { increment: booking.seats } },
      });

      // Update slot status
      const seatsRemaining = slot.seatsTotal - slot.seatsBooked;
      let newStatus = slot.status;
      if (seatsRemaining === 0) newStatus = "FULL";
      else if (seatsRemaining <= 3) newStatus = "FILLING";

      if (newStatus !== slot.status) {
        await tx.rideSlot.update({
          where: { id: slot.id },
          data: { status: newStatus },
        });
      }
    } else {
      // Group ride — mark slot as FULL
      await tx.rideSlot.update({
        where: { id: booking.slotId },
        data: { status: "FULL" },
      });
    }

    // Increment discount code uses
    if (booking.discountCodeId) {
      await tx.discountCode.update({
        where: { id: booking.discountCodeId },
        data: { usesCount: { increment: 1 } },
      });
    }

    // Create waiver record (pending signature)
    const waiverText = await getWaiverTemplate();
    await tx.waiver.upsert({
      where: { bookingId: booking.id },
      update: {},
      create: {
        bookingId: booking.id,
        signerName: "",
        agreementTextSnapshot: waiverText,
        status: "PENDING",
      },
    });
  });

  // Send confirmation email + SMS (fire and forget — don't block webhook response)
  notifyBookingConfirmed(bookingId).catch((err) =>
    console.error("[webhook] Failed to send confirmation notification:", err)
  );
  notifyOwnerBookingConfirmed(bookingId).catch((err) =>
    console.error("[webhook] Failed to send owner confirmation notification:", err)
  );
}

async function handleShopPurchase(session: Stripe.Checkout.Session) {
  const bikeId = session.metadata?.bikeId;
  const itemIds: string[] = JSON.parse(session.metadata?.itemIds ?? "[]");
  const gratuityAmountCents = Number(session.metadata?.gratuityAmountCents ?? 0);

  if (!bikeId) return;

  // Idempotency guard
  const existing = await prisma.inRideUpsellPurchase.findFirst({
    where: { stripeSessionId: session.id },
  });
  if (existing) return;

  // Find active slot using the buffer window (covers post-ride tips)
  const now = new Date();
  const activeSlot = await prisma.rideSlot.findFirst({
    where: {
      bikeId,
      startTime: { lte: now },
      bufferEndTime: { gte: now },
    },
  });

  const slotId = activeSlot?.id ?? null;

  // Fetch purchased items
  const items = itemIds.length
    ? await prisma.inRideUpsellItem.findMany({ where: { id: { in: itemIds } } })
    : [];

  // Create one purchase record per item + one for gratuity if applicable
  const creates = [
    ...items.map((item) =>
      prisma.inRideUpsellPurchase.create({
        data: {
          slotId,
          itemId: item.id,
          quantity: 1,
          priceCentsAtPurchase: item.priceCents,
          gratuityAmountCents: 0,
          stripeSessionId: items.indexOf(item) === 0 ? session.id : null,
        },
      })
    ),
    ...(gratuityAmountCents > 0
      ? [
          prisma.inRideUpsellPurchase.create({
            data: {
              slotId,
              itemId: null,
              quantity: 1,
              priceCentsAtPurchase: 0,
              gratuityAmountCents,
              stripeSessionId: items.length === 0 ? session.id : null,
            },
          }),
        ]
      : []),
  ];

  await Promise.all(creates);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  await prisma.booking.updateMany({
    where: { id: bookingId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}

async function handleRefund(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;

  await prisma.booking.updateMany({
    where: {
      stripePaymentIntentId: charge.payment_intent as string,
      status: { notIn: ["CANCELLED", "REFUNDED"] },
    },
    data: { status: "REFUNDED" },
  });
}

