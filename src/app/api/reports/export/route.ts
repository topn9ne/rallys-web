import { NextRequest, NextResponse } from "next/server";
import { getUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDate, formatTime } from "@/lib/utils";

function laneLabel(bookingType: string, slotA: { lane: string }): string {
  if (bookingType === "BOTH_LANES") return "Both Lanes (A & B)";
  return `Lane ${slotA.lane}`;
}

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user || !(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")! + "T23:59:59") : undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED", "CANCELLED"] },
      ...(from || to ? { createdAt: { gte: from, lte: to } } : {}),
    },
    include: {
      member: true,
      slotA: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Booking ID",
    "Status",
    "Name",
    "Email",
    "Phone",
    "Booking Type",
    "Lane",
    "Date",
    "Time",
    "Base Amount",
    "Tax",
    "Total",
    "Created At",
  ];

  const rows = bookings.map((b: any) => [
    b.id,
    b.status,
    b.member?.name ?? b.guestName ?? "",
    b.member?.email ?? b.guestEmail ?? "",
    b.member?.phone ?? b.guestPhone ?? "",
    b.bookingType,
    laneLabel(b.bookingType, b.slotA),
    formatDate(b.slotA.date),
    formatTime(b.slotA.startTime),
    formatCents(b.baseAmountCents),
    formatCents(b.taxAmountCents),
    formatCents(b.totalAmountCents),
    b.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell: unknown) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const filename = `rallys-bookings-${from?.toISOString().split("T")[0] ?? "all"}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
