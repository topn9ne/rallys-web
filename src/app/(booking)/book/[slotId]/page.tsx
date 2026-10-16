export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSlotById, getAddonsForRideType, getPickupLocations } from "@/server/queries/slots";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { SlotBookingForm } from "@/components/booking/SlotBookingForm";

interface Props {
  params: Promise<{ slotId: string }>;
}

const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.12)]";

export default async function SlotDetailPage({ params }: Props) {
  const { slotId } = await params;
  const [slot, pickupLocations, session] = await Promise.all([
    getSlotById(slotId),
    getPickupLocations(),
    auth(),
  ]);

  if (!slot || slot.status === "FULL" || slot.status === "CANCELLED") {
    notFound();
  }

  const isLoggedInCustomer = !!session?.user?.id && session.user.userType === "customer";
  const customerPhone = isLoggedInCustomer
    ? (await prisma.customer.findUnique({ where: { id: session.user.id }, select: { phone: true } }))?.phone ?? undefined
    : undefined;

  const addons = await getAddonsForRideType(slot.rideType, slot.bikeId);

  const pricing = await prisma.pricingConfig.findFirst({
    where: { rideType: slot.rideType },
    orderBy: { effectiveFrom: "desc" },
  });

  const pricePerUnit = pricing?.baseAmountCents ?? (slot.rideType === "THEME" ? 3000 : 40000);
  const taxRatePercent = pricing?.taxRatePercent ?? 0;

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
            {slot.rideType === "THEME" ? slot.theme?.name : "Group Ride"}
          </h1>
          {/* When: BOOKING pill + uppercase date/time signifier */}
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-admin-accent/40 bg-admin-accent/15 px-2 py-[3px] font-mono text-[11px] uppercase tracking-[1px] text-admin-accent">
              Booking
            </span>
            <p className="text-sm font-semibold uppercase tracking-[0.5px] text-white sm:text-[15px]">
              {formatDate(slot.date)}
              <span className="mx-2 text-white/40">·</span>
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        {/* Slot summary */}
        <div className={`rounded-[14px] bg-white p-6 text-admin-ink ${CARD_SHADOW}`}>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-admin-text-sub">Ride type</dt>
              <dd className="font-semibold">
                {slot.rideType === "THEME" ? "Theme Ride (per seat)" : "Group Ride (full vehicle)"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-admin-text-sub">Bike</dt>
              <dd className="font-semibold">{slot.bike.name}</dd>
            </div>
            {slot.rideType === "THEME" && (
              <div className="flex justify-between">
                <dt className="text-admin-text-sub">Seats remaining</dt>
                <dd className="font-semibold text-green-600">
                  {slot.seatsTotal - slot.seatsBooked} of {slot.seatsTotal}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-admin-text-sub">Price</dt>
              <dd className="font-bold text-admin-primary">
                {formatCents(pricePerUnit)}
                {slot.rideType === "THEME" ? "/seat" : "/booking"}
              </dd>
            </div>
          </dl>
        </div>

        <SlotBookingForm
          slot={slot}
          addons={addons}
          pickupLocations={pickupLocations}
          pricePerUnitCents={pricePerUnit}
          isLoggedIn={isLoggedInCustomer}
          customerName={session?.user?.name ?? undefined}
          customerPhone={customerPhone}
          slotId={slotId}
          taxRatePercent={taxRatePercent}
        />
      </div>
    </>
  );
}
