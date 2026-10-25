export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Cage Rats | Rally's Indoor Training" };

const MILESTONES = [
  { key: "25hr", minutes: 1500, label: "25 Hours", reward: "Name on the wall" },
  { key: "50hr", minutes: 3000, label: "50 Hours", reward: "Cage Rats hoodie" },
  { key: "100hr", minutes: 6000, label: "100 Hours", reward: "100 Hour Club" },
] as const;

function formatHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

async function getSummerConfig() {
  const year = new Date().getFullYear();
  const [startSetting, endSetting, thresholdSetting] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "cage_rats_summer_start" } }),
    prisma.siteSetting.findUnique({ where: { key: "cage_rats_summer_end" } }),
    prisma.siteSetting.findUnique({ where: { key: "cage_rats_threshold_minutes" } }),
  ]);
  return {
    year,
    start: new Date((startSetting?.value ?? `${year}-05-26`) + "T00:00:00"),
    end: new Date((endSetting?.value ?? `${year}-09-01`) + "T23:59:59"),
    thresholdMinutes: parseInt(thresholdSetting?.value ?? "600", 10),
  };
}

function getConsecutiveSummers(
  stats: { year: number; qualified: boolean }[],
  currentYear: number,
) {
  const qualifiedYears = new Set(
    stats.filter((s) => s.qualified).map((s) => s.year),
  );
  let streak = 0;
  for (let y = currentYear; y >= currentYear - 20; y--) {
    if (qualifiedYears.has(y)) streak++;
    else break;
  }
  return streak;
}

export default async function CageRatsPage() {
  const user = await requireUser("/account/cage-rats");
  const summer = await getSummerConfig();

  const players = await prisma.player.findMany({
    where: { memberId: user.id },
    include: {
      hours: { select: { totalMinutes: true, lastSessionAt: true } },
      summerStats: {
        select: { year: true, summerMinutes: true, qualified: true, shirtAwarded: true },
        orderBy: { year: "desc" },
      },
      milestones: {
        select: { milestoneKey: true, achievedAt: true },
        orderBy: { achievedAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const now = new Date();
  const isSummerActive = now >= summer.start && now <= summer.end;
  const thresholdHours = Math.floor(summer.thresholdMinutes / 60);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cage Rats</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track cage hours, earn milestones, and rep Cage Rats all summer.
        </p>
      </div>

      {players.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">
            No players on your account yet.{" "}
            <a href="/account/players" className="font-medium text-brand-blue hover:underline">
              Add a player
            </a>{" "}
            to start tracking hours.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {players.map((player) => {
            const totalMinutes = player.hours?.totalMinutes ?? 0;
            const currentSummer = player.summerStats.find(
              (s) => s.year === summer.year,
            );
            const summerMinutes = currentSummer?.summerMinutes ?? 0;
            const qualified = currentSummer?.qualified ?? false;
            const consecutiveSummers = getConsecutiveSummers(
              player.summerStats,
              summer.year,
            );

            const nextMilestone = MILESTONES.find(
              (m) => totalMinutes < m.minutes,
            );
            const earnedMilestones = player.milestones.filter(
              (m) => !m.milestoneKey.startsWith("cage_rats_") && m.milestoneKey !== "5x_club",
            );
            const cageRatYears = player.milestones
              .filter((m) => m.milestoneKey.startsWith("cage_rats_"))
              .map((m) => m.milestoneKey.replace("cage_rats_", ""));

            const summerProgress = Math.min(
              (summerMinutes / summer.thresholdMinutes) * 100,
              100,
            );

            return (
              <div
                key={player.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Player header */}
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {player.firstName} {player.lastName}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-500">
                        {player.positions && <span>{player.positions}</span>}
                        {player.school && <span>{player.school}</span>}
                        {player.travelTeam && <span>{player.travelTeam}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand-blue">
                        {formatHours(totalMinutes)}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Lifetime
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-4">
                  {/* Summer Progress */}
                  {isSummerActive && (
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-700">
                          Summer {summer.year}
                        </span>
                        {qualified ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                            Cage Rat Qualified
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {formatHours(summerMinutes)} / {thresholdHours}h
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            qualified
                              ? "bg-green-500"
                              : summerProgress >= 75
                                ? "bg-amber-500"
                                : "bg-brand-blue"
                          }`}
                          style={{ width: `${summerProgress}%` }}
                        />
                      </div>
                      {!qualified && summerMinutes > 0 && (
                        <p className="mt-1.5 text-xs text-gray-500">
                          {formatHours(summer.thresholdMinutes - summerMinutes)} to go for your Cage Rats shirt
                        </p>
                      )}
                    </div>
                  )}

                  {/* Off-season summer recap */}
                  {!isSummerActive && cageRatYears.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Cage Rat:</span>
                      <div className="flex flex-wrap gap-1">
                        {cageRatYears.map((year) => (
                          <span
                            key={year}
                            className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700"
                          >
                            {year}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consecutive summers */}
                  {consecutiveSummers >= 2 && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                      <span className="text-sm">
                        <span className="font-bold text-amber-700">{consecutiveSummers}</span>{" "}
                        <span className="text-amber-600">consecutive summers</span>
                      </span>
                      {consecutiveSummers >= 5 && (
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
                          5X Club
                        </span>
                      )}
                    </div>
                  )}

                  {/* Next Milestone */}
                  {nextMilestone && (
                    <div className="rounded-lg bg-blue-50 px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-800">
                          Next: {nextMilestone.label}
                        </span>
                        <span className="text-xs text-blue-600">
                          {formatHours(nextMilestone.minutes - totalMinutes)} to go
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-blue-600">
                        {nextMilestone.reward}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-200">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${Math.min(
                              (totalMinutes / nextMilestone.minutes) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Milestones Earned */}
                  {earnedMilestones.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Milestones
                      </h4>
                      <div className="mt-1.5 space-y-1">
                        {earnedMilestones.map((m) => {
                          const def = MILESTONES.find((ms) => ms.key === m.milestoneKey);
                          return (
                            <div
                              key={m.milestoneKey}
                              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5"
                            >
                              <span className="text-sm font-semibold text-gray-800">
                                {def?.label ?? m.milestoneKey}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(m.achievedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All milestones cleared */}
                  {!nextMilestone && totalMinutes > 0 && (
                    <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-center">
                      <p className="text-sm font-bold text-amber-800">
                        100 Hour Club Member
                      </p>
                      <p className="mt-0.5 text-xs text-amber-600">
                        All milestones earned. Legend status.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
