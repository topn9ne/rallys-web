import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BookingFilters } from "@/components/admin/BookingFilters";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { Ticket } from "@phosphor-icons/react/dist/ssr";

interface Props {
  searchParams: Promise<{
    status?: string;
    rideType?: string;
    dateFrom?: string;
    dateTo?: string;
    q?: string;
    page?: string;
    sort?: string;
    dir?: string;
  }>;
}

const PAGE_SIZE = 25;

const orderByMap: Record<string, any> = {
  customer: { customer: { name: "asc" } },
  date: { slot: { date: "asc" } },
  status: { status: "asc" },
  total: { totalAmountCents: "asc" },
};

export default async function BookingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const skip = (page - 1) * PAGE_SIZE;
  const sortKey = params.sort ?? "date";
  const sortDir = params.dir === "asc" ? "asc" : "desc";

  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.rideType) where.slot = { rideType: params.rideType };
  if (params.dateFrom || params.dateTo) {
    const dateFilter: any = {};
    if (params.dateFrom) dateFilter.gte = new Date(params.dateFrom);
    if (params.dateTo) dateFilter.lte = new Date(params.dateTo);
    where.slot = { ...where.slot, date: dateFilter };
  }
  if (params.q) {
    where.customer = {
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { email: { contains: params.q, mode: "insensitive" } },
      ],
    };
  }

  // Build orderBy with direction
  const baseOrder = orderByMap[sortKey] ?? { slot: { date: "desc" } };
  const orderBy = applyDir(baseOrder, sortDir);

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        customer: true,
        slot: { include: { theme: true } },
        waiver: true,
      },
      orderBy,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.booking.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <AdminPageHeader
        title="Bookings"
        count={total}
        icon={<Ticket size={18} weight="regular" color="#ffffff" />}
      />

      <BookingFilters status={params.status} rideType={params.rideType} dateFrom={params.dateFrom} dateTo={params.dateTo} q={params.q} />

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <BookingsTable bookings={bookings} sort={sortKey} dir={sortDir} />
          </div>
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/bookings?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/bookings?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Recursively replace all "asc"/"desc" leaf values with the given direction
function applyDir(obj: any, dir: "asc" | "desc"): any {
  if (typeof obj === "string") return dir;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, applyDir(v, dir)]));
}
