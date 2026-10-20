"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addPlayer, updatePlayer } from "@/server/actions/players";

const POSITIONS = ["C", "P", "1B", "SS/2B", "3B", "OF"] as const;

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  positions: string | null;
  school: string | null;
  travelTeam: string | null;
}

function formAction(_prev: { error?: string; success?: boolean } | null, formData: FormData) {
  const playerId = formData.get("playerId") as string;
  return playerId ? updatePlayer(formData) : addPlayer(formData);
}

export function PlayerForm({
  player,
  onDone,
}: {
  player?: Player;
  onDone?: () => void;
}) {
  const [state, action, isPending] = useActionState(formAction, null);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(player?.positions?.split(", ").filter(Boolean) ?? [])
  );

  function toggle(pos: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pos)) next.delete(pos);
      else next.add(pos);
      return next;
    });
  }

  if (state?.success && onDone) {
    onDone();
  }

  return (
    <form action={action} className="space-y-3">
      {player && <input type="hidden" name="playerId" value={player.id} />}
      <input type="hidden" name="positions" value={POSITIONS.filter((p) => selected.has(p)).join(", ")} />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          name="firstName"
          defaultValue={player?.firstName ?? ""}
          required
        />
        <Input
          label="Last name"
          name="lastName"
          defaultValue={player?.lastName ?? ""}
          required
        />
      </div>

      <Input
        label="Date of birth"
        name="dateOfBirth"
        type="date"
        defaultValue={player?.dateOfBirth ?? ""}
      />

      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-1.5">Positions</legend>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => toggle(pos)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                selected.has(pos)
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-brand-blue/50 hover:text-brand-blue"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </fieldset>

      <Input
        label="School"
        name="school"
        defaultValue={player?.school ?? ""}
      />

      <Input
        label="Travel team"
        name="travelTeam"
        defaultValue={player?.travelTeam ?? ""}
      />

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" variant="primary" size="sm" loading={isPending}>
          {player ? "Save" : "Add player"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
