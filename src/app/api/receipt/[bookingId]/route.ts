import { NextResponse } from "next/server";
import { getUser, isAdmin } from "@/lib/auth";
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

function laneLabel(bookingType: string, slotA: { lane: string }): string {
  if (bookingType === "BOTH_LANES") return "Both Lanes (A & B)";
  return `Lane ${slotA.lane}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      member: true,
      slotA: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isOwner = booking.memberId === user.id;
  const admin = await isAdmin();
  if (!isOwner && !admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let cardLast4: string | null = null;
  if (booking.stripePaymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(
        booking.stripePaymentIntentId
      );
      cardLast4 =
        (pi.latest_charge as any)?.payment_method_details?.card?.last4 ??
        null;

      if (!cardLast4 && typeof pi.latest_charge === "string") {
        const charge = await stripe.charges.retrieve(pi.latest_charge);
        cardLast4 = charge.payment_method_details?.card?.last4 ?? null;
      }
    } catch {
      cardLast4 = null;
    }
  }

  const lane = laneLabel(booking.bookingType, booking.slotA);
  const customerName = booking.member?.name ?? booking.guestName ?? "";
  const shortId = booking.id.slice(-8);
  const sessionDate = formatDate(booking.slotA.date);
  const timeWindow = `${formatTime(booking.slotA.startTime)} - ${formatTime(booking.slotA.endTime)}`;

  const lineItems: { label: string; amount: string; bold?: boolean }[] = [];

  lineItems.push({
    label: `Cage Session — ${lane}`,
    amount: formatCents(booking.baseAmountCents),
  });

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
        <td style="padding:8px 0;">${escapeHtml(item.label)}</td>
        <td style="padding:8px 0;text-align:right;">${escapeHtml(item.amount)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Rally's Indoor Training — Receipt</title>
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
      <h1>Rally's Indoor Training LLC</h1>
      <p>Hastings, NE</p>
    </div>

    <div class="details">
      <table>
        <tr>
          <td>Receipt #</td>
          <td>...${escapeHtml(shortId)}</td>
        </tr>
        <tr>
          <td>Date of Session</td>
          <td>${escapeHtml(sessionDate)}</td>
        </tr>
        <tr>
          <td>Lane</td>
          <td>${escapeHtml(lane)}</td>
        </tr>
        <tr>
          <td>Time</td>
          <td>${escapeHtml(timeWindow)}</td>
        </tr>
        <tr>
          <td>Customer</td>
          <td>${escapeHtml(customerName)}</td>
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
      Thank you for choosing Rally's Indoor Training!
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
