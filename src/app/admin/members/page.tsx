export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export const metadata = { title: "Members | Admin | Rally's Indoor Training" };

const MILESTONE_LABELS: Record<string, string> = {
  "10hr": "10 hrs",
  "25hr": "25 hrs",
  "50hr": "50 hrs",
  "100hr": "100 hrs",
};

function getMilestoneLabel(key: string) {
  if (MILESTONE_LABELS[key]) return MILESTONE_LABELS[key];
  if (key.startsWith("cage_rats_")) return `Cage Rat ${key.replace("cage_rats_", "")}`;
  return key;
}

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({
    include: {
      players: {
        include: {
          hours: { select: { totalMinutes: true, lastSessionAt: true } },
          milestones: { select: { milestoneKey: true, achievedAt: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[2px] text-admin-accent">
          Members
        </p>
        <h1 className="mt-1 font-display text-[32px] leading-none tracking-[-0.5px]">
          Member Directory
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {members.length} member{members.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-[14px] bg-white/[0.06] p-5 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{member.name || "—"}</h2>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                  <span>{member.email}</span>
                  {member.phone && <span>{member.phone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                    member.subscriptionStatus === "ACTIVE"
                      ? "bg-green-500/20 text-green-400"
                      : member.subscriptionStatus === "PAST_DUE"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-white/10 text-white/40"
                  }`}
                >
                  {member.subscriptionStatus}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white/60">
                  {member.tier}
                </span>
              </div>
            </div>

            <div className="mt-1 text-xs text-white/40">
              {member._count.bookings} booking{member._count.bookings !== 1 ? "s" : ""} · Joined{" "}
              {member.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            {member.players.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[1px] text-white/40">
                  Players
                </h3>
                {member.players.map((player) => {
                  const hours = Math.floor(
                    (player.hours?.totalMinutes ?? 0) / 60,
                  );
                  const mins = (player.hours?.totalMinutes ?? 0) % 60;
                  return (
                    <div
                      key={player.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-white/[0.04] px-3 py-2"
                    >
                      <span className="font-medium">{player.name}</span>
                      {player.positions && (
                        <span className="text-xs text-white/40">
                          {player.positions}
                        </span>
                      )}
                      {player.school && (
                        <span className="text-xs text-white/40">
                          {player.school}
                        </span>
                      )}
                      {(player.hours?.totalMinutes ?? 0) > 0 && (
                        <span className="text-xs font-semibold text-admin-accent">
                          {hours}h {mins > 0 ? `${mins}m` : ""}
                        </span>
                      )}
                      {player.milestones.length > 0 && (
                        <div className="flex gap-1">
                          {player.milestones.map((m) => (
                            <span
                              key={m.milestoneKey}
                              className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400"
                            >
                              {getMilestoneLabel(m.milestoneKey)}
                            </span>
                          ))}
                        </div>
                      )}
                      {player.hours?.lastSessionAt && (
                        <span className="text-[10px] text-white/30">
                          Last session{" "}
                          {player.hours.lastSessionAt.toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <div className="rounded-[14px] bg-white/[0.04] p-8 text-center text-white/40">
            No members yet.
          </div>
        )}
      </div>
    </div>
  );
}
