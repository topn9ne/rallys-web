"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";
import {
  CalendarDots,
  Medal,
  BaseballHelmet,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";

interface Props {
  userName: string;
  signOutAction: () => Promise<void>;
}

const tabs = [
  { href: "/account/bookings", label: "Bookings", icon: CalendarDots },
  { href: "/account/membership", label: "Membership", icon: Medal },
  { href: "/account/players", label: "Players", icon: BaseballHelmet },
  { href: "/account/profile", label: "Profile", icon: UserCircle },
];

export function AccountNav({ userName, signOutAction }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:block bg-brand-blue text-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/account/bookings" className="shrink-0">
            <Wordmark className="h-7 w-auto" fill="#ffffff" />
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={
                  pathname === t.href
                    ? "text-white font-semibold"
                    : "text-blue-100 hover:text-white transition-colors"
                }
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-200">{userName}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-blue-400 px-3 py-1 text-xs text-blue-100 hover:bg-blue-700 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden bg-brand-blue text-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/account/bookings">
            <Wordmark className="h-6 w-auto" fill="#ffffff" />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-200 text-xs">{userName}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-blue-400 px-2.5 py-1 text-xs text-blue-100 hover:bg-blue-700 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {tabs.map((t) => {
            const active = pathname === t.href;
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                  active
                    ? "text-brand-blue"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon size={22} weight={active ? "fill" : "regular"} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
