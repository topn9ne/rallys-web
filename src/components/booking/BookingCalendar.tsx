"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, CalendarBlank, List } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { formatTime, formatCents } from "@/lib/utils";
import type { PricingConfig } from "@prisma/client";
import type { SlotInfo } from "@/server/services/virtualSlots";

type Pricing = Record<string, PricingConfig>;

interface BookingCalendarProps {
  slots: SlotInfo[];
  todayKey: string;
  pricing: Pricing;
  isDropIn?: boolean;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

type TimeSlot = {
  time: string;
  startTime: Date;
  endTime: Date;
  laneA?: SlotInfo;
  laneB?: SlotInfo;
};

function groupByDateAndTime(slots: SlotInfo[]) {
  const dateMap = new Map<string, Map<string, TimeSlot>>();
  for (const slot of slots) {
    const dateKey = toDateKey(new Date(slot.date));
    if (!dateMap.has(dateKey)) dateMap.set(dateKey, new Map());
    const timeMap = dateMap.get(dateKey)!;
    const timeKey = new Date(slot.startTime).toISOString();
    if (!timeMap.has(timeKey)) {
      timeMap.set(timeKey, {
        time: timeKey,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
      });
    }
    const ts = timeMap.get(timeKey)!;
    if (slot.lane === "A") ts.laneA = slot;
    if (slot.lane === "B") ts.laneB = slot;
  }
  return dateMap;
}

function hasAvailability(
  timeSlots: Map<string, TimeSlot>,
  bookingType: "SINGLE_LANE" | "BOTH_LANES"
) {
  for (const ts of timeSlots.values()) {
    if (bookingType === "BOTH_LANES") {
      if (ts.laneA?.status === "AVAILABLE" && ts.laneB?.status === "AVAILABLE") return true;
    } else {
      if (ts.laneA?.status === "AVAILABLE" || ts.laneB?.status === "AVAILABLE") return true;
    }
  }
  return false;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function BookingCalendar({ slots, todayKey, pricing, isDropIn }: BookingCalendarProps) {
  const [bookingType, setBookingType] = useState<"SINGLE_LANE" | "BOTH_LANES">("SINGLE_LANE");
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [viewDate, setViewDate] = useState(() => {
    const key = todayKey ?? new Date().toISOString().split("T")[0];
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const effectiveTodayKey = todayKey ?? new Date().toISOString().split("T")[0];
  const [todayYear, todayMonth] = effectiveTodayKey.split("-").map(Number);

  const dateMap = groupByDateAndTime(slots);
  const { firstDay, daysInMonth } = getMonthDays(viewDate.getFullYear(), viewDate.getMonth());

  const pricingTier = bookingType === "BOTH_LANES"
    ? (isDropIn ? "DROPIN_BOTH" : "TEAM")
    : (isDropIn ? "DROPIN_SINGLE" : "FAMILY");
  const activePrice = pricing[pricingTier];

  function prevMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    setSelectedDate(null);
  }
  function nextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    setSelectedDate(null);
  }

  const selectedTimeSlots = selectedDate
    ? [...(dateMap.get(selectedDate)?.values() ?? [])]
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    : [];

  const upcomingDates = [...dateMap.entries()]
    .filter(([key, timeMap]) => key >= effectiveTodayKey && hasAvailability(timeMap, bookingType))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      {/* Booking type toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-white/30 bg-white/10 p-1">
          <button
            onClick={() => { setBookingType("SINGLE_LANE"); setSelectedDate(null); }}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              bookingType === "SINGLE_LANE"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-white/80 hover:text-white",
            ].join(" ")}
          >
            Player / Family
          </button>
          <button
            onClick={() => { setBookingType("BOTH_LANES"); setSelectedDate(null); }}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              bookingType === "BOTH_LANES"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-white/80 hover:text-white",
            ].join(" ")}
          >
            Team Session
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activePrice && (
            <span className="text-sm font-semibold text-white/90">
              {isDropIn
                ? `${formatCents(activePrice.amountCents)}/session`
                : `${formatCents(activePrice.amountCents)}/mo`}
            </span>
          )}
          <div className="inline-flex rounded-lg border border-white/30 bg-white/10 p-0.5">
            <button
              onClick={() => setView("calendar")}
              className={[
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                view === "calendar"
                  ? "bg-white text-brand-blue shadow-sm"
                  : "text-white/80 hover:text-white",
              ].join(" ")}
            >
              <CalendarBlank size={13} weight="duotone" />
              Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={[
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                view === "list"
                  ? "bg-white text-brand-blue shadow-sm"
                  : "text-white/80 hover:text-white",
              ].join(" ")}
            >
              <List size={13} weight="bold" />
              List
            </button>
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <button
                onClick={prevMonth}
                disabled={viewDate <= new Date(todayYear, todayMonth - 1, 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                aria-label="Previous month"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
              <h2 className="font-semibold text-gray-900">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Next month"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 overflow-hidden rounded-b-xl">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-b border-r border-gray-100 p-2" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                const key = toDateKey(dateObj);
                const timeSlots = dateMap.get(key);
                const isPast = key < effectiveTodayKey;
                const isSelected = key === selectedDate;
                const available = timeSlots ? hasAvailability(timeSlots, bookingType) : false;

                return (
                  <button
                    key={key}
                    disabled={isPast || !available}
                    onClick={() => setSelectedDate(key)}
                    className={[
                      "flex min-h-[75px] flex-col items-start border-b border-r border-gray-100 p-2 text-left transition-colors",
                      isPast || !available ? "cursor-not-allowed text-gray-300" : "hover:bg-blue-50",
                      isSelected ? "bg-brand-blue/10 ring-1 ring-inset ring-brand-blue" : "",
                    ].join(" ")}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {available && !isPast && (
                      <span className="mt-auto">
                        <Badge variant="green">Open</Badge>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">
                  Available Times —{" "}
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </h3>
              </div>
              <TimeSlotRows
                timeSlots={selectedTimeSlots}
                bookingType={bookingType}
                pricing={activePrice}
              />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {upcomingDates.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-6 py-10 text-center text-sm text-gray-500">
              No available slots. Check back soon!
            </div>
          ) : (
            upcomingDates.map(([dateKey, timeMap]) => {
              const timeSlots = [...timeMap.values()].sort(
                (a, b) => a.startTime.getTime() - b.startTime.getTime()
              );
              return (
                <div key={dateKey} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-6 py-3">
                    <span className="font-semibold text-gray-800">
                      {new Date(dateKey + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "long", month: "long", day: "numeric",
                      })}
                    </span>
                  </div>
                  <TimeSlotRows
                    timeSlots={timeSlots}
                    bookingType={bookingType}
                    pricing={activePrice}
                  />
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="flex items-center gap-2 drop-shadow">
        <Badge variant="green"><span className="mr-1">●</span>Available</Badge>
        <Badge variant="gray"><span className="mr-1">●</span>Booked</Badge>
      </div>
    </div>
  );
}

function TimeSlotRows({
  timeSlots,
  bookingType,
  pricing,
}: {
  timeSlots: TimeSlot[];
  bookingType: "SINGLE_LANE" | "BOTH_LANES";
  pricing?: PricingConfig;
}) {
  const filtered = timeSlots.filter((ts) => {
    if (bookingType === "BOTH_LANES") {
      return ts.laneA?.status === "AVAILABLE" && ts.laneB?.status === "AVAILABLE";
    }
    return ts.laneA?.status === "AVAILABLE" || ts.laneB?.status === "AVAILABLE";
  });

  if (filtered.length === 0) {
    return (
      <p className="px-6 py-8 text-center text-sm text-gray-500">
        No available time slots.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {filtered.map((ts) => {
        if (bookingType === "BOTH_LANES") {
          return (
            <li key={ts.time} className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatTime(ts.startTime)} – {formatTime(ts.endTime)}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    Both Lanes · 1 hr
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {pricing && (
                    <span className="text-sm font-semibold text-brand-blue">
                      {formatCents(pricing.amountCents)}
                    </span>
                  )}
                  <Link
                    href={`/book/${ts.laneA!.id}?type=BOTH_LANES&slotB=${ts.laneB!.id}`}
                    className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-dark transition-colors"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </li>
          );
        }

        // Single lane — show each available lane
        const lanes = [
          ts.laneA?.status === "AVAILABLE" ? ts.laneA : null,
          ts.laneB?.status === "AVAILABLE" ? ts.laneB : null,
        ].filter(Boolean) as SlotInfo[];

        return lanes.map((slot) => (
          <li key={slot.id} className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">
                  {formatTime(ts.startTime)} – {formatTime(ts.endTime)}
                </p>
                <p className="mt-0.5 text-sm text-gray-600">
                  Lane {slot.lane} · 1 hr
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pricing && (
                  <span className="text-sm font-semibold text-brand-blue">
                    {formatCents(pricing.amountCents)}
                  </span>
                )}
                <Link
                  href={`/book/${slot.id}?type=SINGLE_LANE`}
                  className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-dark transition-colors"
                >
                  Book
                </Link>
              </div>
            </div>
          </li>
        ));
      })}
    </ul>
  );
}
