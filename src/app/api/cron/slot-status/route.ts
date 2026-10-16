import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Mark slots as COMPLETED once their end time has passed
  const endedSlots = await prisma.rideSlot.findMany({
    where: {
      status: { in: ["AVAILABLE", "FILLING", "FULL"] },
      endTime: { lte: now },
    },
    select: { id: true },
  });

  let completed = 0;
  if (endedSlots.length) {
    const ids = endedSlots.map((s) => s.id);
    await prisma.rideSlot.updateMany({
      where: { id: { in: ids } },
      data: { status: "COMPLETED" },
    });
    await prisma.booking.updateMany({
      where: { slotId: { in: ids }, status: "CONFIRMED" },
      data: { status: "COMPLETED" },
    });
    completed = endedSlots.length;
  }

  return NextResponse.json({ ok: true, completed });
}
