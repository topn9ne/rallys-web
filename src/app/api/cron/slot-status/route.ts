import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  if (endedSlots.length) {
    const ids = endedSlots.map((s: { id: string }) => s.id);
    await prisma.cageSlot.updateMany({
      where: { id: { in: ids } },
      data: { status: "COMPLETED" },
    });
    await prisma.booking.updateMany({
      where: {
        OR: [{ slotIdA: { in: ids } }, { slotIdB: { in: ids } }],
        status: "CONFIRMED",
      },
      data: { status: "COMPLETED" },
    });
    completed = endedSlots.length;
  }

  const expiredCodes = await prisma.accessCode.updateMany({
    where: {
      status: { in: ["SETTING", "ACTIVE"] },
      endsAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({ ok: true, completed, expiredCodes: expiredCodes.count });
}
