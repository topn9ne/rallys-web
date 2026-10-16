import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";

const statusVariant: Record<string, "green" | "gray" | "red" | "amber"> = {
  CONFIRMED: "green",
  COMPLETED: "gray",
  CANCELLED: "red",
  REFUNDED: "red",
  PENDING: "amber",
};

const statusLabel: Record<string, string> = {
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PENDING: "Pending",
};

export default async function AccountBookingsPage() {
  const session = await auth();
  const customerId = session!.user.id;

  const bookings = await prisma.booking.findMany({
    where: {
      customerId,
      status: { in: ["CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"] },
    },
    include: {
      slot: { include: { theme: true, bike: true } },
      waiver: { select: { id: true, signedAt: true } },
      bookingAddons: { select: { addonId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.slot.date) >= today
  );
  const past = bookings.filter(
    (b) => b.status !== "CONFIRMED" || new Date(b.slot.date) < today
  );

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-gray-900">No bookings yet</p>
        <p className="mt-1 text-sm text-gray-500">Ready to ride?</p>
        <a
          href="/book"
          className="mt-4 inline-block rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Book a Ride
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">Upcoming</h2>
          <ul className="space-y-3">
            {upcoming.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">Past</h2>
          <ul className="space-y-3">
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>
        </section>
      )}

      <div className="text-center">
        <a
          href="/book"
          className="inline-block rounded-lg border border-brand-blue px-5 py-2.5 text-sm font-semibold text-brand-blue hover:bg-blue-50 transition-colors"
        >
          Book another ride
        </a>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
}: {
  booking: {
    id: string;
    seats: number;
    status: string;
    totalAmountCents: number;
    slot: {
      date: Date;
      startTime: Date;
      endTime: Date;
      rideType: string;
      theme: { name: string } | null;
      bike: { name: string };
    };
    waiver: { id: string; signedAt: Date | null } | null;
    bookingAddons: { addonId: string }[];
  };
}) {
  const rideName =
    booking.slot.rideType === "THEME"
      ? booking.slot.theme?.name ?? "Theme Ride"
      : "Group Ride";

  const waiverSigned = !!booking.waiver?.signedAt;
  const showWaiver = booking.status === "CONFIRMED";

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{rideName}</p>
            <Badge variant={statusVariant[booking.status] ?? "gray"}>
              {statusLabel[booking.status] ?? booking.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {formatDate(booking.slot.date)} · {formatTime(booking.slot.startTime)}–{formatTime(booking.slot.endTime)}
          </p>
          <p className="text-sm text-gray-500">{booking.slot.bike.name}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900 shrink-0">
          {formatCents(booking.totalAmountCents)}
        </p>
      </div>

      {showWaiver && (
        <div className="mt-3 border-t border-gray-100 pt-3 flex items-center justify-between gap-3">
          <div>
            {waiverSigned ? (
              <Badge variant="green">Waiver signed</Badge>
            ) : (
              <a
                href={`/waiver/${booking.id}`}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                Sign waiver →
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/api/receipt/${booking.id}`}
              target="_blank"
              className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
            >
              Receipt
            </a>
            <CancelBookingButton bookingId={booking.id} />
          </div>
        </div>
      )}

      {(booking.status === "COMPLETED" || booking.status === "CANCELLED" || booking.status === "REFUNDED") && (
        <div className="mt-3 border-t border-gray-100 pt-3 flex items-center gap-4">
          <a
            href={`/book?seats=${booking.seats}${booking.bookingAddons.length ? `&addons=${booking.bookingAddons.map((a) => a.addonId).join(",")}` : ""}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
          >
            Book again →
          </a>
          <a
            href={`/api/receipt/${booking.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:underline"
          >
            View receipt
          </a>
        </div>
      )}
    </li>
  );
}
