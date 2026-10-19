import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creditSessionHours } from "@/server/services/cageRats";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const endedSlots = await prisma.cageSlot.findMany({
    where: {
      status: { in: ["AVAILABLE", "BOOKED"] },
      endTime: { lte: now },
    },
    select: { id: true },
  });

  let completed = 0;
  let hoursCredited = 0;
  if (endedSlots.length) {
    const ids = endedSlots.map((s: { id: string }) => s.id);
    await prisma.cageSlot.updateMany({
      where: { id: { in: ids } },
      data: { status: "COMPLETED" },
    });

    const completedBookings = await prisma.booking.findMany({
      where: {
        OR: [{ slotIdA: { in: ids } }, { slotIdB: { in: ids } }],
        status: "CONFIRMED",
      },
      select: { id: true },
    });

    if (completedBookings.length > 0) {
      await prisma.booking.updateMany({
        where: { id: { in: completedBookings.map((b) => b.id) } },
        data: { status: "COMPLETED" },
      });

      for (const booking of completedBookings) {
        try {
          const result = await creditSessionHours(booking.id);
          if (result.credited) hoursCredited++;
        } catch (err) {
          console.error(`[cron] Cage Rats credit failed for ${booking.id}:`, err);
        }
      }
    }

    completed = endedSlots.length;
  }

  const expiredCodes = await prisma.accessCode.updateMany({
    where: {
      status: { in: ["SETTING", "ACTIVE"] },
      endsAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({
    ok: true,
    completed,
    hoursCredited,
    expiredCodes: expiredCodes.count,
  });
}
