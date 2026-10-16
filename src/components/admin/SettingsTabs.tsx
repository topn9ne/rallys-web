"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CurrencyDollar,
  Bell,
  Signature,
  Gear,
  Tag,
} from "@phosphor-icons/react";
import { AdminPageHeader } from "./AdminPageHeader";

const tabs = [
  { label: "Pricing",        href: "/admin/pricing",        Icon: CurrencyDollar },
  { label: "Promo Codes",    href: "/admin/promo-codes",    Icon: Tag },
  { label: "Notifications",  href: "/admin/notifications",  Icon: Bell },
  { label: "Waivers",        href: "/admin/waivers",        Icon: Signature },
];

export function SettingsTabs() {
  const pathname = usePathname();
  const activeTab = tabs.find((t) => pathname.startsWith(t.href));

  return (
    <div className="mb-6">
      <AdminPageHeader
        title="Settings"
        eyebrow={activeTab?.label}
        icon={<Gear size={18} weight="regular" color="#ffffff" />}
      />

      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none md:-mx-6 md:px-6">
        <div className="flex min-w-max items-end gap-1 border-b border-white/10">
          {tabs.map(({ label, href, Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative -mb-px flex shrink-0 items-center gap-2 px-3 py-2.5 text-[13px] font-bold uppercase tracking-[0.8px] transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/55 hover:text-white/85"
                )}
              >
                <Icon size={15} weight="regular" />
                {label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-rally-red-bright"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
