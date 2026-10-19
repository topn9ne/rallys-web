"use client";

import { useState, useTransition } from "react";
import { CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Clock, FloppyDisk } from "@phosphor-icons/react";
import { updateOperatingHours } from "@/server/actions/operatingHours";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface HoursRow {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface ManageHoursFormProps {
  initialHours: HoursRow[];
}

export function ManageHoursForm({ initialHours }: ManageHoursFormProps) {
  const [hours, setHours] = useState<HoursRow[]>(() =>
    DAY_NAMES.map((_, i) => {
      const existing = initialHours.find((h) => h.dayOfWeek === i);
      return existing ?? { dayOfWeek: i, isOpen: false, openTime: "06:00", closeTime: "22:00" };
    })
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateRow(dayOfWeek: number, patch: Partial<HoursRow>) {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h))
    );
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updateOperatingHours(hours);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <>
      <CardHeader className="px-8 py-5">
        <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
          <Clock size={22} weight="duotone" color="#1B2A4A" />
          Operating Hours
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Set when cages are available. Slots auto-generate from these hours.
        </p>
      </CardHeader>

      <CardBody className="space-y-3 px-8 pb-6">
        {hours.map((row) => (
          <div
            key={row.dayOfWeek}
            className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={row.isOpen}
                onChange={(e) => updateRow(row.dayOfWeek, { isOpen: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <span className="text-sm font-semibold text-gray-700">
                {DAY_NAMES[row.dayOfWeek].slice(0, 3)}
              </span>
              {!row.isOpen && (
                <span className="ml-auto text-xs text-gray-400">Closed</span>
              )}
            </label>

            {row.isOpen && (
              <div className="mt-2 space-y-1.5 pl-6">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Open</span>
                  <input
                    type="time"
                    value={row.openTime}
                    onChange={(e) => updateRow(row.dayOfWeek, { openTime: e.target.value })}
                    className="mt-0.5 block w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Close</span>
                  <input
                    type="time"
                    value={row.closeTime}
                    onChange={(e) => updateRow(row.dayOfWeek, { closeTime: e.target.value })}
                    className="mt-0.5 block w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="mt-2 w-full"
        >
          <FloppyDisk size={16} weight="bold" />
          {isPending ? "Saving..." : saved ? "Saved!" : "Save Hours"}
        </Button>
      </CardBody>
    </>
  );
}
