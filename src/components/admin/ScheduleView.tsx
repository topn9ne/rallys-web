"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatTime, cn } from "@/lib/utils";
import { SlotBlockButton } from "@/components/admin/SlotBlockButton";
import { SlotUnblockButton } from "@/components/admin/SlotUnblockButton";
import { SlotDeleteButton } from "@/components/admin/SlotDeleteButton";
import { ManualBookingModal } from "@/components/admin/ManualBookingModal";
import { List, CalendarBlank, CaretLeft, CaretRight, ArrowFatLinesDown, BaseballCap, UserPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

type Slot = {
  id: string;
  lane: string;
  date: string | Date;
  startTime: string | Date;
  endTime: string | Date;
  status: string;
  blockReason?: string | null;
  bookingsA: { id: string; member?: { name: string } | null; guestName?: string | null }[];
};

const statusVariant: Record<string, "green" | "amber" | "red" | "gray" | "blue" | "purple"> = {
  AVAILABLE: "green",
  BOOKED: "amber",
  BLOCKED: "purple",
};

const statusDot: Record<string, string> = {
  AVAILABLE: "bg-green-400",
  BOOKED: "bg-amber-400",
  BLOCKED: "bg-purple-400",
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function toUTCKey(d: string | Date): string {
  const date = new Date(d);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function localDayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateShort(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(date));
}

function formatTimeShort(date: string | Date) {
  const str = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(date));
  return str.replace(":00", "");
}

export function ScheduleView({ slots }: { slots: Slot[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [listLimit, setListLimit] = useState(10);

  const now = new Date();
  const [calMonth, setCalMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const key = toUTCKey(slot.date);
      const arr = map.get(key) ?? [];
      arr.push(slot);
      map.set(key, arr);
    }
    return map;
  }, [slots]);

  const calendarDays = useMemo(() => {
    const { year, month } = calMonth;
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calMonth]);

  const todayKey = localDayKey(now.getFullYear(), now.getMonth(), now.getDate());

  function prevMonth() {
    setCalMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
    setSelectedDay(null);
  }

  function nextMonth() {
    setCalMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
    setSelectedDay(null);
  }

  const selectedSlots = selectedDay ? (slotsByDate.get(selectedDay) ?? []) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
            <BaseballCap size={22} weight="duotone" color="#2B5CE6" />
            Upcoming Sessions
          </h2>
          <div className="flex w-full overflow-hidden rounded-lg border border-gray-200 sm:w-auto">
            <button
              onClick={() => { setView("list"); setListLimit(10); }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                view === "list" ? "bg-brand-blue text-white" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <List size={15} />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                view === "calendar" ? "bg-brand-blue text-white" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <CalendarBlank size={15} />
              Calendar
            </button>
          </div>
        </div>
      </CardHeader>

      {view === "list" ? (
        <CardBody className="p-0">
          <ul className="divide-y divide-gray-100">
            {slots.slice(0, listLimit).map((slot) => (
              <SlotRow key={slot.id} slot={slot} showDate />
            ))}
            {slots.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-gray-500">
                No upcoming sessions. Create slots below.
              </li>
            )}
          </ul>
          {slots.length > listLimit && (
            <div className="flex justify-center border-t border-gray-100 px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setListLimit((n) => n + 10)}
                className="border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <ArrowFatLinesDown size={15} weight="fill" />
                <span className="font-bold tracking-wide">SHOW MORE</span>
                <span className="text-xs opacity-70">({slots.length - listLimit})</span>
              </Button>
            </div>
          )}
        </CardBody>
      ) : (
        <CardBody>
          <div className="mb-3 flex items-center justify-between">
            <button onClick={prevMonth} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
              <CaretLeft size={17} />
            </button>
            <span className="font-semibold text-gray-900">
              {MONTHS[calMonth.month]} {calMonth.year}
            </span>
            <button onClick={nextMonth} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
              <CaretRight size={17} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {DAYS.map((d) => (
              <div key={d} className="py-1 text-center text-xs font-medium text-gray-400">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="min-h-16 bg-white" />;
              const key = localDayKey(calMonth.year, calMonth.month, day);
              const daySlots = slotsByDate.get(key) ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDay;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={cn(
                    "min-h-16 bg-white p-1.5 text-left align-top transition-colors",
                    isSelected && "bg-blue-50",
                    !isSelected && daySlots.length > 0 && "hover:bg-gray-50"
                  )}
                >
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    isToday ? "bg-brand-blue font-bold text-white" : "text-gray-700"
                  )}>
                    {day}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {daySlots.slice(0, 4).map((s) => (
                      <span key={s.id} className={cn("h-1.5 w-1.5 rounded-full", statusDot[s.status] ?? "bg-gray-300")} />
                    ))}
                    {daySlots.length > 4 && (
                      <span className="text-xs leading-none text-gray-400">+{daySlots.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedDay && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" })
                  .format(new Date(`${selectedDay}T12:00:00`))}
              </p>
              {selectedSlots.length === 0 ? (
                <p className="text-sm text-gray-400">No sessions scheduled.</p>
              ) : (
                <ul className="-mx-4 divide-y divide-gray-100">
                  {selectedSlots.map((slot) => <SlotRow key={slot.id} slot={slot} showDate={false} />)}
                </ul>
              )}
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
}

function SlotRow({ slot, showDate }: { slot: Slot; showDate: boolean }) {
  const [manualOpen, setManualOpen] = useState(false);
  const isAvailable = slot.status === "AVAILABLE";
  const booking = slot.bookingsA?.[0];
  const bookerName = booking?.member?.name ?? booking?.guestName ?? null;

  const actions = slot.status === "BLOCKED" ? (
    <div className="flex gap-1">
      <SlotUnblockButton slotId={slot.id} />
      <SlotDeleteButton slotId={slot.id} />
    </div>
  ) : isAvailable ? (
    <div className="flex gap-1">
      <SlotBlockButton slotId={slot.id} />
      <SlotDeleteButton slotId={slot.id} />
    </div>
  ) : null;

  return (
    <>
      <li className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[slot.status] ?? "gray"}>{formatStatus(slot.status)}</Badge>
            <span className="font-medium text-gray-900">Lane {slot.lane}</span>
            {bookerName && (
              <span className="text-sm text-gray-500">&middot; {bookerName}</span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {showDate && <>{formatDateShort(slot.date)} &middot; </>}
            {formatTimeShort(slot.startTime)} &ndash; {formatTimeShort(slot.endTime)}
          </p>
          {slot.status === "BLOCKED" && slot.blockReason && (
            <p className="mt-0.5 text-xs text-purple-600 italic">{slot.blockReason}</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1">
          {isAvailable && (
            <button
              onClick={() => setManualOpen(true)}
              className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-brand-blue transition-all hover:bg-blue-50 hover:gap-1.5 hover:pr-3"
            >
              <UserPlus size={18} weight="duotone" className="shrink-0" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[80px]">
                Book
              </span>
            </button>
          )}
          {actions}
        </div>
      </li>
      {manualOpen && (
        <ManualBookingModal
          slotId={slot.id}
          onClose={() => setManualOpen(false)}
        />
      )}
    </>
  );
}
