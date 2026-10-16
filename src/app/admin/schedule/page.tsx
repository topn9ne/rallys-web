import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SlotFormTabs } from "@/components/admin/SlotFormTabs";
import { ScheduleView } from "@/components/admin/ScheduleView";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";

export default async function SchedulePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots = await prisma.cageSlot.findMany({
    where: { date: { gte: today } },
    include: {
      bookingsA: {
        where: { status: { in: ["CONFIRMED", "PENDING"] } },
        include: { member: { select: { name: true } } },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { lane: "asc" }],
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader
        title="Schedule"
        count={slots.length}
        icon={<CalendarBlank size={18} weight="regular" color="#ffffff" />}
      />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <ScheduleView slots={slots} />
        </div>

        <Card>
          <SlotFormTabs />
        </Card>
      </div>
    </div>
  );
}
