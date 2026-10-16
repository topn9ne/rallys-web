"use client";

import { useEffect, useState, useTransition } from "react";
import { createManualBooking, getSlotForManualBooking } from "@/server/actions/manualBookings";
import { X, UserPlus, CurrencyDollar, MapPin, Ticket, Signature } from "@phosphor-icons/react/dist/ssr";

type SlotInfo = NonNullable<Awaited<ReturnType<typeof getSlotForManualBooking>>>;

function formatDateShort(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  }).format(new Date(date));
}

function formatTimeShort(date: string | Date) {
  const str = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "UTC",
  }).format(new Date(date));
  return str.replace(":00", "");
}

interface Props {
  slotId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManualBookingModal({ slotId, onClose, onSuccess }: Props) {
  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingType, setBookingType] = useState<"THEME_SEAT" | "GENERAL_FULL">("THEME_SEAT");
  const [seats, setSeats] = useState(1);
  const [pickup, setPickup] = useState("");
  const [totalDollars, setTotalDollars] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [waiverOffline, setWaiverOffline] = useState(false);

  useEffect(() => {
    getSlotForManualBooking(slotId).then((data) => {
      setSlot(data);
      if (data?.rideType === "GENERAL") setBookingType("GENERAL_FULL");
      setLoading(false);
    });
  }, [slotId]);

  function handleSubmit() {
    if (!name.trim()) { setError("Customer name is required."); return; }
    if (!email.trim()) { setError("Customer email is required."); return; }
    if (!pickup.trim()) { setError("Pickup location is required."); return; }
    const totalCents = Math.round(parseFloat(totalDollars || "0") * 100);
    setError(null);

    startTransition(async () => {
      const result = await createManualBooking({
        slotId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        bookingType,
        seats: bookingType === "THEME_SEAT" ? seats : 1,
        pickupLocation: pickup,
        totalAmountCents: totalCents,
        paymentReference: paymentRef || undefined,
        waiverSignedOffline: waiverOffline,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        onSuccess?.();
        setTimeout(onClose, 1500);
      }
    });
  }

  const seatsRemaining = slot ? slot.seatsTotal - slot.seatsBooked : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserPlus size={20} weight="duotone" color="#2B5CE6" />
            <h2 className="font-extrabold text-gray-900">Manual Booking</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : !slot ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Slot not found.</div>
        ) : success ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Ticket size={28} weight="duotone" color="#16a34a" />
            </div>
            <p className="text-lg font-extrabold text-gray-900">Booking Created!</p>
            <p className="text-sm text-gray-500">The manual booking has been confirmed.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Slot summary */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
              <p className="font-semibold text-brand-blue">
                {slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride"}
                {" · "}{slot.bike.name}
              </p>
              <p className="text-blue-600">
                {formatDateShort(slot.date)} · {formatTimeShort(slot.startTime)} – {formatTimeShort(slot.endTime)}
              </p>
              {slot.rideType === "THEME" && (
                <p className="mt-0.5 text-xs text-blue-500">
                  {seatsRemaining} seat{seatsRemaining !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>

            {/* Customer */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <UserPlus size={13} weight="duotone" /> Customer
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Full name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
                <input
                  type="email"
                  placeholder="Email address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
            </div>

            {/* Booking type */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <Ticket size={13} weight="duotone" /> Booking
              </h3>
              <div className="space-y-2">
                {slot.rideType === "THEME" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingType("THEME_SEAT")}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                        bookingType === "THEME_SEAT"
                          ? "border-brand-blue bg-brand-blue text-white"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Seat(s)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType("GENERAL_FULL")}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                        bookingType === "GENERAL_FULL"
                          ? "border-brand-blue bg-brand-blue text-white"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Full Bike
                    </button>
                  </div>
                )}
                {bookingType === "THEME_SEAT" && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 shrink-0">Seats</label>
                    <input
                      type="number"
                      min={1}
                      max={seatsRemaining}
                      value={seats}
                      onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                    <span className="text-xs text-gray-400">of {seatsRemaining} available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <MapPin size={13} weight="duotone" /> Pickup
              </h3>
              <input
                type="text"
                placeholder="Pickup location name *"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Payment */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <CurrencyDollar size={13} weight="duotone" /> Payment
              </h3>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={totalDollars}
                    onChange={(e) => setTotalDollars(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Payment reference (check #, invoice #, etc.)"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
            </div>

            {/* Waiver */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <Signature size={13} weight="duotone" /> Waiver
              </h3>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={waiverOffline}
                  onChange={(e) => setWaiverOffline(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-brand-blue"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Waiver signed offline</p>
                  <p className="text-xs text-gray-400">Paper waiver collected in person</p>
                </div>
              </label>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && !success && slot && (
          <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <UserPlus size={15} weight="duotone" />
              {pending ? "Creating…" : "Create Booking"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
