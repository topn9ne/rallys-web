"use client";

import { useState, useTransition } from "react";
import { deleteSlot } from "@/server/actions/slots";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Trash } from "@phosphor-icons/react";

export function SlotDeleteButton({ slotId }: { slotId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deleteSlot(slotId);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-red-400 transition-all hover:bg-red-50 hover:gap-1.5 hover:pr-3"
      >
        <Trash size={18} weight="duotone" className="shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
          Delete
        </span>
      </button>

      {open && (
        <ConfirmModal
          title="Delete Ride"
          message="Permanently delete this ride? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
          loading={pending}
        />
      )}
    </>
  );
}
