import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyBookingReminder } from "@/server/services/notify";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const upcoming = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      reminderSent: false,
      slotA: {
        startTime: { gte: now, lte: oneHourFromNow },
      },
    },
    select: { id: true },
  });

  let sent = 0;
  for (const booking of upcoming) {
    try {
      await notifyBookingReminder(booking.id);
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });
      sent++;
    } catch (err) {
      console.error(`[cron] Reminder failed for booking ${booking.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
