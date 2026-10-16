"use client";

import { useTransition } from "react";
import { toggleStaffActive } from "@/server/actions/staff";
import type { Staff } from "@prisma/client";
import { UserMinus, UserPlus } from "@phosphor-icons/react";

export function StaffToggle({ staff }: { staff: Staff }) {
  const [pending, startTransition] = useTransition();

  return staff.active ? (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await toggleStaffActive(staff.id, false); })}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-red-400 transition-all hover:bg-red-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <UserMinus size={16} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[80px]">
        {pending ? "Saving…" : "Deactivate"}
      </span>
    </button>
  ) : (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await toggleStaffActive(staff.id, true); })}
      className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-green-500 transition-all hover:bg-green-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
    >
      <UserPlus size={16} weight="duotone" className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
        {pending ? "Saving…" : "Activate"}
      </span>
    </button>
  );
}
