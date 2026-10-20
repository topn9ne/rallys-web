"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlayerForm } from "./PlayerForm";
import { removePlayer } from "@/server/actions/players";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  positions: string | null;
  school: string | null;
  travelTeam: string | null;
  totalMinutes: number;
  lastSessionAt: string | null;
  milestones: string[];
}

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
          <h3 className="font-semibold text-gray-900">{player.firstName} {player.lastName}</h3>
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
          {player.milestones.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {player.milestones.map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700"
                >
                  {getMilestoneLabel(key)}
                </span>
              ))}
            </div>
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
