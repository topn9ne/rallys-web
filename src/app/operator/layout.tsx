export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/operator");

  const role = session.user.role;
  if (role !== "OPERATOR" && role !== "ADMIN" && role !== "DRIVER") {
    redirect("/unauthorized");
  }

  return (
    <div className="page-wrapper bg-gray-900 text-white">
      {/* Simple top bar for operator (tablet-optimized) */}
      <header className="border-b border-gray-700 bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-sm font-bold">
              RR
            </div>
            <span className="font-semibold">Railside Rides — Operations</span>
            {role === "DRIVER" && (
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                Driver View
              </span>
            )}
          </div>
          <span className="text-sm text-gray-400">{session.user.name}</span>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
