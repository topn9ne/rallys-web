import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChartBar } from "@phosphor-icons/react/dist/ssr";

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

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED"] },
      createdAt: { gte: from, lte: to },
    },
    include: {
      slot: { include: { theme: true } },
      bookingAddons: { include: { addon: true } },
      discountCode: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute stats
  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmountCents, 0);
  const themeBookings = bookings.filter((b) => b.bookingType === "THEME_SEAT");
  const generalBookings = bookings.filter((b) => b.bookingType === "GENERAL_FULL");
  const themeRevenue = themeBookings.reduce((s, b) => s + b.totalAmountCents, 0);
  const generalRevenue = generalBookings.reduce((s, b) => s + b.totalAmountCents, 0);
  const addonRevenue = bookings.reduce((s, b) => s + b.addonsAmountCents, 0);
  const discountTotal = bookings.reduce((s, b) => s + b.discountAmountCents, 0);
  const totalSeats = themeBookings.reduce((s, b) => s + b.seats, 0);

  // Per-addon breakdown
  const addonMap = new Map<string, { name: string; units: number; revenue: number }>();
  for (const b of bookings) {
    for (const ba of b.bookingAddons) {
      const existing = addonMap.get(ba.addonId) ?? {
        name: ba.addon.name,
        units: 0,
        revenue: 0,
      };
      existing.units += 1;
      existing.revenue += ba.priceCentsAtPurchase;
      addonMap.set(ba.addonId, existing);
    }
  }

  // Discount code breakdown
  const discountMap = new Map<string, { code: string; uses: number; savings: number }>();
  for (const b of bookings) {
    if (b.discountCode) {
      const existing = discountMap.get(b.discountCode.id) ?? {
        code: b.discountCode.code,
        uses: 0,
        savings: 0,
      };
      existing.uses += 1;
      existing.savings += b.discountAmountCents;
      discountMap.set(b.discountCode.id, existing);
    }
  }

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

      {/* Date range filter */}
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

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: formatCents(totalRevenue) },
          { label: "Total Bookings", value: bookings.length.toString() },
          { label: "Theme Revenue", value: formatCents(themeRevenue) },
          { label: "General Revenue", value: formatCents(generalRevenue) },
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
        {/* Ride type breakdown */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">By Ride Type</h2>
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
                  <td className="py-2 font-medium">Theme Rides</td>
                  <td className="py-2 text-right">{themeBookings.length} ({totalSeats} seats)</td>
                  <td className="py-2 text-right font-semibold">{formatCents(themeRevenue)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Group Rides</td>
                  <td className="py-2 text-right">{generalBookings.length}</td>
                  <td className="py-2 text-right font-semibold">{formatCents(generalRevenue)}</td>
                </tr>
                <tr className="border-t-2 border-gray-200">
                  <td className="py-2 font-bold">Add-ons</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right font-semibold text-brand-orange">{formatCents(addonRevenue)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">Discounts Given</td>
                  <td className="py-2 text-right">{discountMap.size} codes</td>
                  <td className="py-2 text-right text-red-500">−{formatCents(discountTotal)}</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Add-on breakdown */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Add-on Performance</h2>
          </CardHeader>
          <CardBody>
            {addonMap.size === 0 ? (
              <p className="text-sm text-gray-400">No add-ons sold in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2 font-medium">Add-on</th>
                    <th className="pb-2 font-medium text-right">Units</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from(addonMap.values()).map((row) => (
                    <tr key={row.name}>
                      <td className="py-2">{row.name}</td>
                      <td className="py-2 text-right">{row.units}</td>
                      <td className="py-2 text-right font-semibold">{formatCents(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        {/* Discount code usage */}
        {discountMap.size > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Discount Code Usage</h2>
            </CardHeader>
            <CardBody>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 font-medium text-right">Uses</th>
                    <th className="pb-2 font-medium text-right">Total Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from(discountMap.values()).map((row) => (
                    <tr key={row.code}>
                      <td className="py-2 font-mono font-semibold">{row.code}</td>
                      <td className="py-2 text-right">{row.uses}</td>
                      <td className="py-2 text-right text-red-500">−{formatCents(row.savings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
