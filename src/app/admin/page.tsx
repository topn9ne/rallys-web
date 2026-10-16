import Link from "next/link";
import {
  ArrowRight,
  Bicycle,
  CalendarBlank,
  CalendarPlus,
  ChartBar,
  CurrencyDollar,
  Signature,
  Sparkle,
  Ticket,
  User,
} from "@phosphor-icons/react/dist/ssr";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, formatCents, formatTime } from "@/lib/utils";

async function getDashboardData() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const thisMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

  const [
    totalBookings,
    todayBookings,
    activeSlots,
    totalRevenue,
    monthRevenue,
    todaySlots,
    recentBookings,
    pendingWaivers,
    upcomingWeekSlots,
  ] = await Promise.all([
    prisma.booking.count({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    prisma.booking.count({
      where: {
        createdAt: { gte: today },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    }),
    prisma.rideSlot.count({
      where: { date: { gte: today }, status: { in: ["FILLING", "FULL"] } },
    }),
    prisma.booking.aggregate({
      _sum: { totalAmountCents: true },
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    prisma.booking.aggregate({
      _sum: { totalAmountCents: true },
      where: {
        createdAt: { gte: thisMonthStart },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    }),
    prisma.rideSlot.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        status: { in: ["FILLING", "FULL"] },
      },
      include: {
        theme: true,
        bike: true,
        bookings: { where: { status: { in: ["CONFIRMED"] } } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.booking.findMany({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      include: { slot: { include: { theme: true } }, customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.count({
      where: {
        status: { in: ["CONFIRMED"] },
        waiver: { status: { not: "SIGNED" } },
        slot: { date: { gte: today } },
      },
    }),
    prisma.rideSlot.count({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: { in: ["FILLING", "FULL"] },
      },
    }),
  ]);

  return {
    totalBookings,
    todayBookings,
    activeSlots,
    totalRevenue: totalRevenue._sum.totalAmountCents ?? 0,
    monthRevenue: monthRevenue._sum.totalAmountCents ?? 0,
    todaySlots,
    recentBookings,
    pendingWaivers,
    upcomingWeekSlots,
  };
}

function firstNameFrom(displayName: string | null | undefined, email: string | null | undefined) {
  if (displayName) {
    const first = displayName.trim().split(/\s+/)[0];
    if (first) return first;
  }
  if (email) {
    const local = email.split("@")[0];
    if (local) return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "there";
}

export default async function AdminDashboard() {
  const [data, user] = await Promise.all([getDashboardData(), getUser()]);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = firstNameFrom(user?.user_metadata?.name, user?.email);
  const dateStr = now
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();

  type KpiCard = {
    label: string;
    value: string;
    sub: string;
    Icon: typeof CurrencyDollar;
    highlight?: boolean;
  };

  const statCards: KpiCard[] = [
    {
      label: "Total Revenue",
      value: formatCents(data.totalRevenue),
      sub: `+${formatCents(data.monthRevenue)} this month`,
      Icon: CurrencyDollar,
      highlight: true,
    },
    {
      label: "Total Bookings",
      value: data.totalBookings.toString(),
      sub: `${data.todayBookings} new today`,
      Icon: Ticket,
    },
    {
      label: "Booked Rides",
      value: data.activeSlots.toString(),
      sub: `${data.todaySlots.length} rides today`,
      Icon: CalendarBlank,
    },
    {
      label: "Pending Waivers",
      value: data.pendingWaivers.toString(),
      sub: "Unsigned before ride",
      Icon: Signature,
    },
  ];

  const quickLinks = [
    { label: "Manage Fleet", href: "/admin/fleet", Icon: Bicycle, desc: "Vehicles & status" },
    { label: "Pricing", href: "/admin/pricing", Icon: CurrencyDollar, desc: "Rates & tax" },
    { label: "Add-ons", href: "/admin/addons", Icon: Sparkle, desc: "Upsell items" },
    { label: "Reports", href: "/admin/reports", Icon: ChartBar, desc: "Revenue & exports" },
  ];

  // Card shadow matches handoff: soft 8px ambient + crisp 1px rim.
  const cardShadow =
    "shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.12)]";
  const darkCardShadow =
    "shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.18)]";

  return (
    <div className="flex flex-col gap-[22px]">
      {/* HEADER ROW */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2.5 text-white">
            <h1 className="font-display text-[30px] leading-none tracking-[-0.5px]">
              {greeting}, {firstName}.
            </h1>
            <span
              className="rounded-full border border-admin-accent/40 bg-admin-accent/15 px-2 py-[3px] font-mono text-[11px] uppercase tracking-[1px] text-admin-accent"
            >
              Live
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[2px] text-white/55">
            {dateStr} · {data.upcomingWeekSlots} ride{data.upcomingWeekSlots === 1 ? "" : "s"} ahead this week
          </p>
        </div>
        <Link
          href="/admin/schedule"
          className="inline-flex items-center justify-center gap-2 self-start rounded-[10px] bg-admin-accent px-5 py-3 font-display text-[13px] uppercase tracking-[1px] text-white shadow-[0_6px_16px_rgba(255,46,136,0.35)] transition-[filter] hover:brightness-110 md:self-auto"
        >
          <CalendarPlus size={15} weight="bold" color="white" />
          Add New Ride
        </Link>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "relative flex min-h-[128px] flex-col justify-between overflow-hidden rounded-[14px] px-5 py-[18px]",
              card.highlight
                ? `bg-admin-primary text-white ${darkCardShadow}`
                : `bg-white text-admin-ink ${cardShadow}`
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.6px]",
                card.highlight ? "text-white/85" : "text-admin-text-sub"
              )}
            >
              <card.Icon
                size={16}
                weight="regular"
                color={card.highlight ? "#ffffff" : "#4a7bff"}
              />
              {card.label}
            </div>
            <div>
              <div className="font-display text-[32px] leading-none tracking-[-1px] md:text-[40px]">
                {card.value}
              </div>
              <div
                className={cn(
                  "mt-2 text-xs",
                  card.highlight ? "text-white/75" : "text-admin-text-sub"
                )}
              >
                {card.sub}
              </div>
            </div>
            {card.highlight && (
              <div className="absolute right-2.5 top-2.5 rounded-full bg-admin-accent px-2 py-[3px] font-mono text-[10px] uppercase tracking-[1px] text-white">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TWO PANELS */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div
          className={cn(
            "rounded-[14px] bg-white px-[22px] py-5 text-admin-ink",
            cardShadow
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]">
              Today&apos;s Schedule
            </h2>
            <Link
              href="/admin/schedule"
              className="text-xs font-semibold text-admin-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          {data.todaySlots.length === 0 ? (
            <div className="mt-[18px] rounded-[10px] border border-dashed border-admin-line px-5 py-10 text-center text-[13px] text-admin-text-sub">
              <div className="mx-auto mb-3 grid h-[42px] w-[42px] place-items-center rounded-[10px] bg-[#f2f4fb]">
                <CalendarBlank size={20} weight="regular" color="#2B5CE6" />
              </div>
              No rides scheduled today.
              <br />
              <Link
                href="/admin/schedule"
                className="font-semibold text-admin-primary hover:underline"
              >
                Schedule one →
              </Link>
            </div>
          ) : (
            <ul className="mt-[18px]">
              {data.todaySlots.map((slot, i) => (
                <li
                  key={slot.id}
                  className={cn(
                    "flex items-center gap-3 py-[11px]",
                    i < data.todaySlots.length - 1 && "border-b border-admin-line"
                  )}
                >
                  <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#eef1fb]">
                    <Bicycle size={16} weight="regular" color="#2B5CE6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold tracking-[-0.1px] text-admin-ink">
                      {slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride"}
                    </div>
                    <div className="mt-[1px] text-xs text-admin-text-sub">
                      {formatTime(slot.startTime)} · {slot.bike.name}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold tracking-[-0.1px] text-admin-primary">
                      {slot.bookings.length}
                      {slot.rideType === "THEME" && `/${slot.seatsTotal}`}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] uppercase text-admin-text-sub">
                      {slot.status === "FILLING"
                        ? "Filling"
                        : slot.status === "FULL"
                        ? "Full"
                        : "Open"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Bookings */}
        <div
          className={cn(
            "rounded-[14px] bg-white px-[22px] py-5 text-admin-ink",
            cardShadow
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.8px]">
              Recent Bookings
            </h2>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-admin-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          {data.recentBookings.length === 0 ? (
            <div className="mt-[18px] px-5 py-8 text-center text-sm text-admin-text-sub">
              No bookings yet
            </div>
          ) : (
            <ul className="mt-1.5">
              {data.recentBookings.map((booking, i) => (
                <li
                  key={booking.id}
                  className={cn(
                    "flex items-center gap-3 py-[11px]",
                    i < data.recentBookings.length - 1 && "border-b border-admin-line"
                  )}
                >
                  <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#eef1fb]">
                    <User size={16} weight="regular" color="#2B5CE6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold tracking-[-0.1px] text-admin-ink">
                      {booking.customer.name}
                    </div>
                    <div className="mt-[1px] truncate text-xs text-admin-text-sub">
                      {booking.slot.rideType === "THEME"
                        ? booking.slot.theme?.name ?? "Theme Ride"
                        : "Group Ride"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold tracking-[-0.1px] text-admin-primary">
                      {formatCents(booking.totalAmountCents)}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] uppercase text-admin-text-sub">
                      {new Date(booking.createdAt)
                        .toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        .toUpperCase()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* SHORTCUT TILES */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between gap-3 rounded-[14px] border border-white/[0.08] bg-admin-primary px-5 py-4 text-white shadow-[0_1px_2px_rgba(11,18,50,0.18)] transition-[filter] hover:brightness-110"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.12]">
                <item.Icon size={18} weight="regular" color="#ffffff" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold uppercase leading-tight tracking-[1.2px]">
                  {item.label}
                </div>
                <div className="mt-0.5 hidden text-[11.5px] opacity-75 sm:block">
                  {item.desc}
                </div>
              </div>
            </div>
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.12]">
              <ArrowRight size={13} weight="bold" color="#ffffff" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
