import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDate, formatTime } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")! + "T23:59:59") : undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED", "REFUNDED"] },
      ...(from || to ? { createdAt: { gte: from, lte: to } } : {}),
    },
    include: {
      customer: true,
      slot: { include: { theme: true } },
      bookingAddons: { include: { addon: true } },
      discountCode: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const headers = [
    "Booking ID",
    "Status",
    "Customer Name",
    "Customer Email",
    "Ride",
    "Ride Type",
    "Date",
    "Time",
    "Seats",
    "Pick-up Location",
    "Base Amount",
    "Addons Amount",
    "Discount Amount",
    "Total",
    "Add-ons",
    "Discount Code",
    "Created At",
  ];

  const rows = bookings.map((b) => [
    b.id,
    b.status,
    b.customer.name,
    b.customer.email,
    b.slot.rideType === "THEME" ? b.slot.theme?.name ?? "Theme Ride" : "Group Ride",
    b.slot.rideType,
    formatDate(b.slot.date),
    formatTime(b.slot.startTime),
    b.seats,
    b.pickupLocation,
    formatCents(b.baseAmountCents),
    formatCents(b.addonsAmountCents),
    formatCents(b.discountAmountCents),
    formatCents(b.totalAmountCents),
    b.bookingAddons.map((ba) => ba.addon.name).join("; "),
    b.discountCode?.code ?? "",
    b.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const filename = `railside-rides-bookings-${from?.toISOString().split("T")[0] ?? "all"}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
