"use client";

import { useActionState } from "react";
import { updateWaiverTemplate } from "@/server/actions/waiverTemplate";
import { Button } from "@/components/ui/Button";

const initialState = { error: undefined as any, success: false };

export function WaiverTemplateForm({ currentBody }: { currentBody: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return updateWaiverTemplate(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Waiver Text
        </label>
        <p className="text-xs text-gray-500">
          This text is snapshot at the time of each booking — existing signed waivers are unaffected by edits.
        </p>
        <textarea
          name="body"
          rows={16}
          defaultValue={currentBody}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        />
        {state.error?.body && (
          <p className="text-sm text-red-600">{state.error.body[0]}</p>
        )}
      </div>
      {state.success && (
        <p className="text-sm text-green-600">Waiver template saved.</p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Save Template
      </Button>
    </form>
  );
}
