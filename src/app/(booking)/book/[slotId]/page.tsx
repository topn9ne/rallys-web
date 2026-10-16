export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSlotById, getActivePricing } from "@/server/queries/slots";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { SlotBookingForm } from "@/components/booking/SlotBookingForm";
import type { BookingType } from "@prisma/client";

interface Props {
  params: Promise<{ slotId: string }>;
  searchParams: Promise<{ type?: string; slotB?: string }>;
}

export default async function SlotDetailPage({ params, searchParams }: Props) {
  const { slotId } = await params;
  const { type, slotB: slotBId } = await searchParams;

  const bookingType: BookingType =
    type === "BOTH_LANES" ? "BOTH_LANES" : "SINGLE_LANE";

  const [slotA, user, pricing] = await Promise.all([
    getSlotById(slotId),
    getUser(),
    getActivePricing(),
  ]);

  if (!slotA || slotA.status !== "AVAILABLE") notFound();

  let slotB = null;
  if (bookingType === "BOTH_LANES" && slotBId) {
    slotB = await getSlotById(slotBId);
    if (!slotB || slotB.status !== "AVAILABLE") notFound();
  }

  const isLoggedIn = !!user;
  let isMember = false;
  let memberName: string | undefined;
  let memberPhone: string | undefined;

  if (isLoggedIn) {
    const member = await prisma.member.findUnique({
      where: { id: user.id },
      select: { name: true, phone: true, subscriptionStatus: true },
    });
    if (member) {
      isMember = member.subscriptionStatus === "ACTIVE";
      memberName = member.name ?? user.user_metadata?.name ?? undefined;
      memberPhone = member.phone ?? undefined;
    }
  }

  const pricingTier = bookingType === "BOTH_LANES"
    ? (isMember ? "TEAM" : "DROPIN_BOTH")
    : (isMember ? "FAMILY" : "DROPIN_SINGLE");
  const activePrice = pricing[pricingTier];
  const priceCents = activePrice?.amountCents ?? 0;
  const taxRatePercent = activePrice?.taxRatePercent ?? 7.0;

  return (
    <>
      <header className="text-white">
        <div className="mx-auto max-w-2xl px-4 pb-4 pt-8">
          <a
            href="/book"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/[0.14]"
          >
            <ArrowLeft size={13} weight="bold" />
            Back to Calendar
          </a>
          <h1 className="mt-4 font-display text-[32px] leading-none tracking-[-0.5px]">
            {bookingType === "BOTH_LANES" ? "Team Session" : `Lane ${slotA.lane}`}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-admin-accent/40 bg-admin-accent/15 px-2 py-[3px] font-mono text-[11px] uppercase tracking-[1px] text-admin-accent">
              Booking
            </span>
            <p className="text-sm font-semibold uppercase tracking-[0.5px] text-white sm:text-[15px]">
              {formatDate(slotA.date)}
              <span className="mx-2 text-white/40">&middot;</span>
              {formatTime(slotA.startTime)} &ndash; {formatTime(slotA.endTime)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <div className="rounded-[14px] bg-white p-6 text-gray-900 shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.12)]">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Session type</dt>
              <dd className="font-semibold">
                {bookingType === "BOTH_LANES" ? "Both Lanes (team)" : "Single Lane"}
              </dd>
            </div>
            {bookingType === "SINGLE_LANE" && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Lane</dt>
                <dd className="font-semibold">Lane {slotA.lane}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Duration</dt>
              <dd className="font-semibold">30 minutes</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Price</dt>
              <dd className="font-bold text-brand-blue">
                {isMember ? "Included with membership" : formatCents(priceCents)}
              </dd>
            </div>
          </dl>
        </div>

        <SlotBookingForm
          slotA={slotA}
          slotB={slotB ?? undefined}
          bookingType={bookingType}
          priceCents={isMember ? 0 : priceCents}
          taxRatePercent={isMember ? 0 : taxRatePercent}
          isLoggedIn={isLoggedIn}
          isMember={isMember}
          memberName={memberName ?? user?.email}
          memberPhone={memberPhone}
        />
      </div>
    </>
  );
}
