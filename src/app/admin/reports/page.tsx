import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartBar } from "@phosphor-icons/react/dist/ssr";
import { getActivePricing } from "@/server/queries/slots";

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const from = params.from ? new Date(params.from) : defaultFrom;
  const to = params.to ? new Date(params.to + "T23:59:59") : defaultTo;

  const [bookings, activePricing, memberCounts] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: from, lte: to },
      },
      include: {
        member: { select: { name: true, subscriptionStatus: true } },
        slotA: { select: { lane: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getActivePricing(),
    prisma.member.groupBy({
      by: ["tier"],
      where: { subscriptionStatus: "ACTIVE" },
      _count: true,
    }),
  ]);

  const totalRevenue = bookings.reduce((s: number, b: any) => s + b.totalAmountCents, 0);
  const singleLane = bookings.filter((b: any) => b.bookingType === "SINGLE_LANE");
  const bothLanes = bookings.filter((b: any) => b.bookingType === "BOTH_LANES");
  const memberBookings = bookings.filter((b: any) => b.memberId);
  const dropinBookings = bookings.filter((b: any) => !b.memberId);
  const singleRevenue = singleLane.reduce((s: number, b: any) => s + b.totalAmountCents, 0);
  const bothRevenue = bothLanes.reduce((s: number, b: any) => s + b.totalAmountCents, 0);
  const memberRevenue = memberBookings.reduce((s: number, b: any) => s + b.totalAmountCents, 0);
  const dropinRevenue = dropinBookings.reduce((s: number, b: any) => s + b.totalAmountCents, 0);

  const familyCount = memberCounts.find((m) => m.tier === "FAMILY")?._count ?? 0;
  const teamCount = memberCounts.find((m) => m.tier === "TEAM")?._count ?? 0;
  const familyPrice = activePricing["FAMILY"]?.amountCents ?? 5000;
  const teamPriceMo = activePricing["TEAM"]?.amountCents ?? 7500;
  const mrr = familyCount * familyPrice + teamCount * teamPriceMo;
  const totalActiveMembers = familyCount + teamCount;

  const csvUrl = `/api/reports/export?from=${from.toISOString().split("T")[0]}&to=${to.toISOString().split("T")[0]}`;

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        count={bookings.length}
        icon={<ChartBar size={18} weight="regular" color="#ffffff" />}
        action={
          <a
            href={csvUrl}
            className="inline-flex items-center gap-2 rounded-[10px] bg-admin-primary px-5 py-2.5 font-display text-[13px] uppercase tracking-[1px] text-white shadow-[0_1px_2px_rgba(11,18,50,0.18)] transition-[filter] hover:brightness-110"
          >
            Export CSV
          </a>
        }
      />

      <form method="GET" className="mb-6 flex items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="pl-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">From</span>
          <input
            name="from"
            type="date"
            defaultValue={from.toISOString().split("T")[0]}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="pl-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">To</span>
          <input
            name="to"
            type="date"
            defaultValue={to.toISOString().split("T")[0]}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-brand-blue px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 transition-opacity"
        >
          Apply
        </button>
      </form>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Drop-in Revenue", value: formatCents(totalRevenue) },
          { label: "Subscription MRR", value: formatCents(mrr) },
          { label: "Active Members", value: totalActiveMembers.toString() },
          { label: "Total Bookings", value: bookings.length.toString() },
          { label: "Member Bookings", value: memberBookings.length.toString() },
          { label: "Drop-in Bookings", value: dropinBookings.length.toString() },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">By Booking Type</h2>
          </CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium text-right">Bookings</th>
                  <th className="pb-2 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 font-medium">Single Lane</td>
                  <td className="py-2 text-right">{singleLane.length}</td>
                  <td className="py-2 text-right font-semibold">{formatCents(singleRevenue)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Both Lanes</td>
                  <td className="py-2 text-right">{bothLanes.length}</td>
                  <td className="py-2 text-right font-semibold">{formatCents(bothRevenue)}</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Member vs Drop-in</h2>
          </CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium text-right">Bookings</th>
                  <th className="pb-2 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 font-medium">Members</td>
                  <td className="py-2 text-right">{memberBookings.length}</td>
                  <td className="py-2 text-right font-semibold">{formatCents(memberRevenue)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Drop-ins</td>
                  <td className="py-2 text-right">{dropinBookings.length}</td>
                  <td className="py-2 text-right font-semibold">{formatCents(dropinRevenue)}</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Subscription Revenue</h2>
          </CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2 font-medium">Tier</th>
                  <th className="pb-2 font-medium text-right">Members</th>
                  <th className="pb-2 font-medium text-right">Rate</th>
                  <th className="pb-2 font-medium text-right">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 font-medium">Family</td>
                  <td className="py-2 text-right">{familyCount}</td>
                  <td className="py-2 text-right">{formatCents(familyPrice)}/mo</td>
                  <td className="py-2 text-right font-semibold">{formatCents(familyCount * familyPrice)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Team</td>
                  <td className="py-2 text-right">{teamCount}</td>
                  <td className="py-2 text-right">{formatCents(teamPriceMo)}/mo</td>
                  <td className="py-2 text-right font-semibold">{formatCents(teamCount * teamPriceMo)}</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-2">Total MRR</td>
                  <td className="py-2 text-right">{totalActiveMembers}</td>
                  <td className="py-2" />
                  <td className="py-2 text-right">{formatCents(mrr)}</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
