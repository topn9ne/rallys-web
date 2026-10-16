"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const STRIPE_TAX_RATE_ID = "txr_1Tds8JAH2pgWWjUlRIUkgUHQ";

export async function createShopCheckoutSession(formData: FormData) {
  const bikeId = formData.get("bikeId") as string;
  const itemIds: string[] = JSON.parse((formData.get("itemIds") as string) || "[]");
  const gratuityAmountCents = Number(formData.get("gratuityAmountCents") || 0);

  if (!bikeId || (itemIds.length === 0 && gratuityAmountCents === 0)) {
    return { error: "Select at least one item or add a gratuity." };
  }

  const items = itemIds.length
    ? await prisma.inRideUpsellItem.findMany({
        where: { id: { in: itemIds }, active: true },
      })
    : [];

  const lineItems = [
    ...items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: item.priceCents,
      },
      quantity: 1,
      tax_rates: [STRIPE_TAX_RATE_ID],
    })),
    ...(gratuityAmountCents > 0
      ? [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Gratuity for your guide" },
              unit_amount: gratuityAmountCents,
            },
            quantity: 1,
          },
        ]
      : []),
  ];

  if (lineItems.length === 0) return { error: "Nothing to purchase." };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    metadata: {
      type: "shop",
      bikeId,
      itemIds: JSON.stringify(itemIds),
      gratuityAmountCents: gratuityAmountCents.toString(),
    },
    success_url: `${APP_URL}/shop/${bikeId}/thanks`,
    cancel_url: `${APP_URL}/shop/${bikeId}`,
  });

  return { url: session.url };
}

// Looks up the active slot for a bike using the buffer window
export async function getActiveSlotForBike(bikeId: string) {
  const now = new Date();
  return prisma.rideSlot.findFirst({
    where: {
      bikeId,
      startTime: { lte: now },
      bufferEndTime: { gte: now },
    },
    include: {
      theme: true,
      staffAssignments: { include: { staff: true }, take: 1 },
    },
  });
}

