"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { handleSignOut } from "@/server/actions/auth";
import {
  SquaresFour,
  CalendarBlank,
  Ticket,
  ChartBar,
  UsersThree,
  Gear,
  SignOut,
  List,
  X,
} from "@phosphor-icons/react";

const SETTINGS_PATHS = [
  "/admin/pricing",
  "/admin/promo-codes",
  "/admin/notifications",
  "/admin/waivers",
];

const bottomItems = [
  { label: "Dashboard", href: "/admin",          Icon: SquaresFour },
  { label: "Schedule",  href: "/admin/schedule", Icon: CalendarBlank },
  { label: "Bookings",  href: "/admin/bookings", Icon: Ticket },
  { label: "Reports",   href: "/admin/reports",  Icon: ChartBar },
];

const sheetItems = [
  { label: "Dashboard", href: "/admin",           Icon: SquaresFour,  activePaths: undefined },
  { label: "Schedule",  href: "/admin/schedule",  Icon: CalendarBlank, activePaths: undefined },
  { label: "Bookings",  href: "/admin/bookings",  Icon: Ticket,        activePaths: undefined },
  { label: "Members",   href: "/admin/members",   Icon: UsersThree,    activePaths: undefined },
  { label: "Reports",   href: "/admin/reports",    Icon: ChartBar,      activePaths: undefined },
  { label: "Settings",  href: "/admin/pricing",    Icon: Gear,          activePaths: SETTINGS_PATHS },
] as const;

function isActive(pathname: string, href: string, activePaths?: readonly string[]) {
  if (href === "/admin") return pathname === "/admin";
  if (activePaths) return activePaths.some((p) => pathname.startsWith(p));
  return pathname.startsWith(href);
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className="fixed bottom-14 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl transition-[translate] duration-300 ease-out md:hidden"
        style={{ translate: open ? "0 0" : "0 calc(100% + 3.5rem)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <List size={20} weight="duotone" color="#1B2A4A" />
            <span className="text-sm font-extrabold uppercase tracking-widest text-brand-blue">Menu</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="px-3 py-3">
          <ul className="space-y-0.5">
            {sheetItems.map(({ label, href, Icon, activePaths }) => {
              const active = isActive(pathname, href, activePaths);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 h-12 rounded-xl px-3 transition-colors",
                      active
                        ? "bg-brand-blue text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon
                      size={20}
                      weight="duotone"
                      color={active ? "white" : "#1B2A4A"}
                    />
                    <span className="text-sm font-semibold">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex items-center gap-3 h-12 rounded-xl px-3 w-full text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <SignOut size={20} weight="duotone" color="#1B2A4A" />
                <span className="text-sm font-semibold">Sign out</span>
              </button>
            </form>
          </div>
        </nav>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-white border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.18)] flex items-stretch md:hidden">
        {bottomItems.map(({ label, href, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                active ? "text-brand-blue" : "text-gray-400"
              )}
            >
              <Icon size={22} weight="duotone" color={active ? "#1B2A4A" : "#9ca3af"} />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
            open ? "text-brand-blue" : "text-gray-400"
          )}
        >
          <List size={22} weight="duotone" color={open ? "#1B2A4A" : "#9ca3af"} />
          <span className="text-[10px] font-semibold leading-none">More</span>
        </button>
      </nav>
    </>
  );
}
