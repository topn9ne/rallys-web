"use client";

import { useTransition } from "react";
import { toggleDiscountCode } from "@/server/actions/discounts";
import type { DiscountCode } from "@prisma/client";
import { XCircle, CheckCircle } from "@phosphor-icons/react";

export function DiscountToggle({ code }: { code: DiscountCode }) {
  const [pending, startTransition] = useTransition();

  return code.active ? (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await toggleDiscountCode(code.id, false); })}
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
      onClick={() => startTransition(async () => { await toggleDiscountCode(code.id, true); })}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-green-500 transition-all hover:bg-green-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <CheckCircle size={16} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
        {pending ? "Saving…" : "Enable"}
      </span>
    </button>
  );
}
