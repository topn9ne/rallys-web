"use client";

import { useActionState } from "react";
import { createLocation } from "@/server/actions/locations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState = { error: undefined as any, success: false };

export function LocationForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createLocation(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <Input label="Name" name="name" placeholder="e.g. Downtown Square" required error={state.error?.name?.[0]} />
      <Input label="Address" name="address" placeholder="e.g. 200 W 3rd St, Grand Island, NE 68801" required error={state.error?.address?.[0]} />
      {state.success && <p className="text-sm text-green-600">Location added.</p>}
      <Button type="submit" loading={pending} className="w-full">
        Add Location
      </Button>
    </form>
  );
}
