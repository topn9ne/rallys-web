import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { twilioClient, getTwilioFrom } from "@/lib/twilio";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

  const unsigned = await prisma.waiver.findMany({
    where: {
      status: "PENDING",
      booking: {
        status: "CONFIRMED",
        slotA: { startTime: { lte: twoHoursFromNow } },
      },
    },
    include: {
      booking: { include: { member: true, slotA: true } },
    },
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  let sent = 0;

  for (const waiver of unsigned) {
    const phone = waiver.booking?.guestPhone ?? waiver.booking?.member?.phone;
    const bookingId = waiver.bookingId;
    if (!phone || !bookingId) continue;

    try {
      await twilioClient.messages.create({
        from: getTwilioFrom(),
        to: phone,
        body: `Rally's reminder: Please sign your waiver before your session. ${appUrl}/waiver/${bookingId}`,
      });
      sent++;
    } catch (err) {
      console.error(`[cron] Waiver alert failed for waiver ${waiver.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
