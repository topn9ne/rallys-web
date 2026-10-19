"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatCents } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ArrowSquareOut, CaretUp, CaretDown, CaretUpDown } from "@phosphor-icons/react/dist/ssr";
import { BookingDetailModal } from "@/components/admin/BookingDetailModal";

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red"> = {
  PENDING: "amber",
  CONFIRMED: "green",
  COMPLETED: "gray",
  CANCELLED: "gray",
};

function toTitleCase(str: string) {
  return str.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Booking {
  id: string;
  status: string;
  bookingType: string;
  totalAmountCents: number;
  memberId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  member?: { name: string; email: string } | null;
  slotA: { date: Date; lane: string };
  slotB?: { lane: string } | null;
  waiver?: { status: string } | null;
}

interface Props {
  bookings: Booking[];
  sort: string;
  dir: string;
}

const SORTABLE = ["name", "date", "status", "total"];

function SortIcon({ col, sort, dir }: { col: string; sort: string; dir: string }) {
  if (sort !== col) return <CaretUpDown size={12} className="opacity-60" />;
  return dir === "asc" ? <CaretUp size={12} weight="fill" className="text-brand-blue" /> : <CaretDown size={12} weight="fill" className="text-brand-blue" />;
}

export function BookingsTable({ bookings, sort, dir }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSort(col: string) {
    const params = new URLSearchParams(searchParams.toString());
    const newDir = params.get("sort") === col && params.get("dir") === "asc" ? "desc" : "asc";
    params.set("sort", col);
    params.set("dir", newDir);
    params.delete("page");
    router.push(`/admin/bookings?${params.toString()}`);
  }

  function thClass(col?: string) {
    const base = "px-5 py-3 text-left font-medium text-gray-500 select-none";
    return col && SORTABLE.includes(col) ? `${base} cursor-pointer hover:text-gray-800 hover:bg-gray-100` : base;
  }

  function getName(b: Booking) {
    return b.member?.name ?? b.guestName ?? "Guest";
  }

  function getEmail(b: Booking) {
    return b.member?.email ?? b.guestEmail ?? "";
  }

  function getLane(b: Booking) {
    return b.bookingType === "BOTH_LANES" ? "Both Lanes" : `Lane ${b.slotA.lane}`;
  }

  return (
    <>
      <ul className="divide-y divide-gray-100 md:hidden">
        {bookings.map((b) => (
          <li
            key={b.id}
            className="flex items-start justify-between gap-3 px-4 py-4 cursor-pointer even:bg-gray-100 hover:bg-admin-primary/5 active:bg-admin-primary/5"
            onClick={() => setSelectedId(b.id)}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate">{getName(b)}</p>
              <p className="text-xs text-gray-400 truncate">{getEmail(b)}</p>
              <p className="mt-1 text-sm text-gray-600">{getLane(b)}</p>
              <p className="text-xs text-gray-400">{formatDate(b.slotA.date)}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <p className="font-semibold text-gray-900">
                {b.totalAmountCents > 0 ? formatCents(b.totalAmountCents) : "Member"}
              </p>
              <Badge variant={statusVariant[b.status] ?? "gray"}>{toTitleCase(b.status)}</Badge>
            </div>
          </li>
        ))}
        {bookings.length === 0 && (
          <li className="px-5 py-10 text-center text-gray-400">No bookings found.</li>
        )}
      </ul>

      <table className="hidden md:table w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className={thClass("name")} onClick={() => handleSort("name")}>
              <span className="flex items-center gap-1">Name <SortIcon col="name" sort={sort} dir={dir} /></span>
            </th>
            <th className={thClass()}>Lane</th>
            <th className={thClass("date")} onClick={() => handleSort("date")}>
              <span className="flex items-center gap-1">Date <SortIcon col="date" sort={sort} dir={dir} /></span>
            </th>
            <th className={thClass("status")} onClick={() => handleSort("status")}>
              <span className="flex items-center gap-1">Status <SortIcon col="status" sort={sort} dir={dir} /></span>
            </th>
            <th className="px-5 py-3 text-right font-medium text-gray-500 cursor-pointer hover:text-gray-800 hover:bg-gray-100 select-none" onClick={() => handleSort("total")}>
              <span className="flex items-center justify-end gap-1">Total <SortIcon col="total" sort={sort} dir={dir} /></span>
            </th>
            <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="cursor-pointer even:bg-gray-100 hover:bg-admin-primary/5"
              onClick={() => setSelectedId(b.id)}
            >
              <td className="px-5 py-3">
                <p className="font-medium text-gray-900">{getName(b)}</p>
                <p className="text-xs text-gray-400">{getEmail(b)}</p>
              </td>
              <td className="px-5 py-3">
                <p className="font-medium text-gray-900">{getLane(b)}</p>
                <p className="text-xs text-gray-400">
                  {b.memberId ? "Member" : "Drop-in"}
                </p>
              </td>
              <td className="px-5 py-3 text-gray-600">{formatDate(b.slotA.date)}</td>
              <td className="px-5 py-3">
                <Badge variant={statusVariant[b.status] ?? "gray"}>
                  {toTitleCase(b.status)}
                </Badge>
              </td>
              <td className="px-5 py-3 text-right font-medium text-gray-900">
                {b.totalAmountCents > 0 ? formatCents(b.totalAmountCents) : "Member"}
              </td>
              <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedId(b.id)}
                  title="View booking"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-line bg-[#f0f2f5] text-admin-primary transition-colors hover:bg-admin-primary hover:text-white"
                >
                  <ArrowSquareOut size={14} weight="regular" />
                </button>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedId && (
        <BookingDetailModal
          bookingId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
