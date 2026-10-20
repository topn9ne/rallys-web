"use client";

import { useState, useActionState } from "react";
import { updateWaiverTemplate, requireResign } from "@/server/actions/waiverTemplate";
import { Button } from "@/components/ui/Button";

const initialState = { error: undefined as any, success: false };

export function WaiverTemplateForm({
  currentBody,
  resignRequiredAt,
}: {
  currentBody: string;
  resignRequiredAt: Date | null;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return updateWaiverTemplate(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  const [resignPending, setResignPending] = useState(false);
  const [resignResult, setResignResult] = useState<{ notified: number; total: number } | null>(null);
  const [confirmResign, setConfirmResign] = useState(false);

  async function handleRequireResign() {
    if (!confirmResign) {
      setConfirmResign(true);
      return;
    }
    setResignPending(true);
    try {
      const result = await requireResign();
      if (result.success) {
        setResignResult({ notified: result.notified, total: result.total });
      }
    } finally {
      setResignPending(false);
      setConfirmResign(false);
    }
  }

  return (
    <div className="space-y-6">
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

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Re-sign Requirement</h3>
        <p className="text-xs text-gray-500">
          Saving the template does not require members to re-sign. Use the button below for significant changes that require all members to review and re-sign. This sends an email + SMS to every member with an outdated waiver.
        </p>
        {resignRequiredAt && (
          <p className="text-xs text-gray-400">
            Last required: {new Date(resignRequiredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
        {resignResult && (
          <p className="text-sm text-green-600">
            Re-sign required — notified {resignResult.notified} of {resignResult.total} members.
          </p>
        )}
        {confirmResign ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequireResign}
              disabled={resignPending}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {resignPending ? "Sending..." : "Yes, require re-sign"}
            </button>
            <button
              onClick={() => setConfirmResign(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleRequireResign}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
          >
            Require All Members to Re-sign
          </button>
        )}
      </div>
    </div>
  );
}
