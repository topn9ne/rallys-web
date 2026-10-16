"use client";

import { useState, useActionState } from "react";
import { signWaiver } from "@/server/actions/waiver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState = { error: undefined as any };

export function WaiverForm({ bookingId }: { bookingId: string }) {
  const [isMinor, setIsMinor] = useState(false);
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return signWaiver(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="isMinor" value={isMinor ? "true" : "false"} />

      <h2 className="font-semibold text-gray-900">Your Signature</h2>

      <Input
        label="Full Legal Name"
        name="signerName"
        placeholder="First Last"
        required
        autoComplete="name"
        error={state.error?.signerName?.[0]}
      />

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isMinor}
            onChange={(e) => setIsMinor(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <span className="text-sm text-gray-700">
            This participant is under 18 years old
          </span>
        </label>
      </div>

      {isMinor && (
        <Input
          label="Parent/Guardian Name"
          name="guardianName"
          placeholder="Parent or guardian's full name"
          required
          error={state.error?.guardianName?.[0]}
        />
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="acknowledged"
            value="true"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            required
          />
          <span className="text-sm text-gray-700">
            {isMinor
              ? "I am the parent/guardian of this participant. I have read and understand the waiver above. I voluntarily agree to its terms and release Rally's Indoor Training from all liability on behalf of myself and the minor participant."
              : "I have read and understand the waiver above. I voluntarily agree to its terms and release Rally's Indoor Training from all liability. I confirm this signature is my own."}
          </span>
        </label>
      </div>

      {state.error?._form && (
        <p className="text-sm text-red-600">{state.error._form[0]}</p>
      )}

      <Button type="submit" loading={pending} size="lg" className="w-full">
        Sign Waiver
      </Button>

      <p className="text-xs text-center text-gray-400">
        Your name, timestamp, and IP address will be recorded as your electronic signature.
      </p>
    </form>
  );
}
