import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { createAccessCode } from "@/server/services/seam";
import {
  notifyBookingConfirmed,
  notifyNewMember,
  notifyPaymentFailed,
  notifySubscriptionCancelled,
} from "@/server/services/notify";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
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
      // ── Drop-in one-time checkout ──
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;

      // ── Subscription lifecycle ──
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // ── Payment events ──
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(event.data.object as Stripe.Invoice);
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

// ── Drop-in checkout completed ──────────────────────────────────────────────

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  if (session.mode === "subscription") {
    await handleSubscriptionCheckout(session);
    return;
  }

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!existing || existing.status !== "PENDING") return;

  await prisma.$transaction(async (tx: any) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        stripePaymentIntentId: session.payment_intent as string,
      },
    });

    await tx.cageSlot.update({
      where: { id: existing.slotIdA },
      data: { status: "BOOKED" },
    });

    if (existing.slotIdB) {
      await tx.cageSlot.update({
        where: { id: existing.slotIdB },
        data: { status: "BOOKED" },
      });
    }

    await tx.waiver.upsert({
      where: { bookingId },
      update: {},
      create: {
        bookingId,
        signerName: "",
        agreementTextSnapshot: await getWaiverText(),
        status: "PENDING",
      },
    });
  });

  let hasWaiver = false;
  if (existing.memberId) {
    const { getMemberWaiverStatus } = await import("@/server/actions/waiver");
    const status = await getMemberWaiverStatus(existing.memberId);
    hasWaiver = status.signed && !status.needsResign;
  }

  if (hasWaiver) {
    try {
      const { pin } = await createAccessCode(bookingId);
      await notifyBookingConfirmed(bookingId, pin);
    } catch (err) {
      console.error("[webhook] Access code / notification failed:", err);
    }
  } else {
    notifyBookingConfirmed(bookingId, null).catch(() => {});
  }
}

// ── Subscription checkout completed (new member signup) ─────────────────────

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const memberId = session.metadata?.memberId;
  const tier = session.metadata?.tier;
  if (!memberId || !tier) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await prisma.member.update({
    where: { id: memberId },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: "ACTIVE",
      tier: tier === "TEAM" ? "TEAM" : "FAMILY",
    },
  });

  try {
    await notifyNewMember(memberId);
  } catch (err) {
    console.error("[webhook] Welcome notification failed:", err);
  }
}

// ── Subscription updated (upgrade/downgrade, status change) ─────────────────

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const member = await prisma.member.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!member) return;

  const status = mapSubscriptionStatus(subscription.status);
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId === process.env.STRIPE_TEAM_PRICE_ID ? "TEAM" : "FAMILY";

  await prisma.member.update({
    where: { id: member.id },
    data: {
      subscriptionStatus: status,
      tier: tier === "TEAM" ? "TEAM" : "FAMILY",
    },
  });
}

// ── Subscription cancelled ──────────────────────────────────────────────────

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const member = await prisma.member.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!member) return;

  await prisma.member.update({
    where: { id: member.id },
    data: { subscriptionStatus: "CANCELLED" },
  });

  try {
    await notifySubscriptionCancelled(member.id);
  } catch (err) {
    console.error("[webhook] Cancellation notification failed:", err);
  }
}

// ── Invoice paid (subscription renewal success) ─────────────────────────────

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const inv = invoice as any;
  const subscriptionId = typeof inv.subscription === "string"
    ? inv.subscription
    : inv.subscription?.id;
  if (!subscriptionId) return;

  const member = await prisma.member.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!member) return;

  if (member.subscriptionStatus === "PAST_DUE") {
    await prisma.member.update({
      where: { id: member.id },
      data: { subscriptionStatus: "ACTIVE" },
    });
  }
}

// ── Invoice payment failed (dunning) ────────────────────────────────────────

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const inv = invoice as any;
  const subscriptionId = typeof inv.subscription === "string"
    ? inv.subscription
    : inv.subscription?.id;
  if (!subscriptionId) return;

  const member = await prisma.member.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!member) return;

  await prisma.member.update({
    where: { id: member.id },
    data: { subscriptionStatus: "PAST_DUE" },
  });

  try {
    await notifyPaymentFailed(member.id);
  } catch (err) {
    console.error("[webhook] Payment failed notification failed:", err);
  }
}

// ── Checkout expired (drop-in didn't pay) ───────────────────────────────────

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== "PENDING") return;

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
}

// ── Refund ───────────────────────────────────────────────────────────────────

async function handleRefund(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;

  await prisma.booking.updateMany({
    where: {
      stripePaymentIntentId: charge.payment_intent as string,
      status: { notIn: ["CANCELLED"] },
    },
    data: { status: "CANCELLED" },
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): "ACTIVE" | "PAST_DUE" | "CANCELLED" | "NONE" {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "CANCELLED";
    default:
      return "NONE";
  }
}

async function getWaiverText(): Promise<string> {
  const template = await prisma.waiverTemplate.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  return template?.body ?? "Liability waiver text not configured.";
}
