"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import { createBulkSlots } from "@/server/actions/slots";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { generateDateRange } from "@/lib/utils";
import type { Bike, Theme } from "@prisma/client";

interface BulkSlotFormProps {
  bikes: Bike[];
  themes: Theme[];
}

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function BulkSlotForm({ bikes, themes }: BulkSlotFormProps) {
  const [rideType, setRideType] = useState<"THEME" | "GENERAL">("THEME");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([6, 0]); // Sat + Sun default
  const [result, setResult] = useState<{ created?: number; skipped?: { date: string; reason: string }[]; error?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (result?.created !== undefined && !result.error) {
      formRef.current?.reset();
      setRideType("THEME");
      setStartDate("");
      setEndDate("");
      setSelectedDays([6, 0]);
    }
  }, [result]);

  const previewDates = useMemo(() => {
    if (!startDate || !endDate) return [];
    return generateDateRange(new Date(startDate), new Date(endDate), selectedDays);
  }, [startDate, endDate, selectedDays]);

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    selectedDays.forEach((d) => formData.append("daysOfWeek", String(d)));
    setResult(null);
    startTransition(async () => {
      const res = await createBulkSlots(formData);
      setResult(res);
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Ride Type"
        name="rideType"
        value={rideType}
        onChange={(e) => setRideType(e.target.value as "THEME" | "GENERAL")}
        required
      >
        <option value="THEME">Theme Ride (per seat)</option>
        <option value="GENERAL">Group Ride (full vehicle)</option>
      </Select>

      {rideType === "THEME" && (
        <Select label="Theme" name="themeId">
          <option value="">Select theme...</option>
          {themes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
      )}

      <Select label="Vehicle" name="bikeId" required>
        <option value="">Select vehicle...</option>
        {bikes.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </Select>

      <Input
        label="Start Time"
        name="startTime"
        type="time"
        required
        hint="Ride is 2 hrs. 1-hr buffer auto-added."
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="End Date"
          name="endDate"
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Day of week selector */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">Days of Week</p>
        <div className="flex gap-1.5">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                selectedDays.includes(day.value)
                  ? "bg-brand-blue text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {previewDates.length > 0 && (
        <div className="rounded-lg bg-brand-blue/5 border border-brand-blue/20 px-3 py-2">
          <p className="text-xs font-bold text-brand-blue uppercase tracking-wide">
            {previewDates.length} ride{previewDates.length !== 1 ? "s" : ""} will be created
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {previewDates
              .slice(0, 5)
              .map((d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }))
              .join(", ")}
            {previewDates.length > 5 && ` +${previewDates.length - 5} more`}
          </p>
        </div>
      )}

      {/* Result */}
      {result?.error && (
        <p className="text-sm text-red-600">{result.error}</p>
      )}
      {result?.created !== undefined && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 space-y-1">
          <p className="text-sm font-bold text-green-700">
            {result.created} ride{result.created !== 1 ? "s" : ""} created
          </p>
          {result.skipped && result.skipped.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-600">{result.skipped.length} skipped (conflicts):</p>
              <ul className="text-xs text-amber-600 list-disc list-inside">
                {result.skipped.map((s) => (
                  <li key={s.date}>{s.date}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Button type="submit" loading={pending} className="w-full" disabled={previewDates.length === 0}>
        Create {previewDates.length > 0 ? previewDates.length : ""} Ride{previewDates.length !== 1 ? "s" : ""}
      </Button>
    </form>
  );
}
