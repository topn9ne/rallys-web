"use client";

import { useTransition } from "react";
import { toggleBikeStatus } from "@/server/actions/bikes";
import type { Bike } from "@prisma/client";
import { XCircle, CheckCircle } from "@phosphor-icons/react";

export function BikeStatusToggle({ bike }: { bike: Bike }) {
  const [pending, startTransition] = useTransition();
  const nextStatus = bike.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";

  return bike.status === "ACTIVE" ? (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await toggleBikeStatus(bike.id, nextStatus); })}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-red-400 transition-all hover:bg-red-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <XCircle size={16} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
        {pending ? "Saving…" : "Disable"}
      </span>
    </button>
  ) : (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await toggleBikeStatus(bike.id, nextStatus); })}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-green-500 transition-all hover:bg-green-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <CheckCircle size={16} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
        {pending ? "Saving…" : "Enable"}
      </span>
    </button>
  );
}
