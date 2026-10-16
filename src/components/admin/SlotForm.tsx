"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSlot } from "@/server/actions/slots";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const initialState = { error: undefined as any, success: false };

export function SlotForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createSlot(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <Select label="Lane" name="lane" required error={state.error?.lane?.[0]}>
        <option value="A">Lane A</option>
        <option value="B">Lane B</option>
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
        hint="Each slot is 30 minutes."
        error={state.error?.startTime?.[0]}
      />

      {state.success && (
        <p className="text-sm text-green-600">Slot created.</p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Create Slot
      </Button>
    </form>
  );
}
