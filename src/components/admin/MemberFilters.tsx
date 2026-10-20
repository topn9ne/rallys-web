"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";

interface Props {
  status?: string;
  tier?: string;
  q?: string;
}

export function MemberFilters({ status, tier, q }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/admin/members?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update("q", value), 400);
  };

  const hasFilters = status || tier || q;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="relative w-full sm:w-auto">
        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          defaultValue={q}
          placeholder="Search name or email..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        />
      </div>
      <select
        value={status ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="PAST_DUE">Past Due</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="NONE">No Subscription</option>
      </select>
      <select
        value={tier ?? ""}
        onChange={(e) => update("tier", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
      >
        <option value="">All tiers</option>
        <option value="FAMILY">Family</option>
        <option value="TEAM">Team</option>
      </select>
      {hasFilters && (
        <a
          href="/admin/members"
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-rally-red/60 bg-rally-red/10 px-4 py-2 text-xs font-extrabold tracking-widest text-rally-red transition-colors hover:bg-rally-red hover:border-rally-red hover:text-white"
        >
          <X size={15} />
          CLEAR
        </a>
      )}
    </div>
  );
}
