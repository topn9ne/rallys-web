"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatTime } from "@/lib/utils";

interface OperatorSlotCardProps {
  slot: any;
  role?: string;
}

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red"> = {
  AVAILABLE: "green",
  FILLING: "amber",
  FULL: "amber",
  COMPLETED: "gray",
  CANCELLED: "red",
};

export function OperatorSlotCard({ slot }: OperatorSlotCardProps) {
  const [expanded, setExpanded] = useState(false);

  const confirmedBookings = slot.bookings.filter(
    (b: any) => b.status === "CONFIRMED"
  );
  const totalRiders = confirmedBookings.reduce(
    (sum: number, b: any) =>
      sum + (slot.rideType === "THEME" ? b.seats : (b.passengerCount ?? 1)),
    0
  );

  const assignedDriver = slot.staffAssignments?.[0]?.staff;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
      {/* Slot header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant[slot.status] ?? "gray"}>
              {slot.status.replace("_", " ")}
            </Badge>
            <h3 className="font-semibold text-lg">
              {slot.rideType === "THEME"
                ? slot.theme?.name ?? "Theme Ride"
                : "Group Ride"}
            </h3>
          </div>
          <p className="mt-1 text-gray-400 text-sm">
            {formatTime(slot.startTime)} – {formatTime(slot.endTime)} ·{" "}
            {slot.bike.name} · {totalRiders} rider{totalRiders !== 1 ? "s" : ""}
          </p>
          {assignedDriver && (
            <p className="text-sm text-gray-400">Driver: {assignedDriver.name}</p>
          )}
        </div>
        <span className="text-gray-500 text-lg">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded rider roster */}
      {expanded && (
        <div className="border-t border-gray-700 p-5">
          <h4 className="mb-3 text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Rider Roster
          </h4>
          {confirmedBookings.length === 0 ? (
            <p className="text-gray-500 text-sm">No confirmed bookings.</p>
          ) : (
            <ul className="space-y-2">
              {confirmedBookings.map((booking: any) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {booking.waiver?.signerName || "—"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Pick-up: {booking.pickupLocation}
                    </p>
                    {booking.riderRoster && (
                      <p className="mt-1 text-xs text-gray-500 whitespace-pre-line">
                        {booking.riderRoster}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      booking.waiver?.status === "SIGNED" ? "green" : "amber"
                    }
                  >
                    {booking.waiver?.status === "SIGNED"
                      ? "Waiver ✓"
                      : "Waiver Pending"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
