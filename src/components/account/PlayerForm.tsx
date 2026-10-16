"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addPlayer, updatePlayer } from "@/server/actions/players";

interface Player {
  id: string;
  name: string;
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

  if (state?.success && onDone) {
    onDone();
  }

  return (
    <form action={action} className="space-y-3">
      {player && <input type="hidden" name="playerId" value={player.id} />}

      <Input
        label="Player name"
        name="name"
        defaultValue={player?.name ?? ""}
        required
        placeholder="First Last"
      />

      <Input
        label="Date of birth"
        name="dateOfBirth"
        type="date"
        defaultValue={player?.dateOfBirth ?? ""}
      />

      <Input
        label="Positions"
        name="positions"
        defaultValue={player?.positions ?? ""}
        placeholder="e.g. SS, CF"
      />

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
