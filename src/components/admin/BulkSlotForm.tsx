"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBulkSlots } from "@/server/actions/slots";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const initialState = { error: undefined as any, success: false, created: 0, skipped: 0 };

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function BulkSlotForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createBulkSlots(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-gray-700">Lanes</legend>
        <div className="flex gap-2">
          {(["A", "B"] as const).map((lane) => (
            <label
              key={lane}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                name="lanes"
                value={lane}
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 accent-brand-blue"
              />
              <span className="text-sm font-semibold">Lane {lane}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Date" name="startDate" type="date" required />
        <Input label="End Date" name="endDate" type="date" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="First Slot" name="startTime" type="time" required hint="e.g. 09:00" />
        <Input label="Last Slot Ends" name="endTime" type="time" required hint="e.g. 21:00" />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-gray-700">Days of Week</legend>
        <div className="flex flex-wrap gap-1.5">
          {DAYS_OF_WEEK.map(({ label, value }) => (
            <label
              key={value}
              className={cn(
                "flex h-9 w-11 cursor-pointer items-center justify-center rounded-lg border text-xs font-bold uppercase transition-colors",
                "border-gray-200 hover:bg-gray-50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue has-[:checked]:text-white"
              )}
            >
              <input type="checkbox" name="daysOfWeek" value={value} className="sr-only" defaultChecked={value >= 1 && value <= 5} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {typeof state.error === "string" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">
          Created {state.created} slot{state.created !== 1 ? "s" : ""}
          {state.skipped > 0 && `, skipped ${state.skipped} conflict${state.skipped !== 1 ? "s" : ""}`}.
        </p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Generate Slots
      </Button>
    </form>
  );
}
