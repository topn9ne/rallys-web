"use client";

import { useActionState } from "react";
import { createAddon } from "@/server/actions/addons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Bike } from "@prisma/client";

const initialState = { error: undefined as any, success: false };

interface AddonFormProps {
  bikes?: Bike[];
}

export function AddonForm({ bikes = [] }: AddonFormProps) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createAddon(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <Input
        label="Name"
        name="name"
        placeholder="e.g. Scavenger Hunt"
        required
        error={state.error?.name?.[0]}
      />
      <Input
        label="Description (optional)"
        name="description"
        placeholder="Short description shown at checkout"
      />
      <Input
        label="Price ($)"
        name="priceDollars"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        required
        error={state.error?.priceDollars?.[0]}
      />
      <Select label="Applies To" name="appliesTo" defaultValue="ALL">
        <option value="ALL">All ride types</option>
        <option value="THEME">Theme rides only</option>
        <option value="GENERAL">Group rides only</option>
      </Select>

      {bikes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">
            Available on bikes{" "}
            <span className="font-normal text-gray-500">(leave blank for all bikes)</span>
          </p>
          <div className="space-y-2">
            {bikes.map((bike) => (
              <label key={bike.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="bikeIds"
                  value={bike.id}
                  className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-sm text-gray-700">{bike.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {state.success && (
        <p className="text-sm text-green-600">Add-on created.</p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Create Add-on
      </Button>
    </form>
  );
}
