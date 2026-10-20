"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCents } from "@/lib/utils";
import { createBooking, createDropInCheckout } from "@/server/actions/booking";
import { validatePromoCode } from "@/server/actions/promoCodes";
import type { CageSlot } from "@prisma/client";

interface PlayerOption {
  id: string;
  name: string;
}

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
  players?: PlayerOption[];
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
  players = [],
}: SlotBookingFormProps) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [phone, setPhone] = useState(memberPhone ?? "");
  const [smsOptIn, setSmsOptIn] = useState(!!memberPhone);
  const [notes, setNotes] = useState("");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    players.map((p) => p.id),
  );
  const [promoInput, setPromoInput] = useState("");
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<{ type: "PERCENT" | "FIXED"; amount: number; description: string | null } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function togglePlayer(id: string) {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoError(null);
    setPromoLoading(true);
    try {
      const result = await validatePromoCode(promoInput);
      if (result.error) {
        setPromoError(result.error);
        setPromoCodeId(null);
        setPromoDiscount(null);
      } else if (result.valid) {
        setPromoCodeId(result.id!);
        setPromoDiscount({
          type: result.discountType as "PERCENT" | "FIXED",
          amount: result.discountAmount!,
          description: result.description ?? null,
        });
      }
    } catch {
      setPromoError("Failed to validate code.");
    } finally {
      setPromoLoading(false);
    }
  }

  function clearPromo() {
    setPromoCodeId(null);
    setPromoDiscount(null);
    setPromoInput("");
    setPromoError(null);
  }

  let discountCents = 0;
  if (promoDiscount) {
    discountCents =
      promoDiscount.type === "PERCENT"
        ? Math.round((priceCents * promoDiscount.amount) / 100)
        : promoDiscount.amount;
    discountCents = Math.min(discountCents, priceCents);
  }
  const adjustedBase = priceCents - discountCents;
  const taxAmount = Math.round(adjustedBase * (taxRatePercent / 100));
  const total = adjustedBase + taxAmount;

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
            playerIds: selectedPlayerIds.length > 0 ? selectedPlayerIds : undefined,
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
            promoCodeId: promoCodeId ?? undefined,
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
          {discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-green-600">Promo discount</dt>
              <dd className="text-green-600">−{formatCents(discountCents)}</dd>
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
          {isLoggedIn && isMember && (
            <p className="text-xs text-green-600 pt-1">
              Covered by your membership — no additional charge.
            </p>
          )}
        </dl>
      </div>

      {/* Promo code — drop-in only */}
      {!(isLoggedIn && isMember) && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Promo Code</h2>
          {promoCodeId && promoDiscount ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-2.5">
              <div>
                <span className="text-sm font-medium text-green-800">
                  {promoInput.toUpperCase()}
                </span>
                <span className="ml-2 text-sm text-green-600">
                  {promoDiscount.type === "PERCENT"
                    ? `${promoDiscount.amount}% off`
                    : `${formatCents(promoDiscount.amount)} off`}
                </span>
              </div>
              <button
                type="button"
                onClick={clearPromo}
                className="text-sm font-medium text-green-700 hover:text-green-900"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                label=""
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter code"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoInput.trim()}
                className="shrink-0 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {promoLoading ? "..." : "Apply"}
              </button>
            </div>
          )}
          {promoError && (
            <p className="mt-2 text-sm text-red-600">{promoError}</p>
          )}
        </div>
      )}

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

      {/* Player selection (members with players, single-lane only) */}
      {isLoggedIn && isMember && players.length > 0 && bookingType === "SINGLE_LANE" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Who&apos;s hitting?</h2>
          <p className="mb-3 text-xs text-gray-500">
            Select the players for this session to track their Cage Rats hours.
          </p>
          <div className="space-y-2">
            {players.map((player) => (
              <label key={player.id} className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedPlayerIds.includes(player.id)}
                  onChange={() => togglePlayer(player.id)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-sm text-gray-700">{player.name}</span>
              </label>
            ))}
          </div>
          {selectedPlayerIds.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              No players selected — cage time won&apos;t be tracked for this session.
            </p>
          )}
        </div>
      )}

      {isLoggedIn && isMember && players.length === 0 && bookingType === "SINGLE_LANE" && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">
            <a href="/account/players" className="font-medium text-brand-blue hover:underline">
              Add players
            </a>{" "}
            to track Cage Rats hours for this session.
          </p>
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
