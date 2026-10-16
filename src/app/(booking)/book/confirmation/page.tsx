export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.12)]";

export default async function ConfirmationPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/book");

  const booking = await prisma.booking.findUnique({
    where: { stripeSessionId: session_id },
    include: {
      slot: { include: { theme: true, bike: true } },
      waiver: true,
      bookingAddons: { include: { addon: true } },
    },
  });

  if (!booking) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(session_id);
      if (stripeSession.payment_status !== "paid") redirect("/book");
    } catch {
      redirect("/book");
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center text-white">
          <div className="mb-4 text-4xl">⏳</div>
          <h1 className="font-display text-[28px] tracking-[-0.5px]">Processing…</h1>
          <p className="mt-2 text-white/70">
            Your payment was received. Your booking will be confirmed shortly.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[2px] text-white/50">
            Refresh this page in a moment.
          </p>
        </div>
      </div>
    );
  }

  const waiverSigned = booking.waiver?.status === "SIGNED";

  return (
    <>
      {/* Success header */}
      <div className="text-white">
        <div className="mx-auto max-w-2xl px-4 py-10 text-center">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[2px] text-landing-accent">
            Confirmed
          </p>
          <h1 className="font-display text-[48px] leading-[0.95] tracking-[-1px] sm:text-[64px]">
            YOU&apos;RE <span className="text-landing-accent">BOOKED!</span>
          </h1>
          <p className="mt-3 text-sm text-white/80 sm:text-base">
            A confirmation email has been sent to you.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-4 pb-10">
        {/* Booking details */}
        <div className={`rounded-[14px] bg-white p-6 text-admin-ink ${CARD_SHADOW}`}>
          <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.8px]">
            Booking Details
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-admin-text-sub">Booking ID</dt>
              <dd className="truncate font-mono text-xs">{booking.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-admin-text-sub">Ride</dt>
              <dd className="font-semibold">
                {booking.slot.rideType === "THEME"
                  ? booking.slot.theme?.name ?? "Theme Ride"
                  : "Group Ride"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-right">
              <dt className="text-admin-text-sub">Date &amp; Time</dt>
              <dd>
                {formatDate(booking.slot.date)} ·{" "}
                {formatTime(booking.slot.startTime)} –{" "}
                {formatTime(booking.slot.endTime)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-right">
              <dt className="text-admin-text-sub">Pick-up</dt>
              <dd>{booking.pickupLocation}</dd>
            </div>
            {booking.bookingAddons.length > 0 && (
              <div className="flex justify-between gap-4 text-right">
                <dt className="text-admin-text-sub">Add-ons</dt>
                <dd>{booking.bookingAddons.map((ba) => ba.addon.name).join(", ")}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-admin-line pt-3 font-bold">
              <dt>Total Paid</dt>
              <dd className="text-admin-primary">
                {formatCents(booking.totalAmountCents)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Waiver CTA */}
        <div
          className={`rounded-[14px] p-6 ${CARD_SHADOW} ${
            waiverSigned ? "bg-green-50" : "bg-amber-50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-admin-ink">
                {waiverSigned ? "Waiver Signed ✓" : "Action Required — Sign Waiver"}
              </h2>
              <p className="mt-1.5 text-sm text-admin-text-sub">
                {waiverSigned
                  ? "Your liability waiver has been completed."
                  : "You must sign the liability waiver before your ride. The link was also sent to your email."}
              </p>
            </div>
            <Badge variant={waiverSigned ? "green" : "amber"}>
              {waiverSigned ? "Complete" : "Pending"}
            </Badge>
          </div>
          {!waiverSigned && (
            <div className="mt-4">
              <Link
                href={`/waiver/${booking.id}`}
                className="inline-flex items-center justify-center rounded-[10px] bg-landing-accent px-5 py-2.5 font-display text-[13px] uppercase tracking-[1px] text-white shadow-[0_6px_16px_rgba(255,46,136,0.35)] transition-[filter] hover:brightness-110"
              >
                Sign Waiver Now
              </Link>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/book"
            className="text-sm font-semibold text-white/80 hover:text-white"
          >
            Book another ride →
          </Link>
        </div>
      </div>
    </>
  );
}
