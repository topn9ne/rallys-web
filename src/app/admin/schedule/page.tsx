import { Card } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ManageHoursForm } from "@/components/admin/ManageHoursForm";
import { ScheduleView } from "@/components/admin/ScheduleView";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { generateVirtualSlots, getBookingWindow } from "@/server/services/virtualSlots";
import { getOperatingHoursAction } from "@/server/actions/operatingHours";

export default async function SchedulePage() {
  const { startDate, endDate } = getBookingWindow("admin");
  const [slots, hours] = await Promise.all([
    generateVirtualSlots({ startDate, endDate }),
    getOperatingHoursAction(),
  ]);

  const scheduleSlots = slots.map((s) => ({
    id: s.id,
    lane: s.lane,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    blockReason: s.blockReason ?? null,
    bookingsA: s.booking
      ? [{ id: s.booking.id, member: s.booking.memberName ? { name: s.booking.memberName } : null, guestName: s.booking.guestName }]
      : [],
  }));

  const hoursData = hours.map((h) => ({
    dayOfWeek: h.dayOfWeek,
    isOpen: h.isOpen,
    openTime: h.openTime,
    closeTime: h.closeTime,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Schedule"
        count={slots.length}
        icon={<CalendarBlank size={18} weight="regular" color="#ffffff" />}
      />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <ScheduleView slots={scheduleSlots} />
        </div>

        <Card>
          <ManageHoursForm initialHours={hoursData} />
        </Card>
      </div>
    </div>
  );
}
