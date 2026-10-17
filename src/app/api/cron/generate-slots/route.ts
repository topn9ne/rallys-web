import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.siteSetting.findMany();
  const settingsMap = Object.fromEntries(
    settings.map((s: { key: string; value: string }) => [s.key, s.value])
  );
  const advanceDays = parseInt(settingsMap.booking_advance_days ?? "30", 10);
  const timezone = settingsMap.timezone ?? "America/Chicago";

  const hours = await prisma.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  const hoursByDay = new Map(hours.map((h) => [h.dayOfWeek, h]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lanes: Array<"A" | "B"> = ["A", "B"];
  const slotDuration = 60; // minutes
  let created = 0;
  let skipped = 0;

  for (let d = 0; d <= advanceDays; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dow = date.getDay(); // 0 = Sunday

    const dayHours = hoursByDay.get(dow);
    if (!dayHours || !dayHours.isOpen) continue;

    const [openH, openM] = dayHours.openTime.split(":").map(Number);
    const [closeH, closeM] = dayHours.closeTime.split(":").map(Number);
    const dayStartMinutes = openH * 60 + openM;
    const dayEndMinutes = closeH * 60 + closeM;

    const dateStr = date.toISOString().split("T")[0];

    for (const lane of lanes) {
      let current = dayStartMinutes;
      while (current + slotDuration <= dayEndMinutes) {
        const hh = String(Math.floor(current / 60)).padStart(2, "0");
        const mm = String(current % 60).padStart(2, "0");
        const slotStart = new Date(`${dateStr}T${hh}:${mm}:00`);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

        const existing = await prisma.cageSlot.findFirst({
          where: {
            lane,
            date,
            startTime: slotStart,
          },
          select: { id: true },
        });

        if (existing) {
          skipped++;
        } else {
          await prisma.cageSlot.create({
            data: {
              lane,
              date,
              startTime: slotStart,
              endTime: slotEnd,
              status: "AVAILABLE",
            },
          });
          created++;
        }

        current += slotDuration;
      }
    }
  }

  return NextResponse.json({ ok: true, created, skipped, advanceDays });
}
