"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Images, Globe, Image, Question, Handshake } from "@phosphor-icons/react";
import { AdminPageHeader } from "./AdminPageHeader";

const tabs = [
  { label: "Gallery",    href: "/admin/website/gallery",   Icon: Images },
  { label: "Hero Image", href: "/admin/website/hero",      Icon: Image },
  { label: "FAQ",        href: "/admin/website/faq",       Icon: Question },
  { label: "Sponsors",   href: "/admin/website/sponsors",  Icon: Handshake },
];

export function WebsiteTabs() {
  const pathname = usePathname();
  const activeTab = tabs.find((t) => pathname.startsWith(t.href));

  return (
    <div className="mb-6">
      <AdminPageHeader
        title="Website"
        eyebrow={activeTab?.label}
        icon={<Globe size={18} weight="regular" color="#ffffff" />}
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
                    className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-landing-accent"
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
