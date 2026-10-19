"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/admin/SignOutButton";
import {
  SquaresFour,
  CalendarBlank,
  Ticket,
  UsersThree,
  ChartBar,
  Gear,
  CaretDoubleRight,
  CaretDoubleLeft,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const SETTINGS_PATHS = [
  "/admin/pricing",
  "/admin/promo-codes",
  "/admin/notifications",
  "/admin/waivers",
];

type NavItem = {
  label: string;
  href: string;
  Icon: Icon;
  activePaths?: string[];
};

const navItems: NavItem[] = [
  { label: "Dashboard",  href: "/admin",           Icon: SquaresFour },
  { label: "Schedule",   href: "/admin/schedule",  Icon: CalendarBlank },
  { label: "Bookings",   href: "/admin/bookings",  Icon: Ticket },
  { label: "Members",    href: "/admin/members",   Icon: UsersThree },
  { label: "Reports",    href: "/admin/reports",    Icon: ChartBar },
  { label: "Settings",   href: "/admin/pricing",    Icon: Gear, activePaths: SETTINGS_PATHS },
];

const SIDEBAR_SHADOW =
  "shadow-[0_1px_2px_rgba(11,18,50,0.12),_0_10px_28px_rgba(11,18,50,0.22)]";

export function AdminSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-6 flex shrink-0 flex-col rounded-[14px] bg-white p-2 text-admin-ink transition-all duration-200",
        SIDEBAR_SHADOW,
        expanded ? "w-56" : "w-[60px]"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center",
          expanded ? "gap-2 px-1 pb-2" : "justify-center pb-1"
        )}
      >
        <img src="/logo-r.svg" alt="Rally's" className="h-9 w-9 shrink-0" />
        {expanded && (
          <div className="overflow-hidden">
            <div className="whitespace-nowrap text-sm font-semibold leading-tight text-admin-ink">
              Rally&apos;s Indoor
            </div>
            <div className="whitespace-nowrap text-[11px] text-admin-text-sub">
              Admin Portal
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-1">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : item.activePaths
                ? item.activePaths.some((p) => pathname.startsWith(p))
                : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 items-center rounded-lg transition-colors",
                    expanded ? "gap-3 px-2" : "justify-center",
                    isActive
                      ? "bg-admin-primary text-white"
                      : "text-admin-primary hover:bg-[#f0f2f5]"
                  )}
                >
                  <item.Icon
                    size={17}
                    weight="regular"
                    className="shrink-0"
                    color={isActive ? "#ffffff" : "#1B2A4A"}
                  />
                  {expanded && (
                    <span
                      className={cn(
                        "whitespace-nowrap text-sm font-semibold tracking-[0.2px]",
                        isActive ? "text-white" : "text-admin-ink"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
                {!expanded && (
                  <div
                    className={cn(
                      "pointer-events-none absolute left-0 top-0 z-50 flex h-9 -translate-x-1 items-center gap-2.5 whitespace-nowrap rounded-full pl-2 pr-4 opacity-0 shadow-lg transition-all duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100",
                      isActive ? "bg-admin-primary" : "bg-white"
                    )}
                  >
                    <item.Icon
                      size={17}
                      weight="regular"
                      color={isActive ? "#ffffff" : "#1B2A4A"}
                      className="shrink-0"
                    />
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-white" : "text-admin-ink"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        aria-hidden
        className={cn(
          "h-px self-center bg-admin-ink/[0.08]",
          expanded ? "my-1.5 w-[calc(100%-16px)]" : "my-1.5 w-6"
        )}
      />

      <div className="flex flex-col gap-1">
        <div className="group relative">
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "flex h-9 w-full items-center rounded-lg text-admin-primary transition-colors hover:bg-[#f0f2f5]",
              expanded ? "gap-3 px-2" : "justify-center"
            )}
          >
            {expanded ? (
              <>
                <CaretDoubleLeft size={17} weight="regular" color="#1B2A4A" className="shrink-0" />
                <span className="whitespace-nowrap text-sm font-semibold text-admin-ink">
                  Collapse
                </span>
              </>
            ) : (
              <CaretDoubleRight size={17} weight="regular" color="#1B2A4A" />
            )}
          </button>
          {!expanded && (
            <div className="pointer-events-none absolute left-0 top-0 z-50 flex h-9 -translate-x-1 items-center gap-2.5 whitespace-nowrap rounded-full bg-white pl-2 pr-4 opacity-0 shadow-lg transition-all duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100">
              <CaretDoubleRight size={17} weight="regular" color="#1B2A4A" className="shrink-0" />
              <span className="text-sm font-semibold text-admin-ink">Expand</span>
            </div>
          )}
        </div>
        <SignOutButton expanded={expanded} />
      </div>
    </aside>
  );
}
