"use client";

import { useActionState } from "react";
import { createUpsellItem } from "@/server/actions/upsellItems";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState = { error: undefined as any, success: false };

export function UpsellItemForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createUpsellItem(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <Input
        label="Item Name"
        name="name"
        placeholder="e.g. Glow Necklace, Bottled Water"
        required
        error={state.error?.name?.[0]}
      />
      <Input
        label="Description"
        name="description"
        placeholder="Optional"
        error={state.error?.description?.[0]}
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
      {state.success && (
        <p className="text-sm text-green-600">Item added.</p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Add Item
      </Button>
    </form>
  );
}
