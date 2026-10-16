"use client";

import { useState, useTransition } from "react";
import { blockSlot } from "@/server/actions/slots";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { XCircle } from "@phosphor-icons/react";

export function SlotCancelButton({ slotId }: { slotId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await blockSlot(slotId, "Blocked by admin");
      setOpen(false);
    });
  }

  return (
    <>
      <button
        disabled={pending}
        onClick={() => setOpen(true)}
        className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-amber-500 transition-all hover:bg-amber-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
      >
        <XCircle size={18} weight="duotone" className="shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
          Block
        </span>
      </button>

      {open && (
        <ConfirmModal
          title="Block Slot"
          message="Block this slot? It will not be available for booking."
          confirmLabel="Block Slot"
          confirmIcon="cancel"
          confirmVariant="restore-ghost"
          cancelLabel="Back"
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
          loading={pending}
        />
      )}
    </>
  );
}
