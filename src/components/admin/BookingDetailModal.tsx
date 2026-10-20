"use client";

import { useEffect, useState } from "react";
import { getBookingDetail } from "@/server/actions/adminBookings";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BookingActions } from "@/components/admin/BookingActions";
import {
  X,
  User,
  BaseballCap,
  CalendarBlank,
  CurrencyDollar,
  Signature,
  Key,
} from "@phosphor-icons/react/dist/ssr";

type BookingDetail = NonNullable<Awaited<ReturnType<typeof getBookingDetail>>>;

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red"> = {
  PENDING: "amber",
  CONFIRMED: "green",
  COMPLETED: "gray",
  CANCELLED: "gray",
};

function toTitleCase(str: string) {
  return str.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gray-400">
        {icon}
        {title}
      </h3>
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-800 space-y-1.5">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}

interface Props {
  bookingId: string;
  onClose: () => void;
}

export function BookingDetailModal({ bookingId, onClose }: Props) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBookingDetail(bookingId).then((data) => {
      setBooking(data);
      setLoading(false);
    });
  }, [bookingId]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold text-gray-900">Booking Details</h2>
            {booking && (
              <Badge variant={statusVariant[booking.status] ?? "gray"}>
                {toTitleCase(booking.status)}
              </Badge>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading...</div>
        ) : !booking ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Booking not found.</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <Section icon={<User size={13} weight="duotone" />} title={booking.memberId ? "Member" : "Guest"}>
              <Row label="Name" value={booking.member?.name ?? booking.guestName ?? "—"} />
              <Row label="Email" value={booking.member?.email ?? booking.guestEmail ?? "—"} />
              <Row label="Phone" value={booking.member?.phone ?? booking.guestPhone ?? <span className="text-gray-400 italic">Not on file</span>} />
              {booking.memberId && (
                <Row label="Type" value={<Badge variant="blue">Member</Badge>} />
              )}
            </Section>

            <Section icon={<BaseballCap size={13} weight="duotone" />} title="Session">
              <Row
                label="Lane"
                value={booking.bookingType === "BOTH_LANES" ? "Both Lanes" : `Lane ${booking.slotA.lane}`}
              />
              <Row label="Date" value={formatDate(booking.slotA.date)} />
              <Row label="Time" value={`${formatTime(booking.slotA.startTime)} – ${formatTime(booking.slotA.endTime)}`} />
              <Row label="Booking type" value={toTitleCase(booking.bookingType)} />
            </Section>

            {booking.accessCode && (
              <Section icon={<Key size={13} weight="duotone" />} title="Access Code">
                <Row label="PIN" value={<span className="font-mono font-bold">{booking.accessCodePin ?? "—"}</span>} />
                <Row label="Status" value={toTitleCase(booking.accessCode.status)} />
              </Section>
            )}

            <Section icon={<CurrencyDollar size={13} weight="duotone" />} title="Payment">
              <Row label="Base" value={formatCents(booking.baseAmountCents)} />
              {booking.taxAmountCents > 0 && <Row label="Tax" value={formatCents(booking.taxAmountCents)} />}
              <div className="border-t border-gray-200 pt-1.5">
                <Row label="Total" value={<span className="text-base font-extrabold text-gray-900">{booking.totalAmountCents > 0 ? formatCents(booking.totalAmountCents) : "Member"}</span>} />
              </div>
              {booking.stripePaymentIntentId && (
                <Row label="Stripe PI" value={<span className="font-mono text-xs text-gray-500">{booking.stripePaymentIntentId}</span>} />
              )}
            </Section>

            {booking.notes && (
              <Section icon={<CalendarBlank size={13} weight="duotone" />} title="Notes">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
              </Section>
            )}

            <Section icon={<Signature size={13} weight="duotone" />} title="Waiver">
              {booking.waiver ? (
                <>
                  <Row label="Status" value={<Badge variant={booking.waiver.status === "SIGNED" ? "green" : "amber"}>{toTitleCase(booking.waiver.status)}</Badge>} />
                  <Row label="Signer" value={booking.waiver.signerName} />
                  {booking.waiver.participants && Array.isArray(booking.waiver.participants) && (booking.waiver.participants as any[]).length > 0 && (
                    <Row label="Participants" value={
                      <div className="flex flex-wrap gap-1 justify-end">
                        {(booking.waiver.participants as any[]).map((p: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                            {p.name}{p.isMinor && <span className="text-amber-600">(minor)</span>}
                          </span>
                        ))}
                      </div>
                    } />
                  )}
                  {booking.waiver.signedAt && <Row label="Signed at" value={new Date(booking.waiver.signedAt).toLocaleString()} />}
                </>
              ) : (
                <p className="text-gray-400">No waiver on file.</p>
              )}
            </Section>

            <p className="text-center text-xs text-gray-400">
              Booking ID: <span className="font-mono">{booking.id}</span><br />
              Created {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        )}

        {booking && (
          <div className="border-t border-gray-100 px-6 py-4">
            <BookingActions
              bookingId={booking.id}
              status={booking.status}
              stripePaymentIntentId={booking.stripePaymentIntentId}
              onSuccess={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
}
