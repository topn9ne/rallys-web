"use client";

import { useActionState, useState } from "react";
import { createDiscountCode } from "@/server/actions/discounts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Theme } from "@prisma/client";

interface DiscountFormProps {
  themes: Theme[];
}

const initialState = { error: undefined as any, success: false };

export function DiscountForm({ themes }: DiscountFormProps) {
  const [appliesTo, setAppliesTo] = useState("ALL");
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createDiscountCode(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <Input
        label="Code"
        name="code"
        placeholder="SUMMER10"
        required
        className="uppercase"
        error={state.error?.code?.[0]}
      />
      <Select label="Type" name="type" defaultValue="PERCENT_OFF">
        <option value="PERCENT_OFF">Percent off (%)</option>
        <option value="FIXED_OFF">Fixed amount off ($)</option>
      </Select>

      <Select
        label="Applies To"
        name="appliesTo"
        value={appliesTo}
        onChange={(e) => setAppliesTo(e.target.value)}
      >
        <option value="ALL">All rides</option>
        <option value="THEME">Theme rides only</option>
        <option value="GENERAL">Group rides only</option>
        <option value="SPECIFIC_THEME">Specific theme</option>
      </Select>

      {appliesTo === "ALL" ? (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Theme ride value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            placeholder="10"
            required
            hint="% or $"
            error={state.error?.value?.[0]}
          />
          <Input
            label="Group ride value"
            name="generalValue"
            type="number"
            step="0.01"
            min="0"
            placeholder="Leave blank to match"
            hint="% or $ — optional override"
          />
        </div>
      ) : (
        <Input
          label="Value"
          name="value"
          type="number"
          step="0.01"
          min="0"
          placeholder="10"
          required
          hint="For percent: enter 10 for 10%. For fixed: enter dollar amount."
          error={state.error?.value?.[0]}
        />
      )}

      {appliesTo === "SPECIFIC_THEME" && (
        <Select label="Theme" name="themeId">
          <option value="">Select a theme...</option>
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      )}

      <Input
        label="Max Uses (optional)"
        name="maxUses"
        type="number"
        min="1"
        placeholder="Leave blank for unlimited"
      />
      <Input
        label="Expires At (optional)"
        name="expiresAt"
        type="datetime-local"
      />
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="firstTimeCustomerOnly" value="true" />
        First-time customers only
      </label>

      {state.success && (
        <p className="text-sm text-green-600">Code created.</p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Create Code
      </Button>
    </form>
  );
}
