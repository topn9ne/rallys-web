"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, CalendarBlank, List, MagnifyingGlass } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { formatTime, formatCents } from "@/lib/utils";
import type { RideSlot, Theme, Bike, PricingConfig } from "@prisma/client";

type SlotWithRelations = RideSlot & { theme: Theme | null; bike: Bike };

type Pricing = {
  theme: PricingConfig | null;
  general: PricingConfig | null;
};

interface BookingCalendarProps {
  slots: SlotWithRelations[];
  todayKey: string;
  pricing: Pricing;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function groupSlotsByDate(slots: SlotWithRelations[]) {
  const map = new Map<string, SlotWithRelations[]>();
  for (const slot of slots) {
    const key = toDateKey(new Date(slot.date));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  }
  return map;
}

function slotBadge(slots: SlotWithRelations[]) {
  const allFull = slots.every((s) => s.status === "FULL");
  if (allFull) return <Badge variant="red">Full</Badge>;
  const isFilling = slots.some((s) => s.status === "FILLING");
  if (isFilling) return <Badge variant="amber">Filling</Badge>;
  return <Badge variant="green">Available</Badge>;
}

function durationLabel(start: Date | string, end: Date | string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hrs = ms / 3_600_000;
  return hrs === Math.floor(hrs) ? `${hrs} hr${hrs !== 1 ? "s" : ""}` : `${hrs} hrs`;
}

function SlotRows({ slots, pricing }: { slots: SlotWithRelations[]; pricing: Pricing }) {
  return (
    <ul className="divide-y divide-gray-100">
      {slots.map((slot) => {
        const isTheme = slot.rideType === "THEME";
        const seatsLeft = slot.seatsTotal - slot.seatsBooked;
        const duration = durationLabel(slot.startTime, slot.endTime);
        const priceConfig = isTheme ? pricing.theme : pricing.general;
        const priceLabel = priceConfig
          ? isTheme
            ? `${formatCents(priceConfig.baseAmountCents)}/person`
            : formatCents(priceConfig.baseAmountCents)
          : null;

        return (
          <li key={slot.id} className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  <span className="ml-2 text-xs font-normal text-gray-400">{duration}</span>
                </p>
                <p className="mt-0.5 text-sm text-gray-600">
                  {isTheme ? (slot.theme?.name ?? "Theme Ride") : `Group Ride · up to ${slot.bike.passengerCap} riders`}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {priceLabel && (
                    <span className="text-sm font-semibold text-brand-blue">{priceLabel}</span>
                  )}
                  {isTheme && (
                    <span className="text-xs text-gray-400">
                      {seatsLeft} of {slot.seatsTotal} seats left
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {slot.status === "FILLING" ? (
                  <Badge variant="amber">Filling up</Badge>
                ) : slot.status === "FULL" ? (
                  <Badge variant="red">Full</Badge>
                ) : (
                  <Badge variant="green">Available</Badge>
                )}
                <Link
                  href={`/book/${slot.id}`}
                  className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-dark transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function matchesQuery(slot: SlotWithRelations, q: string) {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    (slot.theme?.name ?? "").toLowerCase().includes(lower) ||
    slot.bike.name.toLowerCase().includes(lower) ||
    (slot.rideType === "THEME" ? "theme" : "group").includes(lower)
  );
}

export function BookingCalendar({ slots, todayKey, pricing }: BookingCalendarProps) {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [query, setQuery] = useState("");
  const [viewDate, setViewDate] = useState(() => {
    const key = todayKey ?? new Date().toISOString().split("T")[0];
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const effectiveTodayKey = todayKey ?? new Date().toISOString().split("T")[0];
  const [todayYear, todayMonth] = effectiveTodayKey.split("-").map(Number);

  const filteredSlots = query ? slots.filter((s) => matchesQuery(s, query)) : slots;
  const slotMap = groupSlotsByDate(filteredSlots);
  const { firstDay, daysInMonth } = getMonthDays(viewDate.getFullYear(), viewDate.getMonth());

  function prevMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    setSelectedDate(null);
  }
  function nextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    setSelectedDate(null);
  }

  const selectedSlots = selectedDate ? (slotMap.get(selectedDate) ?? []) : [];

  const upcomingDates = Array.from(slotMap.entries())
    .filter(([key]) => key >= effectiveTodayKey)
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      {/* Search + view toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-56">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedDate(null); }}
            placeholder="Search by theme, vehicle, or ride type…"
            className="w-full rounded-lg border border-white/30 bg-white/10 py-1.5 pl-8 pr-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/60 focus:bg-white/15 transition-colors"
          />
        </div>
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

      {view === "calendar" ? (
        <>
          {/* Calendar grid */}
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
                const daySlots = slotMap.get(key) ?? [];
                const isPast = key < effectiveTodayKey;
                const isSelected = key === selectedDate;
                const hasSlots = daySlots.length > 0;

                return (
                  <button
                    key={key}
                    disabled={isPast || !hasSlots}
                    onClick={() => setSelectedDate(key)}
                    className={[
                      "flex min-h-[75px] flex-col items-start border-b border-r border-gray-100 p-2 text-left transition-colors",
                      isPast || !hasSlots ? "cursor-not-allowed text-gray-300" : "hover:bg-blue-50",
                      isSelected ? "bg-brand-blue/10 ring-1 ring-inset ring-brand-blue" : "",
                    ].join(" ")}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {hasSlots && !isPast && (
                      <span className="mt-auto">{slotBadge(daySlots)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot list for selected date */}
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
              {selectedSlots.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-gray-500">
                  No rides match your search on this date.
                </p>
              ) : (
                <SlotRows slots={selectedSlots} pricing={pricing} />
              )}
            </div>
          )}
        </>
      ) : (
        /* List view */
        <div className="space-y-3">
          {upcomingDates.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-6 py-10 text-center text-sm text-gray-500">
              {query ? "No rides match your search." : "No upcoming rides available."}
            </div>
          ) : (
            upcomingDates.map(([dateKey, dateSlots]) => (
              <div key={dateKey} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-6 py-3">
                  <span className="font-semibold text-gray-800">
                    {new Date(dateKey + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric",
                    })}
                  </span>
                </div>
                <SlotRows slots={dateSlots} pricing={pricing} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Legend + contact */}
      <div className="flex items-center justify-between gap-2 drop-shadow">
        <div className="flex items-center gap-2">
          <Badge variant="green"><span className="mr-1">●</span>Available</Badge>
          <Badge variant="amber"><span className="mr-1">●</span>Filling up (≤3 seats)</Badge>
          <Badge variant="red"><span className="mr-1">●</span>Full</Badge>
        </div>
        <a
          href="https://railsiderides.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/70 backdrop-blur-sm hover:bg-black/50 hover:text-white transition-colors whitespace-nowrap"
        >
          Questions? <span className="font-semibold">Contact us</span>
        </a>
      </div>
    </div>
  );
}
