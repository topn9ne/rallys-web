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
      slot: { include: { theme: true } },
      waiver: true,
    },
  });

  if (!booking || booking.status === "CANCELLED") notFound();

  if (booking.waiver?.status === "SIGNED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">Waiver Already Signed</h1>
          <p className="mt-2 text-gray-500">
            Your waiver was signed on{" "}
            {booking.waiver.signedAt?.toLocaleDateString()}. You're all set!
          </p>
        </div>
      </div>
    );
  }

  const waiverText = booking.waiver?.agreementTextSnapshot ?? "";

  return (
    <div className="page-wrapper">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-white">
          <h1 className="text-2xl font-bold drop-shadow">Liability Waiver</h1>
          <p className="mt-1 text-white/80 drop-shadow text-sm">
            {booking.slot.rideType === "THEME"
              ? booking.slot.theme?.name
              : "Group Ride"}{" "}
            · {formatDate(booking.slot.date)} at{" "}
            {formatTime(booking.slot.startTime)}
          </p>
        </div>

        {/* Waiver text */}
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
              Waiver text not yet configured. Please set up a waiver template in the admin panel before going live.
            </p>
          )}
        </div>

        {/* Signature form */}
        <WaiverForm bookingId={bookingId} />
      </div>
    </div>
  );
}
