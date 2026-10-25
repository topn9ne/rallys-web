export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  Fire,
  Trophy,
  TShirt,
  CheckCircle,
  Medal,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Cage Rats | Admin | Rally's Indoor Training" };

const MILESTONES = [
  { key: "25hr", minutes: 1500, label: "25 Hours", reward: "Name on the wall" },
  { key: "50hr", minutes: 3000, label: "50 Hours", reward: "Hoodie" },
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

async function getCageRatsData() {
  const summer = await getSummerConfig();
  const now = new Date();
  const isSummerActive = now >= summer.start && now <= summer.end;

  const players = await prisma.player.findMany({
    include: {
      member: { select: { name: true, email: true } },
      hours: { select: { totalMinutes: true, lastSessionAt: true } },
      summerStats: {
        where: { year: summer.year },
        select: { summerMinutes: true, qualified: true, shirtAwarded: true },
      },
      milestones: {
        select: { id: true, milestoneKey: true, achievedAt: true, fulfilled: true },
        orderBy: { achievedAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const approaching: {
    player: typeof players[number];
    milestone: (typeof MILESTONES)[number];
    remaining: number;
  }[] = [];

  const unfulfilled: {
    player: typeof players[number];
    milestoneId: string;
    milestoneKey: string;
    achievedAt: Date;
  }[] = [];

  for (const player of players) {
    const totalMinutes = player.hours?.totalMinutes ?? 0;

    for (const ms of MILESTONES) {
      const alreadyEarned = player.milestones.some((m) => m.milestoneKey === ms.key);
      if (!alreadyEarned && totalMinutes < ms.minutes) {
        const remaining = ms.minutes - totalMinutes;
        if (remaining <= 120) {
          approaching.push({ player, milestone: ms, remaining });
        }
        break;
      }
    }

    for (const m of player.milestones) {
      if (!m.fulfilled && !m.milestoneKey.startsWith("cage_rats_") && m.milestoneKey !== "5x_club") {
        unfulfilled.push({
          player,
          milestoneId: m.id,
          milestoneKey: m.milestoneKey,
          achievedAt: m.achievedAt,
        });
      }
    }
  }

  approaching.sort((a, b) => a.remaining - b.remaining);

  const summerLeaderboard = players
    .filter((p) => (p.summerStats[0]?.summerMinutes ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.summerStats[0]?.summerMinutes ?? 0) - (a.summerStats[0]?.summerMinutes ?? 0),
    )
    .slice(0, 10);

  const qualifiedCount = players.filter(
    (p) => p.summerStats[0]?.qualified,
  ).length;

  const totalTrackedPlayers = players.filter(
    (p) => (p.hours?.totalMinutes ?? 0) > 0,
  ).length;

  return {
    summer,
    isSummerActive,
    approaching,
    unfulfilled,
    summerLeaderboard,
    qualifiedCount,
    totalTrackedPlayers,
    totalPlayers: players.length,
  };
}

const cardShadow =
  "shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.12)]";

export default async function AdminCageRatsPage() {
  const data = await getCageRatsData();
  const thresholdHours = Math.floor(data.summer.thresholdMinutes / 60);

  return (
    <div className="flex flex-col gap-[22px]">
      <AdminPageHeader
        title="Cage Rats"
        count={data.totalTrackedPlayers}
        icon={<Fire size={18} weight="regular" color="#ffffff" />}
      />

      {/* KPI ROW */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div
          className={cn(
            "relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-[14px] bg-white px-5 py-[18px] text-admin-ink",
            cardShadow,
          )}
        >
          <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.6px] text-admin-text-sub">
            <Fire size={16} weight="regular" color="#2d4a7a" />
            Active Players
          </div>
          <div className="font-display text-[32px] leading-none tracking-[-1px]">
            {data.totalTrackedPlayers}
          </div>
          <div className="mt-1 text-xs text-admin-text-sub">
            of {data.totalPlayers} total
          </div>
        </div>

        {data.isSummerActive && (
          <div
            className={cn(
              "relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-[14px] bg-admin-primary px-5 py-[18px] text-white shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.18)]",
            )}
          >
            <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.6px] text-white/85">
              <TShirt size={16} weight="regular" color="#ffffff" />
              Cage Rats {data.summer.year}
            </div>
            <div className="font-display text-[32px] leading-none tracking-[-1px]">
              {data.qualifiedCount}
            </div>
            <div className="mt-1 text-xs text-white/75">
              qualified ({thresholdHours}h threshold)
            </div>
          </div>
        )}

        <div
          className={cn(
            "relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-[14px] bg-white px-5 py-[18px] text-admin-ink",
            cardShadow,
          )}
        >
          <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.6px] text-admin-text-sub">
            <Trophy size={16} weight="regular" color="#2d4a7a" />
            Approaching
          </div>
          <div className="font-display text-[32px] leading-none tracking-[-1px]">
            {data.approaching.length}
          </div>
          <div className="mt-1 text-xs text-admin-text-sub">
            within 2h of a milestone
          </div>
        </div>

        <div
          className={cn(
            "relative flex min-h-[110px] flex-col justify-between overflow-hidden rounded-[14px] bg-white px-5 py-[18px] text-admin-ink",
            cardShadow,
          )}
        >
          <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.6px] text-admin-text-sub">
            <Medal size={16} weight="regular" color="#2d4a7a" />
            Unfulfilled
          </div>
          <div className="font-display text-[32px] leading-none tracking-[-1px]">
            {data.unfulfilled.length}
          </div>
          <div className="mt-1 text-xs text-admin-text-sub">
            rewards to give out
          </div>
        </div>
      </div>

      {/* TWO PANELS */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {/* Approaching Milestones */}
        <div className={cn("rounded-[14px] bg-white px-[22px] py-5 text-admin-ink", cardShadow)}>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]">
            Approaching Milestones
          </h2>
          <p className="mt-1 text-xs text-admin-text-sub">
            Players within 2 hours of their next milestone
          </p>

          {data.approaching.length === 0 ? (
            <div className="mt-[18px] rounded-[10px] border border-dashed border-admin-line px-5 py-8 text-center text-[13px] text-admin-text-sub">
              No players approaching a milestone right now.
            </div>
          ) : (
            <ul className="mt-[18px]">
              {data.approaching.map((item, i) => (
                <li
                  key={`${item.player.id}-${item.milestone.key}`}
                  className={cn(
                    "flex items-center gap-3 py-[11px]",
                    i < data.approaching.length - 1 && "border-b border-admin-line",
                  )}
                >
                  <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-amber-100">
                    <Trophy size={16} weight="regular" color="#92400e" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold tracking-[-0.1px] text-admin-ink">
                      {item.player.firstName} {item.player.lastName}
                    </div>
                    <div className="mt-[1px] text-xs text-admin-text-sub">
                      {item.milestone.label} &middot; {item.milestone.reward}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold tracking-[-0.1px] text-amber-600">
                      {formatHours(item.remaining)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-admin-text-sub">to go</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fulfillment Checklist */}
        <div className={cn("rounded-[14px] bg-white px-[22px] py-5 text-admin-ink", cardShadow)}>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]">
            Fulfillment Checklist
          </h2>
          <p className="mt-1 text-xs text-admin-text-sub">
            Milestones earned — mark fulfilled when the reward is given
          </p>

          {data.unfulfilled.length === 0 ? (
            <div className="mt-[18px] rounded-[10px] border border-dashed border-admin-line px-5 py-8 text-center text-[13px] text-admin-text-sub">
              <div className="mx-auto mb-2 grid h-[42px] w-[42px] place-items-center rounded-[10px] bg-green-50">
                <CheckCircle size={20} weight="regular" color="#16a34a" />
              </div>
              All rewards fulfilled!
            </div>
          ) : (
            <ul className="mt-[18px]">
              {data.unfulfilled.map((item, i) => {
                const def = MILESTONES.find((ms) => ms.key === item.milestoneKey);
                return (
                  <li
                    key={item.milestoneId}
                    className={cn(
                      "flex items-center gap-3 py-[11px]",
                      i < data.unfulfilled.length - 1 && "border-b border-admin-line",
                    )}
                  >
                    <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-blue-50">
                      <Medal size={16} weight="regular" color="#1d4ed8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold tracking-[-0.1px] text-admin-ink">
                        {item.player.firstName} {item.player.lastName}
                      </div>
                      <div className="mt-[1px] text-xs text-admin-text-sub">
                        {def?.label ?? item.milestoneKey} &middot; {def?.reward ?? ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-[11px] uppercase text-admin-text-sub">
                        {new Date(item.achievedAt)
                          .toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          .toUpperCase()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Summer Leaderboard */}
      {data.isSummerActive && data.summerLeaderboard.length > 0 && (
        <div className={cn("rounded-[14px] bg-white px-[22px] py-5 text-admin-ink", cardShadow)}>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]">
            Summer {data.summer.year} Leaderboard
          </h2>
          <p className="mt-1 text-xs text-admin-text-sub">
            Top players by summer cage hours
          </p>

          <div className="mt-[18px] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-line">
                  <th className="pb-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-admin-text-sub">
                    #
                  </th>
                  <th className="pb-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-admin-text-sub">
                    Player
                  </th>
                  <th className="pb-2 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.6px] text-admin-text-sub">
                    Parent
                  </th>
                  <th className="pb-2 pr-4 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-admin-text-sub">
                    Summer Hours
                  </th>
                  <th className="pb-2 text-right text-[11px] font-semibold uppercase tracking-[0.6px] text-admin-text-sub">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.summerLeaderboard.map((player, i) => {
                  const summerMinutes = player.summerStats[0]?.summerMinutes ?? 0;
                  const qualified = player.summerStats[0]?.qualified ?? false;
                  const progress = Math.min(
                    (summerMinutes / data.summer.thresholdMinutes) * 100,
                    100,
                  );
                  return (
                    <tr
                      key={player.id}
                      className={cn(
                        i < data.summerLeaderboard.length - 1 && "border-b border-admin-line",
                      )}
                    >
                      <td className="py-2.5 pr-4 font-mono text-xs text-admin-text-sub">
                        {i + 1}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="font-semibold text-admin-ink">
                          {player.firstName} {player.lastName}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-admin-text-sub">
                        {player.member?.name ?? player.member?.email ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 sm:block">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                qualified ? "bg-green-500" : progress >= 75 ? "bg-amber-500" : "bg-brand-blue",
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="font-semibold text-admin-ink">
                            {formatHours(summerMinutes)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        {qualified ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                            Qualified
                          </span>
                        ) : (
                          <span className="text-xs text-admin-text-sub">
                            {formatHours(data.summer.thresholdMinutes - summerMinutes)} left
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
