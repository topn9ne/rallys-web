"use client";

import { useTransition } from "react";
import { toggleLocationActive } from "@/server/actions/locations";
import { XCircle, CheckCircle } from "@phosphor-icons/react";

interface Props {
  id: string;
  active: boolean;
}

export function LocationToggle({ id, active }: Props) {
  const [pending, startTransition] = useTransition();

  return active ? (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await toggleLocationActive(id, false); })}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-red-400 transition-all hover:bg-red-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <XCircle size={16} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
        {pending ? "Saving…" : "Deactivate"}
      </span>
    </button>
  ) : (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await toggleLocationActive(id, true); })}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-green-500 transition-all hover:bg-green-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <CheckCircle size={16} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
        {pending ? "Saving…" : "Activate"}
      </span>
    </button>
  );
}
