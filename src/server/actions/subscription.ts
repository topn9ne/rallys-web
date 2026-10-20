"use server";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { MemberTier } from "@prisma/client";

export async function createSubscriptionCheckout(tier: MemberTier, annual = false) {
  const user = await getUser();
  if (!user) return { error: "You must be signed in." };

  const member = await prisma.member.findUnique({ where: { id: user.id } });
  if (!member) return { error: "Member profile not found." };

  if (member.subscriptionStatus === "ACTIVE") {
    return { error: "You already have an active subscription." };
  }

  let priceId: string | undefined;
  if (annual) {
    priceId =
      tier === "TEAM"
        ? process.env.STRIPE_TEAM_ANNUAL_PRICE_ID
        : process.env.STRIPE_FAMILY_ANNUAL_PRICE_ID;
  }
  if (!priceId) {
    priceId =
      tier === "TEAM"
        ? process.env.STRIPE_TEAM_PRICE_ID
        : process.env.STRIPE_MEMBER_PRICE_ID;
  }

  if (!priceId) {
    return { error: "Subscription pricing not configured." };
  }

  let stripeCustomerId = member.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: member.email,
      name: member.name,
      phone: member.phone,
      metadata: { memberId: member.id },
    });
    stripeCustomerId = customer.id;
    await prisma.member.update({
      where: { id: member.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      memberId: member.id,
      tier,
    },
    success_url: `${appUrl}/account/membership?status=active`,
    cancel_url: `${appUrl}/account/membership`,
    subscription_data: {
      metadata: {
        memberId: member.id,
        tier,
      },
    },
  });

  return { url: session.url };
}

export async function createBillingPortalSession() {
  const user = await getUser();
  if (!user) return { error: "You must be signed in." };

  const member = await prisma.member.findUnique({ where: { id: user.id } });
  if (!member?.stripeCustomerId) {
    return { error: "No billing account found." };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  const session = await stripe.billingPortal.sessions.create({
    customer: member.stripeCustomerId,
    return_url: `${appUrl}/account/membership`,
  });

  return { url: session.url };
}

export async function getMemberSubscription() {
  const user = await getUser();
  if (!user) return null;

  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: {
      tier: true,
      subscriptionStatus: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
    },
  });

  if (!member) return null;

  let currentPeriodEnd: Date | null = null;
  if (member.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(member.stripeSubscriptionId);
      currentPeriodEnd = new Date((sub as any).current_period_end * 1000);
    } catch {}
  }

  return {
    tier: member.tier,
    status: member.subscriptionStatus,
    currentPeriodEnd,
  };
}
