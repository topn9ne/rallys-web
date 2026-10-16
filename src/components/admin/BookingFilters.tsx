"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";

interface Props {
  status?: string;
  rideType?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}

export function BookingFilters({ status, rideType, dateFrom, dateTo, q }: Props) {
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
      router.push(`/admin/bookings?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update("q", value), 400);
  };

  const hasFilters = status || rideType || dateFrom || dateTo || q;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:flex-wrap sm:items-end">
      {/* Search — full width on mobile */}
      <div className="relative w-full sm:w-auto">
        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          defaultValue={q}
          placeholder="Search name or email..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        />
      </div>
      {/* Two filters side-by-side (50% each) on mobile */}
      <div className="flex gap-3 sm:contents">
        <select
          value={status ?? ""}
          onChange={(e) => update("status", e.target.value)}
          className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue sm:w-auto"
        >
          <option value="">All statuses</option>
          {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"].map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select
          value={rideType ?? ""}
          onChange={(e) => update("rideType", e.target.value)}
          className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue sm:w-auto"
        >
          <option value="">All ride types</option>
          <option value="THEME">Theme Rides</option>
          <option value="GENERAL">Group Rides</option>
        </select>
      </div>
      {/* Date range — two fields full width on mobile, inline on desktop */}
      <div className="flex gap-3 sm:contents">
        <label className="flex w-1/2 flex-col gap-1 sm:w-auto">
          <span className="pl-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">From</span>
          <input
            type="date"
            value={dateFrom ?? ""}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>
        <label className="flex w-1/2 flex-col gap-1 sm:w-auto">
          <span className="pl-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">To</span>
          <input
            type="date"
            value={dateTo ?? ""}
            onChange={(e) => update("dateTo", e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>
      </div>
      {hasFilters && (
        <a
          href="/admin/bookings"
          style={{ backgroundColor: "rgb(30 58 138 / 0.5)" }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-400/60 px-4 py-2 text-xs font-extrabold tracking-widest text-blue-400 transition-colors hover:bg-blue-400 hover:border-blue-400 hover:text-white"
        >
          <X size={15} />
          CLEAR
        </a>
      )}
    </div>
  );
}
