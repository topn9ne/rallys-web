"use client";

import { useState, useTransition } from "react";
import { blockSlot } from "@/server/actions/slots";
import { LockSimple } from "@phosphor-icons/react";

export function SlotBlockButton({ slotId }: { slotId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await blockSlot(slotId, reason.trim() || undefined);
      setOpen(false);
      setReason("");
    });
  }

  return (
    <>
      <button
        disabled={pending}
        onClick={() => setOpen(true)}
        className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-purple-500 transition-all hover:bg-purple-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
      >
        <LockSimple size={18} weight="duotone" className="shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
          Block
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-extrabold text-gray-900">Block Slot</h2>
            <p className="mt-1 text-sm text-gray-500">
              This slot will be hidden from public booking. Add an optional reason.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional) — e.g. Private event, maintenance…"
              rows={3}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => { setOpen(false); setReason(""); }}
                disabled={pending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white hover:bg-purple-700 disabled:opacity-50"
              >
                <LockSimple size={14} weight="duotone" />
                {pending ? "Blocking…" : "Block Slot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
