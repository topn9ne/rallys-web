export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlayerCard } from "@/components/account/PlayerCard";
import { PlayerFormWrapper } from "./PlayerFormWrapper";

export const metadata = { title: "Players | Rally's Indoor Training" };

export default async function PlayersPage() {
  const user = await requireUser("/account/players");

  const players = await prisma.player.findMany({
    where: { memberId: user.id },
    include: { hours: { select: { totalMinutes: true } } },
    orderBy: { createdAt: "asc" },
  });

  const mapped = players.map((p: typeof players[number]) => ({
    id: p.id,
    name: p.name,
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toISOString().split("T")[0] : null,
    positions: p.positions,
    school: p.school,
    travelTeam: p.travelTeam,
    totalMinutes: p.hours?.totalMinutes ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Players</h1>
      </div>

      <p className="text-sm text-gray-600">
        Add the players in your family or on your team. You&apos;ll select which
        players are hitting when you book a session.
      </p>

      {mapped.length > 0 && (
        <div className="space-y-3">
          {mapped.map((player: typeof mapped[number]) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}

      <PlayerFormWrapper />
    </div>
  );
}
