"use client";

import { useState, useActionState } from "react";
import { signWaiver } from "@/server/actions/waiver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function getAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const initialState = { error: undefined as any };

export function WaiverForm({ bookingId }: { bookingId: string }) {
  const [dobError, setDobError] = useState<string | null>(null);
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return signWaiver(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <input type="hidden" name="bookingId" value={bookingId} />

      <h2 className="font-semibold text-gray-900">Your Signature</h2>

      <Input
        label="Full Legal Name"
        name="signerName"
        placeholder="First Last"
        required
        autoComplete="name"
        error={state.error?.signerName?.[0]}
      />

      <Input
        label="Date of Birth"
        name="signerDob"
        type="date"
        required
        hint="You must be 21 or older to participate"
        error={dobError ?? state.error?.signerDob?.[0]}
        onChange={(e) => {
          const val = e.target.value;
          if (val && getAge(val) < 21) {
            setDobError("You must be 21 or older to sign this waiver.");
          } else {
            setDobError(null);
          }
        }}
      />

      <div>
        <label htmlFor="riderRoster" className="block text-sm font-medium text-gray-700 mb-1">
          Rider Roster <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="riderRoster"
          name="riderRoster"
          rows={4}
          placeholder="Names of riders in your group"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none resize-none"
        />
        <p className="mt-1 text-xs text-gray-400">Optional — just a heads up for us before your ride.</p>
      </div>

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
            I have read and understand the waiver above. I voluntarily agree to its terms
            and release Railside Rides from all liability. I confirm this signature is my own.
          </span>
        </label>
      </div>

      {state.error?._form && (
        <p className="text-sm text-red-600">{state.error._form[0]}</p>
      )}

      <Button type="submit" loading={pending} disabled={!!dobError} size="lg" className="w-full">
        Sign Waiver
      </Button>

      <p className="text-xs text-center text-gray-400">
        Your name, timestamp, and IP address will be recorded as your electronic signature.
      </p>
    </form>
  );
}
