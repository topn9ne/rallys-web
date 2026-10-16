import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { OperatorSlotCard } from "@/components/operator/OperatorSlotCard";
import { auth } from "@/lib/auth";

export const revalidate = 60; // Refresh every minute

export default async function OperatorDashboard() {
  const session = await auth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const slots = await prisma.rideSlot.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
      status: { not: "CANCELLED" },
    },
    include: {
      bike: true,
      theme: true,
      staffAssignments: { include: { staff: true } },
      bookings: {
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        include: { waiver: true, customer: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { startTime: "asc" },
  });

  const now = new Date();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Today's Schedule —{" "}
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h1>
        <p className="mt-1 text-gray-400 text-sm">{slots.length} ride{slots.length !== 1 ? "s" : ""} scheduled</p>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-12 text-center">
          <p className="text-gray-400">No rides scheduled for today.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => (
            <OperatorSlotCard key={slot.id} slot={slot} role={session?.user.role ?? "OPERATOR"} />
          ))}
        </div>
      )}
    </div>
  );
}
