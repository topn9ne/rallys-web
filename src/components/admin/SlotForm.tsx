"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createSlot } from "@/server/actions/slots";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Bike, Theme } from "@prisma/client";

interface SlotFormProps {
  bikes: Bike[];
  themes: Theme[];
}

const initialState = { error: undefined as any, success: false };

export function SlotForm({ bikes, themes }: SlotFormProps) {
  const [rideType, setRideType] = useState<"THEME" | "GENERAL">("THEME");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createSlot(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setRideType("THEME");
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <Select label="Ride Type" name="rideType" value={rideType} onChange={(e) => setRideType(e.target.value as "THEME" | "GENERAL")} required>
        <option value="THEME">Theme Ride (per seat)</option>
        <option value="GENERAL">Group Ride (full vehicle)</option>
      </Select>

      {rideType === "THEME" && (
        <Select label="Theme" name="themeId" error={state.error?.themeId?.[0]}>
          <option value="">Select theme...</option>
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      )}

      <Select label="Vehicle" name="bikeId" required error={state.error?.bikeId?.[0]}>
        <option value="">Select vehicle...</option>
        {bikes.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>

      <Input
        label="Date"
        name="date"
        type="date"
        required
        error={state.error?.date?.[0]}
      />
      <Input
        label="Start Time"
        name="startTime"
        type="time"
        required
        hint="Ride is 2 hrs. 1-hr buffer auto-added after."
        error={state.error?.startTime?.[0]}
      />

      {state.success && (
        <p className="text-sm text-green-600">Ride created.</p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Create Ride
      </Button>
    </form>
  );
}
