"use client";

import { useEffect, useState, useTransition } from "react";
import { getBookingDetail } from "@/server/actions/adminBookings";
import { getSlotStaff, assignStaffToSlot, unassignStaffFromSlot, broadcastShiftOpen } from "@/server/actions/staff";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BookingActions } from "@/components/admin/BookingActions";
import {
  X,
  User,
  Train,
  CalendarBlank,
  MapPin,
  CurrencyDollar,
  Signature,
  ShoppingBag,
  Tag,
  UserPlus,
  Users,
  UserMinus,
  Plus,
  BellRinging,
  Check,
  NoteBlank,
} from "@phosphor-icons/react/dist/ssr";

type BookingDetail = NonNullable<Awaited<ReturnType<typeof getBookingDetail>>>;
type SlotStaffData = Awaited<ReturnType<typeof getSlotStaff>>;

const roleVariant: Record<string, "blue" | "green" | "purple"> = {
  ADMIN: "blue",
  OPERATOR: "green",
  DRIVER: "purple",
};

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red"> = {
  PENDING: "amber",
  CONFIRMED: "green",
  COMPLETED: "gray",
  CANCELLED: "gray",
  REFUNDED: "red",
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
  const [staffData, setStaffData] = useState<SlotStaffData | null>(null);
  const [staffPending, startStaffTransition] = useTransition();
  const [broadcastPending, startBroadcastTransition] = useTransition();
  const [broadcastDone, setBroadcastDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBookingDetail(bookingId).then((data) => {
      setBooking(data);
      setLoading(false);
      if (data?.slotId) getSlotStaff(data.slotId).then(setStaffData);
    });
  }, [bookingId]);

  function reloadStaff(slotId: string) {
    getSlotStaff(slotId).then(setStaffData);
  }

  function handleAssign(slotId: string, staffId: string) {
    startStaffTransition(async () => {
      await assignStaffToSlot(slotId, staffId);
      reloadStaff(slotId);
    });
  }

  function handleUnassign(slotId: string, staffId: string) {
    startStaffTransition(async () => {
      await unassignStaffFromSlot(slotId, staffId);
      reloadStaff(slotId);
    });
  }

  function handleBroadcast(slotId: string) {
    startBroadcastTransition(async () => {
      await broadcastShiftOpen(slotId);
      setBroadcastDone(true);
      reloadStaff(slotId);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl overflow-hidden">
        {/* Header */}
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
            {/* Customer */}
            <Section icon={<User size={13} weight="duotone" />} title="Customer">
              <Row label="Name" value={booking.customer.name} />
              <Row label="Email" value={booking.customer.email} />
              <Row label="Phone" value={booking.customer.phone || <span className="text-gray-400 italic">Not on file</span>} />
            </Section>

            {/* Ride */}
            <Section icon={<Train size={13} weight="duotone" />} title="Ride">
              <Row label="Type" value={booking.slot.rideType === "THEME" ? booking.slot.theme?.name ?? "Theme Ride" : "Group Ride"} />
              <Row label="Vehicle" value={booking.slot.bike.name} />
              <Row label="Date" value={formatDate(booking.slot.date)} />
              <Row label="Time" value={`${formatTime(booking.slot.startTime)} – ${formatTime(booking.slot.endTime)}`} />
              <Row label="Booking type" value={booking.bookingType === "THEME_SEAT" ? `${booking.seats} seat${booking.seats > 1 ? "s" : ""}` : "Full vehicle"} />
              {booking.passengerCount != null && <Row label="Passengers" value={booking.passengerCount} />}
            </Section>

            {/* Staff */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-orange-400">
                  <Users size={13} weight="duotone" color="#fb923c" />
                  Staff
                </h3>
                <button
                  disabled={broadcastPending || broadcastDone}
                  onClick={() => booking && handleBroadcast(booking.slotId)}
                  className="flex items-center gap-1 rounded-lg border border-orange-200 bg-white px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {broadcastDone ? <Check size={11} weight="bold" /> : <BellRinging size={11} weight="duotone" />}
                  {broadcastPending ? "Sending…" : broadcastDone ? "Sent!" : "Notify Staff"}
                </button>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm space-y-2">
                {/* Assigned */}
                {staffData && staffData.assignments.length > 0 ? (
                  <ul className="space-y-1.5">
                    {staffData.assignments.map((a) => (
                      <li key={a.staffId} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-gray-900 truncate">{a.staff.name}</span>
                          <Badge variant={roleVariant[a.staff.role] ?? "gray"} className="text-[10px] shrink-0">{a.staff.role}</Badge>
                        </div>
                        <button
                          disabled={staffPending}
                          onClick={() => handleUnassign(booking.slotId, a.staffId)}
                          className="shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          <UserMinus size={12} weight="duotone" />
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-xs">No staff assigned yet.</p>
                )}
                {/* Add */}
                {staffData && staffData.allStaff.filter((s) => !staffData.assignments.find((a) => a.staffId === s.id)).length > 0 && (
                  <div className="border-t border-orange-200 pt-2 space-y-1">
                    {staffData.allStaff
                      .filter((s) => !staffData.assignments.find((a) => a.staffId === s.id))
                      .map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-gray-600 truncate">{s.name}</span>
                            <Badge variant={roleVariant[s.role] ?? "gray"} className="text-[10px] shrink-0">{s.role}</Badge>
                          </div>
                          <button
                            disabled={staffPending}
                            onClick={() => handleAssign(booking.slotId, s.id)}
                            className="shrink-0 flex items-center gap-1 rounded-md border border-orange-200 bg-white px-2 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white disabled:opacity-50 transition-colors"
                          >
                            <Plus size={12} weight="bold" />
                            Assign
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* Interested staff */}
                {staffData && staffData.interests.length > 0 && (
                  <div className="border-t border-orange-200 pt-2">
                    <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-orange-400">
                      Raised Hand ({staffData.interests.length})
                    </p>
                    <div className="space-y-1">
                      {staffData.interests.map((i) => (
                        <div key={i.staffId} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-gray-800 truncate">{i.staff.name}</span>
                            <Badge variant={roleVariant[i.staff.role] ?? "gray"} className="text-[10px] shrink-0">{i.staff.role}</Badge>
                          </div>
                          <button
                            disabled={staffPending}
                            onClick={() => handleAssign(booking.slotId, i.staffId)}
                            className="shrink-0 flex items-center gap-1 rounded-md border border-orange-400 bg-orange-500 px-2 py-1 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                          >
                            <Check size={11} weight="bold" />
                            Confirm
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup */}
            <Section icon={<MapPin size={13} weight="duotone" />} title="Pickup">
              <Row label="Location" value={booking.pickupLocation} />
              {booking.pickupAddress && <Row label="Address" value={booking.pickupAddress} />}
            </Section>

            {/* Payment */}
            <Section icon={<CurrencyDollar size={13} weight="duotone" />} title="Payment">
              <Row label="Base" value={formatCents(booking.baseAmountCents)} />
              {booking.addonsAmountCents > 0 && <Row label="Add-ons" value={formatCents(booking.addonsAmountCents)} />}
              {booking.discountAmountCents > 0 && <Row label="Discount" value={`–${formatCents(booking.discountAmountCents)}`} />}
              {booking.taxAmountCents > 0 && <Row label="Tax" value={formatCents(booking.taxAmountCents)} />}
              <div className="border-t border-gray-200 pt-1.5">
                <Row label="Total" value={<span className="text-base font-extrabold text-gray-900">{formatCents(booking.totalAmountCents)}</span>} />
              </div>
              {booking.stripePaymentIntentId && (
                <Row label="Stripe PI" value={<span className="font-mono text-xs text-gray-500">{booking.stripePaymentIntentId}</span>} />
              )}
            </Section>

            {/* Discount Code */}
            {booking.discountCode && (
              <Section icon={<Tag size={13} weight="duotone" />} title="Discount Code">
                <Row label="Code" value={<span className="font-mono">{booking.discountCode.code}</span>} />
                <Row label="Value" value={booking.discountCode.type === "PERCENT_OFF" ? `${booking.discountCode.value}% off` : formatCents(booking.discountCode.value)} />
              </Section>
            )}

            {/* Notes */}
            {booking.notes && (
              <Section icon={<NoteBlank size={13} weight="duotone" />} title="Special Requests">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
              </Section>
            )}

            {/* Add-ons */}
            {booking.bookingAddons.length > 0 && (
              <Section icon={<ShoppingBag size={13} weight="duotone" />} title="Add-ons">
                {booking.bookingAddons.map((a) => (
                  <Row key={a.id} label={a.addon.name} value={formatCents(a.priceCentsAtPurchase)} />
                ))}
              </Section>
            )}


            {/* Manual booking badge */}
            {booking.isManual && (
              <Section icon={<UserPlus size={13} weight="duotone" />} title="Manual Booking">
                <Row label="Entered by" value="Admin" />
                {booking.paymentReference && (
                  <Row label="Payment ref" value={<span className="font-mono text-xs">{booking.paymentReference}</span>} />
                )}
                {booking.waiverSignedOffline && (
                  <Row label="Waiver" value={<span className="text-green-700 font-semibold">Signed offline</span>} />
                )}
              </Section>
            )}

            {/* Waiver */}
            <Section icon={<Signature size={13} weight="duotone" />} title="Waiver">
              {booking.waiver ? (
                <>
                  <Row label="Status" value={<Badge variant={booking.waiver.status === "SIGNED" ? "green" : "amber"}>{toTitleCase(booking.waiver.status)}</Badge>} />
                  <Row label="Signer" value={booking.waiver.signerName} />
                  {booking.waiver.signerDob && <Row label="Date of birth" value={booking.waiver.signerDob} />}
                  {booking.waiver.signedAt && <Row label="Signed at" value={new Date(booking.waiver.signedAt).toLocaleString()} />}
                </>
              ) : (
                <p className="text-gray-400">No waiver on file.</p>
              )}
            </Section>

            {/* Booking meta */}
            <p className="text-center text-xs text-gray-400">
              Booking ID: <span className="font-mono">{booking.id}</span><br />
              Created {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Footer actions */}
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
