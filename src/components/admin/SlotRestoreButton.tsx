"use client";

import { useTransition } from "react";
import { restoreSlot } from "@/server/actions/slots";
import { Button } from "@/components/ui/Button";
import { ArrowCounterClockwise } from "@phosphor-icons/react";

export function SlotRestoreButton({ slotId }: { slotId: string }) {
  const [pending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(async () => { await restoreSlot(slotId); });
  }

  return (
    <button
      disabled={pending}
      onClick={handleRestore}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-amber-500 transition-all hover:bg-amber-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <ArrowCounterClockwise size={18} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
        Restore
      </span>
    </button>
  );
}
