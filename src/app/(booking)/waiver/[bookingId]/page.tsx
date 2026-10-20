export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime } from "@/lib/utils";
import { WaiverForm } from "@/components/booking/WaiverForm";

interface Props {
  params: Promise<{ bookingId: string }>;
}

export default async function WaiverPage({ params }: Props) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slotA: true,
      waiver: true,
    },
  });

  if (!booking || booking.status === "CANCELLED") notFound();

  if (booking.waiver?.status === "SIGNED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl">&#10003;</div>
          <h1 className="text-2xl font-bold text-gray-900">Waiver Already Signed</h1>
          <p className="mt-2 text-gray-500">
            Your waiver was signed on{" "}
            {booking.waiver.signedAt?.toLocaleDateString()}. You&apos;re all set!
          </p>
        </div>
      </div>
    );
  }

  const waiverText = booking.waiver?.agreementTextSnapshot ?? "";
  const lane = booking.bookingType === "BOTH_LANES"
    ? "Both Lanes"
    : `Lane ${booking.slotA.lane}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Participation Waiver</h1>
          <p className="mt-1 text-gray-500 text-sm">
            {lane} &middot; {formatDate(booking.slotA.date)} at{" "}
            {formatTime(booking.slotA.startTime)}
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">
            Participant Waiver and Release of Liability
          </h2>
          {waiverText ? (
            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
              {waiverText}
            </div>
          ) : (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
              Waiver text not yet configured. Please set up a waiver template in
              the admin panel before going live.
            </p>
          )}
        </div>

        <WaiverForm bookingId={bookingId} />
      </div>
    </div>
  );
}
