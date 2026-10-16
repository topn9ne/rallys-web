export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface Props {
  searchParams: Promise<{ session_id?: string; bookingId?: string }>;
}

const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.12)]";

export default async function ConfirmationPage({ searchParams }: Props) {
  const { session_id, bookingId } = await searchParams;

  let booking;

  if (bookingId) {
    booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slotA: true,
        slotB: true,
        waiver: true,
      },
    });
  } else if (session_id) {
    booking = await prisma.booking.findFirst({
      where: { stripeSessionId: session_id },
      include: {
        slotA: true,
        slotB: true,
        waiver: true,
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
            <div className="mb-4 text-4xl">&#8987;</div>
            <h1 className="font-display text-[28px] tracking-[-0.5px]">Processing...</h1>
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
  }

  if (!booking) redirect("/book");

  const isMemberBooking = booking.totalAmountCents === 0;
  const waiverSigned = booking.waiver?.status === "SIGNED";

  return (
    <>
      <div className="text-white">
        <div className="mx-auto max-w-2xl px-4 py-10 text-center">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[2px] text-landing-accent">
            Confirmed
          </p>
          <h1 className="font-display text-[48px] leading-[0.95] tracking-[-1px] sm:text-[64px]">
            YOU&apos;RE <span className="text-landing-accent">BOOKED!</span>
          </h1>
          <p className="mt-3 text-sm text-white/80 sm:text-base">
            Your door code will be texted to you before your session.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-4 pb-10">
        <div className={`rounded-[14px] bg-white p-6 text-gray-900 ${CARD_SHADOW}`}>
          <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.8px]">
            Booking Details
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Booking ID</dt>
              <dd className="truncate font-mono text-xs">{booking.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Session</dt>
              <dd className="font-semibold">
                {booking.bookingType === "BOTH_LANES"
                  ? "Both Lanes (team)"
                  : `Lane ${booking.slotA.lane}`}
              </dd>
            </div>
            <div className="flex justify-between gap-4 text-right">
              <dt className="text-gray-500">Date &amp; Time</dt>
              <dd>
                {formatDate(booking.slotA.date)} &middot;{" "}
                {formatTime(booking.slotA.startTime)} &ndash;{" "}
                {formatTime(booking.slotA.endTime)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Duration</dt>
              <dd>1 hour</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 font-bold">
              <dt>
                {isMemberBooking ? "Membership" : "Total Paid"}
              </dt>
              <dd className="text-brand-blue">
                {isMemberBooking ? "Included" : formatCents(booking.totalAmountCents)}
              </dd>
            </div>
          </dl>
        </div>

        <div
          className={`rounded-[14px] p-6 ${CARD_SHADOW} ${
            waiverSigned ? "bg-green-50" : "bg-amber-50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] text-gray-900">
                {waiverSigned ? "Waiver Signed" : "Action Required — Sign Waiver"}
              </h2>
              <p className="mt-1.5 text-sm text-gray-600">
                {waiverSigned
                  ? "Your liability waiver has been completed."
                  : "You must sign the liability waiver before your session."}
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
                className="inline-flex items-center justify-center rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
              >
                Sign Waiver Now
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-[14px] bg-white/10 p-6 text-white">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.8px] mb-3">
            What to Expect
          </h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>You'll receive a text with your door code ~5 min before your session.</li>
            <li>Enter the code on the keypad at the front door.</li>
            <li>Set up the pitching machine to your preferred speed and height.</li>
            <li>Leave the cage as you found it when your time is up.</li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/book"
            className="text-sm font-semibold text-white/80 hover:text-white"
          >
            Book another session &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
