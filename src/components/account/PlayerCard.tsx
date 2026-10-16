"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlayerForm } from "./PlayerForm";
import { removePlayer } from "@/server/actions/players";

interface Player {
  id: string;
  name: string;
  dateOfBirth: string | null;
  positions: string | null;
  school: string | null;
  travelTeam: string | null;
  totalMinutes: number;
}

export function PlayerCard({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false);

  const hours = Math.floor(player.totalMinutes / 60);
  const mins = player.totalMinutes % 60;

  if (editing) {
    return (
      <div className="rounded-xl border border-brand-blue/30 bg-blue-50 p-4">
        <PlayerForm player={player} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{player.name}</h3>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            {player.positions && <span>{player.positions}</span>}
            {player.school && <span>{player.school}</span>}
            {player.travelTeam && <span>{player.travelTeam}</span>}
          </div>
          {player.totalMinutes > 0 && (
            <p className="mt-1 text-xs font-medium text-brand-blue">
              {hours}h {mins > 0 ? `${mins}m` : ""} cage time
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
          <form action={async (formData: FormData) => {
            await removePlayer(formData);
          }}>
            <input type="hidden" name="playerId" value={player.id} />
            <Button variant="ghost" size="sm" type="submit">
              Remove
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
