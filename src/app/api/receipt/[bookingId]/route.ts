import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(date));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      slot: { include: { theme: true, bike: true } },
      bookingAddons: { include: { addon: true } },
      discountCode: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Auth: must be the booking's customer OR an admin staff member
  const isCustomer = booking.customerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isCustomer && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Attempt to fetch card last4 from Stripe
  let cardLast4: string | null = null;
  if (booking.stripePaymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(
        booking.stripePaymentIntentId
      );
      cardLast4 =
        (pi.latest_charge as any)?.payment_method_details?.card?.last4 ??
        null;

      // If latest_charge is just an ID string, expand it
      if (!cardLast4 && typeof pi.latest_charge === "string") {
        const charge = await stripe.charges.retrieve(pi.latest_charge);
        cardLast4 = charge.payment_method_details?.card?.last4 ?? null;
      }
    } catch {
      // Stripe lookup failed — proceed without card info
      cardLast4 = null;
    }
  }

  const rideName =
    booking.slot.rideType === "THEME"
      ? (booking.slot.theme?.name ?? "Theme Ride")
      : "Group Ride";

  const shortId = booking.id.slice(-8);
  const rideDate = formatDate(booking.slot.date);
  const timeWindow = `${formatTime(booking.slot.startTime)} - ${formatTime(booking.slot.endTime)}`;

  // Build line items
  const lineItems: { label: string; amount: string; bold?: boolean; negative?: boolean }[] = [];

  lineItems.push({
    label: `${rideName} (${booking.seats} seat${booking.seats > 1 ? "s" : ""})`,
    amount: formatCents(booking.baseAmountCents),
  });

  for (const ba of booking.bookingAddons) {
    lineItems.push({
      label: ba.addon.name,
      amount: formatCents(ba.priceCentsAtPurchase),
    });
  }

  if (booking.discountAmountCents > 0) {
    const discountLabel = booking.discountCode
      ? `Discount (${booking.discountCode.code})`
      : "Discount";
    lineItems.push({
      label: discountLabel,
      amount: `\u2212${formatCents(booking.discountAmountCents)}`,
      negative: true,
    });
  }

  lineItems.push({
    label: "Tax",
    amount: formatCents(booking.taxAmountCents),
  });

  lineItems.push({
    label: "Total",
    amount: formatCents(booking.totalAmountCents),
    bold: true,
  });

  const lineItemsHtml = lineItems
    .map(
      (item) => `
      <tr style="${item.bold ? "font-weight:700;border-top:2px solid #333;" : ""}">
        <td style="padding:8px 0;${item.negative ? "color:#b91c1c;" : ""}">${escapeHtml(item.label)}</td>
        <td style="padding:8px 0;text-align:right;${item.negative ? "color:#b91c1c;" : ""}">${escapeHtml(item.amount)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Railside Rides — Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #fff;
      color: #1a1a1a;
      padding: 40px 20px;
    }
    .receipt {
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e5e5;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 14px;
      color: #666;
    }
    .details {
      margin-bottom: 24px;
    }
    .details table {
      width: 100%;
      font-size: 14px;
    }
    .details td {
      padding: 4px 0;
    }
    .details td:first-child {
      color: #666;
      width: 140px;
    }
    .line-items {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .payment {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin-bottom: 32px;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #999;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>Railside Rides, LLC</h1>
      <p>Dallas, TX</p>
    </div>

    <div class="details">
      <table>
        <tr>
          <td>Receipt #</td>
          <td>...${escapeHtml(shortId)}</td>
        </tr>
        <tr>
          <td>Date of Ride</td>
          <td>${escapeHtml(rideDate)}</td>
        </tr>
        <tr>
          <td>Ride</td>
          <td>${escapeHtml(rideName)}</td>
        </tr>
        <tr>
          <td>Time</td>
          <td>${escapeHtml(timeWindow)}</td>
        </tr>
        <tr>
          <td>Customer</td>
          <td>${escapeHtml(booking.customer.name ?? "")}</td>
        </tr>
      </table>
    </div>

    <table class="line-items">
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    ${cardLast4 ? `<p class="payment">Paid via card ending in ${escapeHtml(cardLast4)}</p>` : ""}

    <div class="footer">
      Thank you for riding with us!
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": "inline",
    },
  });
}
