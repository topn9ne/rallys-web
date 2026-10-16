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
  REFUNDED: "red",
};

function toTitleCase(str: string) {
  return str.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Booking {
  id: string;
  slotId: string;
  status: string;
  bookingType: string;
  seats: number;
  totalAmountCents: number;
  stripePaymentIntentId?: string | null;
  customer: { name: string; email: string };
  slot: { date: Date; rideType: string; theme?: { name: string } | null };
  waiver?: { status: string } | null;
}

interface Props {
  bookings: Booking[];
  sort: string;
  dir: string;
}

const SORTABLE = ["customer", "date", "status", "total"];

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


  return (
    <>
      {/* Mobile card list */}
      <ul className="divide-y divide-gray-100 md:hidden">
        {bookings.map((b) => (
          <li
            key={b.id}
            className="flex items-start justify-between gap-3 px-4 py-4 cursor-pointer even:bg-gray-100 hover:bg-blue-50 active:bg-blue-50"
            onClick={() => setSelectedId(b.id)}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate">{b.customer.name}</p>
              <p className="text-xs text-gray-400 truncate">{b.customer.email}</p>
              <p className="mt-1 text-sm text-gray-600">
                {b.slot.rideType === "THEME" ? b.slot.theme?.name ?? "Theme Ride" : "Group Ride"}
                {" · "}
                {b.bookingType === "THEME_SEAT" ? `${b.seats} seat${b.seats > 1 ? "s" : ""}` : "Full vehicle"}
              </p>
              <p className="text-xs text-gray-400">{formatDate(b.slot.date)}</p>
              {b.status === "PENDING" && b.waiver?.status !== "SIGNED" && (
                <p className="mt-1 text-xs font-semibold text-amber-600">⚠ Waiver needed</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <p className="font-semibold text-gray-900">{formatCents(b.totalAmountCents)}</p>
              <Badge variant={statusVariant[b.status] ?? "gray"}>{toTitleCase(b.status)}</Badge>
            </div>
          </li>
        ))}
        {bookings.length === 0 && (
          <li className="px-5 py-10 text-center text-gray-400">No bookings found.</li>
        )}
      </ul>

      {/* Desktop table */}
      <table className="hidden md:table w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className={thClass("customer")} onClick={() => handleSort("customer")}>
              <span className="flex items-center gap-1">Customer <SortIcon col="customer" sort={sort} dir={dir} /></span>
            </th>
            <th className={thClass()}>Ride</th>
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
              className="cursor-pointer even:bg-gray-100 hover:bg-blue-50"
              onClick={() => setSelectedId(b.id)}
            >
              <td className="px-5 py-3">
                <p className="font-medium text-gray-900">{b.customer.name}</p>
                <p className="text-xs text-gray-400">{b.customer.email}</p>
              </td>
              <td className="px-5 py-3">
                <p className="font-medium text-gray-900">
                  {b.slot.rideType === "THEME" ? b.slot.theme?.name ?? "Theme Ride" : "Group Ride"}
                </p>
                <p className="text-xs text-gray-400">
                  {b.bookingType === "THEME_SEAT" ? `${b.seats} seat${b.seats > 1 ? "s" : ""}` : "Full vehicle"}
                </p>
              </td>
              <td className="px-5 py-3 text-gray-600">{formatDate(b.slot.date)}</td>
              <td className="px-5 py-3">
                <Badge variant={statusVariant[b.status] ?? "gray"}>
                  {toTitleCase(b.status)}
                </Badge>
                {b.status === "PENDING" && b.waiver?.status !== "SIGNED" && (
                  <p className="mt-1 text-xs font-semibold text-amber-600">⚠ Waiver needed</p>
                )}
              </td>
              <td className="px-5 py-3 text-right font-medium text-gray-900">
                {formatCents(b.totalAmountCents)}
              </td>
              <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedId(b.id)}
                    title="View booking"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-line bg-[#f2f4fb] text-admin-primary transition-colors hover:bg-admin-primary hover:text-white"
                  >
                    <ArrowSquareOut size={14} weight="regular" />
                  </button>
                </div>
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
