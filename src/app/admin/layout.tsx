export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileNav } from "@/components/admin/MobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  return (
    <div
      className="relative flex h-screen overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(180deg, var(--color-admin-ink) 0%, var(--color-admin-bg-mid) 100%)",
      }}
    >
      {/* Subtle diagonal stripe overlay, fading in over bottom half */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.18,
          background:
            "repeating-linear-gradient(120deg, rgba(74,123,255,0.05) 0 12px, transparent 12px 24px)",
          maskImage:
            "linear-gradient(180deg, transparent 50%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 50%, black 100%)",
        }}
      />

      <div className="relative z-20 hidden shrink-0 pt-[60px] pl-[60px] pr-5 pb-[60px] md:block">
        <AdminSidebar />
      </div>
      <main className="relative z-[1] flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 md:px-6 md:pt-[60px] md:pb-[100px]">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
