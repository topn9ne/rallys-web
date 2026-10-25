export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemberFilters } from "@/components/admin/MemberFilters";
import { Badge } from "@/components/ui/Badge";
import { UsersThree } from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Members | Admin | Rally's Indoor Training" };

const PAGE_SIZE = 25;

const MILESTONE_LABELS: Record<string, string> = {
  "25hr": "25 hrs",
  "50hr": "50 hrs",
  "100hr": "100 hrs",
};

function getMilestoneLabel(key: string) {
  if (MILESTONE_LABELS[key]) return MILESTONE_LABELS[key];
  if (key.startsWith("cage_rats_")) return `Cage Rat ${key.replace("cage_rats_", "")}`;
  return key;
}

interface Props {
  searchParams: Promise<{
    status?: string;
    tier?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminMembersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const where: any = {};

  if (params.status) {
    if (params.status === "NONE") {
      where.subscriptionStatus = null;
    } else {
      where.subscriptionStatus = params.status;
    }
  }
  if (params.tier) {
    where.tier = params.tier;
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
      { phone: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
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
      skip,
      take: PAGE_SIZE,
    }),
    prisma.member.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statusVariant: Record<string, "green" | "amber" | "gray"> = {
    ACTIVE: "green",
    PAST_DUE: "amber",
    CANCELLED: "gray",
  };

  return (
    <div>
      <AdminPageHeader
        title="Members"
        count={total}
        icon={<UsersThree size={18} weight="regular" color="#ffffff" />}
      />

      <MemberFilters
        status={params.status}
        tier={params.tier}
        q={params.q}
      />

      <Card>
        <CardBody className="p-0">
          {/* Mobile list */}
          <ul className="divide-y divide-gray-100 md:hidden">
            {members.map((member) => (
              <li key={member.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{member.name || "—"}</p>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                    {member.phone && (
                      <p className="text-xs text-gray-400">{member.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {member.subscriptionStatus && member.subscriptionStatus !== "NONE" && (
                      <Badge variant={statusVariant[member.subscriptionStatus] ?? "gray"}>
                        {member.subscriptionStatus}
                      </Badge>
                    )}
                    <Badge variant="blue">{member.tier}</Badge>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {member._count.bookings} booking{member._count.bookings !== 1 ? "s" : ""} · Joined{" "}
                  {member.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {member.players.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {member.players.map((player) => {
                      const hours = Math.floor((player.hours?.totalMinutes ?? 0) / 60);
                      const mins = (player.hours?.totalMinutes ?? 0) % 60;
                      return (
                        <div key={player.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                          <span className="font-medium text-gray-900">{player.firstName} {player.lastName}</span>
                          {player.positions && (
                            <span className="text-xs text-gray-500">{player.positions}</span>
                          )}
                          {player.school && (
                            <span className="text-xs text-gray-500">{player.school}</span>
                          )}
                          {(player.hours?.totalMinutes ?? 0) > 0 && (
                            <span className="text-xs font-semibold text-brand-blue">
                              {hours}h {mins > 0 ? `${mins}m` : ""}
                            </span>
                          )}
                          {player.milestones.map((m) => (
                            <span key={m.milestoneKey} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              {getMilestoneLabel(m.milestoneKey)}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            ))}
            {members.length === 0 && (
              <li className="px-5 py-10 text-center text-gray-400">No members found.</li>
            )}
          </ul>

          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Member</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Tier</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Bookings</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Joined</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Players</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="even:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{member.name || "—"}</p>
                    <p className="text-xs text-gray-400">{member.email}</p>
                    {member.phone && (
                      <p className="text-xs text-gray-400">{member.phone}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {member.subscriptionStatus && member.subscriptionStatus !== "NONE" ? (
                      <Badge variant={statusVariant[member.subscriptionStatus] ?? "gray"}>
                        {member.subscriptionStatus}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="blue">{member.tier}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">
                    {member._count.bookings}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {member.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    {member.players.length === 0 ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {member.players.map((player) => {
                          const hours = Math.floor((player.hours?.totalMinutes ?? 0) / 60);
                          const mins = (player.hours?.totalMinutes ?? 0) % 60;
                          return (
                            <div key={player.id} className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1">
                              <span className="text-xs font-medium text-gray-700">{player.firstName} {player.lastName}</span>
                              {(player.hours?.totalMinutes ?? 0) > 0 && (
                                <span className="text-[10px] font-semibold text-brand-blue">
                                  {hours}h{mins > 0 ? `${mins}m` : ""}
                                </span>
                              )}
                              {player.milestones.map((m) => (
                                <span key={m.milestoneKey} className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                                  {getMilestoneLabel(m.milestoneKey)}
                                </span>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-white/60">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/members?${new URLSearchParams({ ...params, page: String(page - 1) } as Record<string, string>)}`}
                className="rounded-lg border border-white/20 bg-white/[0.06] px-3 py-1.5 text-white/80 hover:bg-white/[0.1]"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/members?${new URLSearchParams({ ...params, page: String(page + 1) } as Record<string, string>)}`}
                className="rounded-lg border border-white/20 bg-white/[0.06] px-3 py-1.5 text-white/80 hover:bg-white/[0.1]"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
