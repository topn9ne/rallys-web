import { verifyShiftToken } from "@/lib/shiftToken";
import { recordShiftInterest } from "@/server/actions/staff";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime } from "@/lib/utils";

export default async function ShiftInterestPage({
  params,
  searchParams,
}: {
  params: Promise<{ slotId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slotId } = await params;
  const { token } = await searchParams;

  if (!token) {
    return <ErrorPage message="Missing token. Use the link from your email." />;
  }

  const payload = await verifyShiftToken(token);
  if (!payload || payload.slotId !== slotId) {
    return <ErrorPage message="This link is invalid or has expired." />;
  }

  const [slot, staff] = await Promise.all([
    prisma.rideSlot.findUnique({
      where: { id: slotId },
      include: { theme: true, bike: true },
    }),
    prisma.staff.findUnique({ where: { id: payload.staffId } }),
  ]);

  if (!slot || !staff) {
    return <ErrorPage message="Ride or staff member not found." />;
  }

  // Already assigned?
  const alreadyAssigned = await prisma.staffAssignment.findFirst({
    where: { staffId: payload.staffId, slotId },
  });

  if (alreadyAssigned) {
    return (
      <ConfirmPage
        staffName={staff.name}
        message="You're already assigned to this ride. See you there!"
        variant="blue"
      />
    );
  }

  // Record interest (idempotent) — pass token for server-side verification
  await recordShiftInterest(payload.staffId, slotId, token);

  const rideLabel = slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride";
  const rideDate = formatDate(slot.date);
  const rideTime = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-orange-500 px-6 py-5 text-center">
          <p className="text-3xl">🙋</p>
          <h1 className="mt-2 text-xl font-extrabold text-white">You're on the list!</h1>
        </div>
        <div className="px-6 py-5 space-y-3 text-center">
          <p className="text-gray-700 font-medium">Hey {staff.name}, we've got your response.</p>
          <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-left space-y-1">
            <p className="font-semibold text-orange-700">{rideLabel}</p>
            <p className="text-orange-600">{rideDate} · {rideTime}</p>
            <p className="text-orange-600">{slot.bike.name}</p>
          </div>
          <p className="text-sm text-gray-500">
            The owner will review availability and confirm your assignment. You'll be notified once confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-lg px-6 py-8 text-center">
        <p className="text-3xl">⚠️</p>
        <h1 className="mt-3 text-lg font-bold text-gray-900">Link Issue</h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

function ConfirmPage({ staffName, message, variant }: { staffName: string; message: string; variant: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-lg px-6 py-8 text-center">
        <p className="text-3xl">✅</p>
        <h1 className="mt-3 text-lg font-bold text-gray-900">Hey {staffName}!</h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
