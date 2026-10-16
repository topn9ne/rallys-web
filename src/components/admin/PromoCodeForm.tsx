"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createPromoCode } from "@/server/actions/promoCodes";

function formAction(_prev: { error?: string; success?: boolean } | null, formData: FormData) {
  return createPromoCode(formData);
}

export function PromoCodeForm() {
  const [state, action, isPending] = useActionState(formAction, null);

  return (
    <form action={action} className="space-y-4">
      <Input
        label="Code"
        name="code"
        required
        placeholder="e.g. SUMMER25"
        className="uppercase"
      />

      <Input
        label="Description (optional)"
        name="description"
        placeholder="e.g. Summer 2027 team promo"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-800">Discount type</label>
          <select
            name="discountType"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            defaultValue="PERCENT"
          >
            <option value="PERCENT">Percentage (%)</option>
            <option value="FIXED">Fixed amount (cents)</option>
          </select>
        </div>
        <Input
          label="Amount"
          name="discountAmount"
          type="number"
          required
          min={1}
          placeholder="e.g. 25"
          hint="% or cents depending on type"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Max uses (optional)" name="maxUses" type="number" min={1} />
        <div />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Valid from" name="validFrom" type="date" />
        <Input label="Valid until" name="validUntil" type="date" />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Code created.</p>}

      <Button type="submit" variant="primary" loading={isPending}>
        Create code
      </Button>
    </form>
  );
}
