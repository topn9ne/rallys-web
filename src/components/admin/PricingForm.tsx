"use client";

import { useActionState } from "react";
import { updatePricing } from "@/server/actions/pricing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
type PricingTier = "FAMILY" | "FAMILY_ANNUAL" | "TEAM" | "TEAM_ANNUAL" | "DROPIN_SINGLE" | "DROPIN_BOTH";

interface PricingFormProps {
  tier: PricingTier;
  currentCents?: number;
  currentTaxRate?: number;
  label: string;
}

const initialState = { error: undefined as any, success: false };

export function PricingForm({
  tier,
  currentCents,
  currentTaxRate,
  label,
}: PricingFormProps) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return updatePricing(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tier" value={tier} />
      <Input
        label={label}
        name="amountDollars"
        type="number"
        step="0.01"
        min="0"
        defaultValue={currentCents ? (currentCents / 100).toFixed(2) : ""}
        placeholder="0.00"
        required
        error={state.error?.amountDollars?.[0]}
      />
      <Input
        label="Tax Rate (%)"
        name="taxRatePercent"
        type="number"
        step="0.01"
        min="0"
        max="100"
        defaultValue={currentTaxRate ?? 0}
        hint="Enter 0 if prices are already tax-inclusive"
        error={state.error?.taxRatePercent?.[0]}
      />
      {state.success && (
        <p className="text-sm text-green-600">Pricing updated.</p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Update Pricing
      </Button>
    </form>
  );
}
