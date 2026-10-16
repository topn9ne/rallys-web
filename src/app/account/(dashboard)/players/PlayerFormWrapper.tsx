"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlayerForm } from "@/components/account/PlayerForm";

export function PlayerFormWrapper() {
  const [adding, setAdding] = useState(false);

  if (!adding) {
    return (
      <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
        + Add a player
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-brand-blue/30 bg-blue-50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">New player</h2>
      <PlayerForm onDone={() => setAdding(false)} />
    </div>
  );
}
