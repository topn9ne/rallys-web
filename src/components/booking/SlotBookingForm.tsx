"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCents, calcDiscount } from "@/lib/utils";
import { createCheckoutSession } from "@/server/actions/booking";
import type { RideSlot, AddOn, PickupLocation } from "@prisma/client";

interface SlotBookingFormProps {
  slot: RideSlot & { theme: any; bike: any };
  addons: AddOn[];
  pickupLocations: PickupLocation[];
  pricePerUnitCents: number;
  isLoggedIn: boolean;
  customerName?: string;
  customerPhone?: string;
  slotId: string;
  taxRatePercent: number;
}

export function SlotBookingForm({
  slot,
  addons,
  pickupLocations,
  pricePerUnitCents,
  isLoggedIn,
  customerName,
  customerPhone,
  slotId,
  taxRatePercent,
}: SlotBookingFormProps) {
  const [seats, setSeats] = useState(1);
  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [pickupLocationId, setPickupLocationId] = useState(
    pickupLocations[0]?.id ?? ""
  );
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<{
    valid: boolean;
    reason?: string;
    discountAmountCents?: number;
    discountCodeId?: string;
  } | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const SESSION_KEY = `booking-state-${slotId}`;

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.seats !== undefined) setSeats(state.seats);
        if (state.passengerCount !== undefined) setPassengerCount(state.passengerCount);
        if (state.selectedAddons) setSelectedAddons(new Set(state.selectedAddons));
        if (state.pickupLocationId) setPickupLocationId(state.pickupLocationId);
        if (state.discountCode) setDiscountCode(state.discountCode);
        sessionStorage.removeItem(SESSION_KEY);
        return; // sessionStorage takes priority over URL params
      }
    } catch {}

    // Fallback: read "book again" params from URL
    const urlSeats = searchParams.get("seats");
    const urlAddons = searchParams.get("addons");
    if (urlSeats) setSeats(Math.max(1, Number(urlSeats)));
    if (urlAddons) setSelectedAddons(new Set(urlAddons.split(",").filter(Boolean)));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  function saveStateForSignIn() {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          seats,
          passengerCount,
          selectedAddons: Array.from(selectedAddons),
          pickupLocationId,
          discountCode,
        })
      );
    } catch {}
  }

  const isTheme = slot.rideType === "THEME";
  const maxSeats = slot.seatsTotal - slot.seatsBooked;

  const baseAmount = isTheme ? pricePerUnitCents * seats : pricePerUnitCents;
  const addonTotal = addons
    .filter((a) => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + a.priceCents, 0);
  const discountAmount = discountResult?.valid
    ? discountResult.discountAmountCents ?? 0
    : 0;
  const subtotal = baseAmount + addonTotal - discountAmount;
  const taxAmount = Math.round(subtotal * (taxRatePercent / 100));
  const total = subtotal + taxAmount;

  function toggleAddon(id: string) {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleValidateCode() {
    const res = await fetch("/api/validate-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: discountCode,
        rideType: slot.rideType,
        themeId: slot.themeId,
        baseAmountCents: baseAmount,
      }),
    });
    const data = await res.json();
    setDiscountResult(data);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("slotId", slot.id);
        formData.set("seats", seats.toString());
        formData.set("passengerCount", passengerCount.toString());
        formData.set("pickupLocationId", pickupLocationId);
        formData.set("addonIds", JSON.stringify(Array.from(selectedAddons)));
        if (discountResult?.valid && discountResult.discountCodeId) {
          formData.set("discountCodeId", discountResult.discountCodeId);
        }
        if (!isLoggedIn) {
          formData.set("guestName", guestName);
          formData.set("guestEmail", guestEmail);
        }

        // Phone + SMS opt-in from the form DOM (both guest and logged-in)
        const form = e.currentTarget;
        const phoneInput = form.querySelector<HTMLInputElement>('input[name="guestPhone"]');
        const smsCheckbox = form.querySelector<HTMLInputElement>('input[name="notificationSms"]');
        if (phoneInput?.value) formData.set("guestPhone", phoneInput.value);
        if (smsCheckbox?.checked) formData.set("notificationSms", "on");

        const result = await createCheckoutSession(formData);
        if (result?.url) {
          window.location.href = result.url;
        } else if (result?.error) {
          setSubmitError(result.error);
        }
      } catch {
        setSubmitError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seat selection (Theme only) */}
      {isTheme && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Seats</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSeats(Math.max(1, seats - 1))}
              className="h-10 w-10 rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-50"
            >
              −
            </button>
            <span className="text-2xl font-bold w-8 text-center">{seats}</span>
            <button
              type="button"
              onClick={() => setSeats(Math.min(maxSeats, seats + 1))}
              className="h-10 w-10 rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-50"
            >
              +
            </button>
            <span className="text-sm text-gray-500">
              {formatCents(pricePerUnitCents)}/seat · {maxSeats} seats available
            </span>
          </div>
        </div>
      )}

      {/* Passenger count (General only — informational) */}
      {!isTheme && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Passenger Count</h2>
          <Input
            label="How many people in your group?"
            type="number"
            min={1}
            max={14}
            value={passengerCount}
            onChange={(e) => setPassengerCount(Number(e.target.value))}
            hint="Informational only — you're reserving the whole vehicle."
          />
        </div>
      )}

      {/* Add-ons */}
      {addons.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Add-ons</h2>
          <ul className="space-y-3">
            {addons.map((addon) => (
              <li key={addon.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={addon.id}
                  checked={selectedAddons.has(addon.id)}
                  onChange={() => toggleAddon(addon.id)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <label htmlFor={addon.id} className="flex-1 cursor-pointer">
                  <span className="font-medium text-gray-900">{addon.name}</span>
                  {addon.description && (
                    <span className="ml-2 text-sm text-gray-500">
                      {addon.description}
                    </span>
                  )}
                </label>
                <span className="text-sm font-medium text-gray-900">
                  +{formatCents(addon.priceCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pickup location */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Pick-up Location</h2>
        <Select
          value={pickupLocationId}
          onChange={(e) => setPickupLocationId(e.target.value)}
          required
        >
          {pickupLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} — {loc.address}
            </option>
          ))}
        </Select>
      </div>

      {/* Discount code */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Discount Code</h2>
        <div className="flex gap-2">
          <Input
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value.toUpperCase());
              setDiscountResult(null);
            }}
            placeholder="Enter code"
            className="flex-1 uppercase"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleValidateCode}
            disabled={!discountCode}
          >
            Apply
          </Button>
        </div>
        {discountResult && (
          <p
            className={`mt-2 text-sm ${discountResult.valid ? "text-green-600" : "text-red-600"}`}
          >
            {discountResult.valid
              ? `Code applied: −${formatCents(discountResult.discountAmountCents ?? 0)}`
              : discountResult.reason}
          </p>
        )}
      </div>

      {/* Order summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Order Summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">
              {isTheme ? `${seats} seat${seats > 1 ? "s" : ""}` : "Full vehicle rental"}
            </dt>
            <dd className="text-gray-900">{formatCents(baseAmount)}</dd>
          </div>
          {addonTotal > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Add-ons</dt>
              <dd className="text-gray-900">+{formatCents(addonTotal)}</dd>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <dt>Discount ({discountCode})</dt>
              <dd>−{formatCents(discountAmount)}</dd>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Tax ({taxRatePercent}%)</dt>
              <dd className="text-gray-900">+{formatCents(taxAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-base">
            <dt className="text-gray-900">Total</dt>
            <dd className="text-brand-blue">{formatCents(total)}</dd>
          </div>
        </dl>
      </div>

      {/* Identity — guest fields or logged-in banner */}
      {isLoggedIn ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <div className="text-sm text-gray-600">
            Booking as{" "}
            <span className="font-medium text-gray-900">{customerName}</span>
            {" · "}
            <a href="/account/bookings" className="text-brand-blue hover:underline">
              My bookings
            </a>
          </div>
          <Input
            label="Phone"
            name="guestPhone"
            type="tel"
            defaultValue={customerPhone}
            placeholder="(308) 555-0100"
            hint="Required — used for ride-day reminders."
            required
          />
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="notificationSms"
              defaultChecked={!!customerPhone}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-gray-600">
              Send me text message reminders about my booking. Msg &amp; data rates may apply.{" "}
              <a href="/privacy" target="_blank" className="text-brand-blue hover:underline">Privacy policy</a>{" "}
              &amp;{" "}
              <a href="/terms" target="_blank" className="text-brand-blue hover:underline">Terms</a>.
            </span>
          </label>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Details</h2>
            <a
              href={`/account/signin?callbackUrl=/book/${slotId}`}
              onClick={saveStateForSignIn}
              className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1.5 text-xs font-medium text-brand-blue hover:bg-brand-blue/20 transition-colors"
            >
              Sign in instead →
            </a>
          </div>
          <Input
            label="Full Name"
            name="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Jane Smith"
            required={!isLoggedIn}
          />
          <Input
            label="Email"
            name="guestEmail"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="you@example.com"
            hint="We'll send your confirmation here. Sign in to view your booking history."
            required={!isLoggedIn}
          />
          <Input
            label="Phone"
            name="guestPhone"
            type="tel"
            placeholder="(308) 555-0100"
            hint="Required — used for ride-day reminders."
            required
          />
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="notificationSms"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-gray-600">
              Send me text message reminders about my booking. Msg &amp; data rates may apply.{" "}
              <a href="/privacy" target="_blank" className="text-brand-blue hover:underline">Privacy policy</a>{" "}
              &amp;{" "}
              <a href="/terms" target="_blank" className="text-brand-blue hover:underline">Terms</a>.
            </span>
          </label>
        </div>
      )}

      {/* Rider roster */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label htmlFor="riderRoster" className="block text-sm font-semibold text-gray-900 mb-2">
          Rider Roster <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="riderRoster"
          name="riderRoster"
          rows={4}
          placeholder={"List your riders, one per line:\nJane Smith\nAlex Johnson\n..."}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none resize-none"
        />
        <p className="mt-1.5 text-xs text-gray-400">
          Helps your driver prep the ride. Not required — they can collect names at pickup too.
        </p>
      </div>

      {/* Special requests */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
          Special Requests <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          maxLength={255}
          placeholder="Bachelorette party, accessibility needs, decoration requests..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none resize-none"
        />
      </div>

      {submitError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <Button type="submit" loading={pending} size="lg" className="w-full">
        Continue to Payment
      </Button>
    </form>
  );
}
