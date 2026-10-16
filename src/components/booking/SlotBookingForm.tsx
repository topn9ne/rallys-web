"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCents } from "@/lib/utils";
import { createBooking, createDropInCheckout } from "@/server/actions/booking";
import type { CageSlot } from "@prisma/client";

interface SlotBookingFormProps {
  slotA: CageSlot;
  slotB?: CageSlot;
  bookingType: "SINGLE_LANE" | "BOTH_LANES";
  priceCents: number;
  taxRatePercent: number;
  isLoggedIn: boolean;
  isMember: boolean;
  memberName?: string;
  memberPhone?: string;
}

export function SlotBookingForm({
  slotA,
  slotB,
  bookingType,
  priceCents,
  taxRatePercent,
  isLoggedIn,
  isMember,
  memberName,
  memberPhone,
}: SlotBookingFormProps) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [phone, setPhone] = useState(memberPhone ?? "");
  const [smsOptIn, setSmsOptIn] = useState(!!memberPhone);
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const taxAmount = Math.round(priceCents * (taxRatePercent / 100));
  const total = priceCents + taxAmount;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    startTransition(async () => {
      try {
        if (isLoggedIn && isMember) {
          const result = await createBooking({
            slotIdA: slotA.id,
            slotIdB: slotB?.id,
            bookingType,
            phone,
            smsOptIn,
            notes: notes || undefined,
          });
          if (result?.error) {
            setSubmitError(result.error);
          } else if (result?.bookingId) {
            window.location.href = `/book/confirmation?bookingId=${result.bookingId}`;
          }
        } else {
          const result = await createDropInCheckout({
            slotIdA: slotA.id,
            slotIdB: slotB?.id,
            bookingType,
            guestName: isLoggedIn ? undefined : guestName,
            guestEmail: isLoggedIn ? undefined : guestEmail,
            phone: isLoggedIn ? phone : guestPhone,
            smsOptIn,
            notes: notes || undefined,
          });
          if (result?.error) {
            setSubmitError(result.error);
          } else if (result?.url) {
            window.location.href = result.url;
          }
        }
      } catch {
        setSubmitError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Order Summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">
              {bookingType === "BOTH_LANES" ? "Both Lanes · 1 hr" : `Lane ${slotA.lane} · 1 hr`}
            </dt>
            <dd className="text-gray-900">{formatCents(priceCents)}</dd>
          </div>
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
          {isLoggedIn && isMember && (
            <p className="text-xs text-green-600 pt-1">
              Covered by your membership — no additional charge.
            </p>
          )}
        </dl>
      </div>

      {/* Identity — member banner or guest fields */}
      {isLoggedIn ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <div className="text-sm text-gray-600">
            Booking as{" "}
            <span className="font-medium text-gray-900">{memberName}</span>
            {" · "}
            <a href="/account/bookings" className="text-brand-blue hover:underline">
              My bookings
            </a>
          </div>
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(308) 555-0100"
            hint="Required — your door code will be texted here."
            required
          />
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-gray-600">
              Send me text message reminders about my booking. Msg &amp; data rates may apply.
            </span>
          </label>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Details</h2>
            <a
              href={`/auth/signin?callbackUrl=/book/${slotA.id}?type=${bookingType}${slotB ? `&slotB=${slotB.id}` : ""}`}
              className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1.5 text-xs font-medium text-brand-blue hover:bg-brand-blue/20 transition-colors"
            >
              Sign in instead
            </a>
          </div>
          <Input
            label="Full Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Jane Smith"
            required
          />
          <Input
            label="Email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="you@example.com"
            hint="We'll send your confirmation here."
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="(308) 555-0100"
            hint="Required — your door code will be texted here."
            required
          />
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-gray-600">
              Send me text message reminders about my booking. Msg &amp; data rates may apply.
            </span>
          </label>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
          Notes <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={255}
          placeholder="Birthday party, team name, any special setup..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none resize-none"
        />
      </div>

      {submitError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <Button type="submit" loading={pending} size="lg" className="w-full">
        {isLoggedIn && isMember ? "Confirm Booking" : "Continue to Payment"}
      </Button>
    </form>
  );
}
