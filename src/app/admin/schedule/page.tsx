import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SlotFormTabs } from "@/components/admin/SlotFormTabs";
import { ScheduleView } from "@/components/admin/ScheduleView";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";

export default async function SchedulePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [bikes, themes, slots] = await Promise.all([
    prisma.bike.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.theme.findMany({ orderBy: { name: "asc" } }),
    prisma.rideSlot.findMany({
      where: { date: { gte: today } },
      include: { bike: true, theme: true, staffAssignments: { include: { staff: true } }, _count: { select: { bookings: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 50,
    }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Schedule"
        count={slots.length}
        icon={<CalendarBlank size={18} weight="regular" color="#ffffff" />}
      />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Upcoming slots */}
        <div className="lg:col-span-2">
          <ScheduleView slots={slots} />
        </div>

        {/* Create ride */}
        <Card>
          <SlotFormTabs bikes={bikes} themes={themes} />
        </Card>
      </div>
    </div>
  );
}
