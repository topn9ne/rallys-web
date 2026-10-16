"use client";

import { useActionState } from "react";
import { createBike } from "@/server/actions/bikes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const initialState = { error: undefined as any, success: false };

export function BikeForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createBike(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <Input
        label="Vehicle Name"
        name="name"
        placeholder="e.g. Railside Flyer"
        required
        error={state.error?.name?.[0]}
      />
      <Input
        label="Passenger Capacity"
        name="passengerCap"
        type="number"
        defaultValue={14}
        min={1}
        max={20}
        required
        error={state.error?.passengerCap?.[0]}
      />
      <Select label="Status" name="status" defaultValue="ACTIVE">
        <option value="ACTIVE">Active</option>
        <option value="OUT_OF_SERVICE">Out of Service</option>
      </Select>

      {state.success && (
        <p className="text-sm text-green-600">Vehicle added successfully.</p>
      )}

      <Button type="submit" loading={pending} className="w-full">
        Add Vehicle
      </Button>
    </form>
  );
}
