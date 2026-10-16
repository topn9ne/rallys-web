import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import Link from "next/link";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.userType !== "customer") {
    redirect("/account/signin?callbackUrl=/account/bookings");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-blue text-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <span className="font-bold tracking-tight">Railside Rides</span>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/account/bookings"
                className="text-blue-100 hover:text-white transition-colors"
              >
                My Bookings
              </Link>
              <Link
                href="/account/profile"
                className="text-blue-100 hover:text-white transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-200">{session.user.name ?? session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/book" });
              }}
            >
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
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
