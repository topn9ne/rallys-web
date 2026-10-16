"use client";

import { useState, useTransition } from "react";
import { updateAddonBikes } from "@/server/actions/addons";
import type { Bike } from "@prisma/client";

interface Props {
  addonId: string;
  bikes: Bike[];
  selectedBikeIds: string[];
}

export function AddonBikeSelector({ addonId, bikes, selectedBikeIds }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedBikeIds));
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle(bikeId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(bikeId)) next.delete(bikeId);
      else next.add(bikeId);
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updateAddonBikes(addonId, Array.from(selected));
      setSaved(true);
    });
  }

  return (
    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
        Restrict to vehicles <span className="font-normal text-gray-400">(none checked = all vehicles)</span>
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {bikes.map((bike) => (
          <label key={bike.id} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.has(bike.id)}
              onChange={() => toggle(bike.id)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-xs text-gray-700">{bike.name}</span>
          </label>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded-md bg-brand-blue px-3 py-1 text-xs font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs text-green-600">Saved</span>}
      </div>
    </div>
  );
}
