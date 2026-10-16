"use client";

import { handleSignOut } from "@/server/actions/auth";
import { SignOut } from "@phosphor-icons/react";

export function SignOutButton({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="group relative">
      <form action={handleSignOut}>
        <button
          type="submit"
          className={
            "flex h-9 w-full items-center rounded-lg text-admin-primary transition-colors hover:bg-[#f2f4fb] " +
            (expanded ? "gap-3 px-2" : "justify-center")
          }
        >
          <SignOut size={17} weight="regular" color="#2B5CE6" className="shrink-0" />
          {expanded && (
            <span className="whitespace-nowrap text-sm font-semibold text-admin-ink">
              Sign out
            </span>
          )}
        </button>
      </form>
      {/* Hover slide-out pill — collapsed only */}
      {!expanded && (
        <div className="pointer-events-none absolute left-0 top-0 z-50 flex h-9 -translate-x-1 items-center gap-2.5 whitespace-nowrap rounded-full bg-white pl-2 pr-4 opacity-0 shadow-lg transition-all duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100">
          <SignOut size={17} weight="regular" color="#2B5CE6" className="shrink-0" />
          <span className="text-sm font-semibold text-admin-ink">Sign out</span>
        </div>
      )}
    </div>
  );
}
