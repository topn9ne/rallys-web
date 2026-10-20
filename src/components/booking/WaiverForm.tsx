"use client";

import { useState, useTransition } from "react";
import { signWaiver } from "@/server/actions/waiver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Participant {
  name: string;
  isMinor: boolean;
}

export function WaiverForm({ bookingId }: { bookingId: string }) {
  const [signerName, setSignerName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", isMinor: false },
  ]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();


  function addParticipant() {
    setParticipants((prev) => [...prev, { name: "", isMinor: false }]);
  }

  function removeParticipant(index: number) {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateParticipant(index: number, field: keyof Participant, value: string | boolean) {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = participants.filter((p) => p.name.trim().length >= 2);
    if (trimmed.length === 0) {
      setError("Add at least one participant.");
      return;
    }

    startTransition(async () => {
      const result = await signWaiver({
        bookingId,
        signerName,
        participants: trimmed,
        acknowledged,
      });
      if (result?.error?._form) {
        setError(result.error._form[0]);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <h2 className="font-semibold text-gray-900">Your Signature</h2>

      <Input
        label="Your Full Legal Name"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
        placeholder="First Last"
        required
        autoComplete="name"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">
            I&apos;m signing on behalf of:
          </label>
          <button
            type="button"
            onClick={addParticipant}
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            + Add person
          </button>
        </div>

        {participants.map((p, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex-1 space-y-2">
              <input
                value={p.name}
                onChange={(e) => updateParticipant(i, "name", e.target.value)}
                placeholder="Participant name"
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
              />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={p.isMinor}
                  onChange={(e) => updateParticipant(i, "isMinor", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-xs text-gray-600">Under 18</span>
              </label>
            </div>
            {participants.length > 1 && (
              <button
                type="button"
                onClick={() => removeParticipant(i)}
                className="mt-2 text-xs text-gray-400 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            required
          />
          <span className="text-sm text-gray-700">
            I have read and understand the waiver above. I voluntarily agree to its terms and release Rally&apos;s Indoor Training from all liability on behalf of all listed participants. I confirm this signature is my own.
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
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
