import { prisma } from "@/lib/prisma";

const HOUR_MILESTONES = [
  { key: "10hr", minutes: 600 },
  { key: "25hr", minutes: 1500 },
  { key: "50hr", minutes: 3000 },
  { key: "100hr", minutes: 6000 },
];

async function getSummerWindow(year: number) {
  const [startSetting, endSetting] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "cage_rats_summer_start" } }),
    prisma.siteSetting.findUnique({ where: { key: "cage_rats_summer_end" } }),
  ]);

  const startStr = startSetting?.value ?? `${year}-05-26`;
  const endStr = endSetting?.value ?? `${year}-09-01`;

  return {
    start: new Date(startStr + "T00:00:00"),
    end: new Date(endStr + "T23:59:59"),
  };
}

async function getThresholdMinutes() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "cage_rats_threshold_minutes" },
  });
  return parseInt(setting?.value ?? "600", 10);
}

async function checkAndAwardMilestones(playerId: string, totalMinutes: number) {
  const awarded: string[] = [];

  for (const { key, minutes } of HOUR_MILESTONES) {
    if (totalMinutes < minutes) continue;

    try {
      await prisma.playerMilestones.create({
        data: { playerId, milestoneKey: key },
      });
      awarded.push(key);
    } catch {
      // unique constraint = already earned, skip
    }
  }

  return awarded;
}

async function updateSummerStats(
  playerId: string,
  sessionMinutes: number,
  sessionDate: Date,
) {
  const year = sessionDate.getFullYear();
  const window = await getSummerWindow(year);

  if (sessionDate < window.start || sessionDate > window.end) return null;

  const stats = await prisma.playerSummerStats.upsert({
    where: { playerId_year: { playerId, year } },
    create: { playerId, year, summerMinutes: sessionMinutes },
    update: { summerMinutes: { increment: sessionMinutes } },
  });

  if (stats.qualified) return stats;

  const threshold = await getThresholdMinutes();
  if (stats.summerMinutes >= threshold) {
    await prisma.playerSummerStats.update({
      where: { id: stats.id },
      data: { qualified: true },
    });

    const milestoneKey = `cage_rats_${year}`;
    try {
      await prisma.playerMilestones.create({
        data: { playerId, milestoneKey },
      });
    } catch {
      // already earned
    }

    return { ...stats, qualified: true, justQualified: true };
  }

  return stats;
}

export async function creditSessionHours(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slotA: { select: { startTime: true, endTime: true, date: true } },
      players: { select: { playerId: true } },
    },
  });

  if (!booking) return { credited: false, reason: "booking_not_found" };

  if (booking.bookingType === "BOTH_LANES") {
    return { credited: false, reason: "team_session" };
  }

  const playerIds = booking.players.map((bp) => bp.playerId);
  if (playerIds.length === 0) {
    return { credited: false, reason: "no_players_tagged" };
  }

  const sessionMinutes = Math.round(
    (booking.slotA.endTime.getTime() - booking.slotA.startTime.getTime()) /
      (1000 * 60),
  );

  if (sessionMinutes <= 0) {
    return { credited: false, reason: "invalid_duration" };
  }

  const results = [];

  for (const playerId of playerIds) {
    const hours = await prisma.playerHours.upsert({
      where: { playerId },
      create: {
        playerId,
        totalMinutes: sessionMinutes,
        lastSessionAt: booking.slotA.endTime,
      },
      update: {
        totalMinutes: { increment: sessionMinutes },
        lastSessionAt: booking.slotA.endTime,
      },
    });

    const milestones = await checkAndAwardMilestones(
      playerId,
      hours.totalMinutes,
    );

    const summer = await updateSummerStats(
      playerId,
      sessionMinutes,
      booking.slotA.date,
    );

    results.push({ playerId, totalMinutes: hours.totalMinutes, milestones, summer });
  }

  return { credited: true, sessionMinutes, results };
}
