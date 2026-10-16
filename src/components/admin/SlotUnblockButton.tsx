"use client";

import { useTransition } from "react";
import { unblockSlot } from "@/server/actions/slots";
import { LockSimpleOpen } from "@phosphor-icons/react";

export function SlotUnblockButton({ slotId }: { slotId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await unblockSlot(slotId);
    });
  }

  return (
    <button
      disabled={pending}
      onClick={handleClick}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-purple-500 transition-all hover:bg-purple-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <LockSimpleOpen size={18} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
        Unblock
      </span>
    </button>
  );
}
