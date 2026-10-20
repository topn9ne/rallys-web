import { getUser } from "@/lib/auth";
import { signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberWaiverStatus } from "@/server/actions/waiver";
import { WaiverStatusBanner } from "@/components/account/WaiverStatusBanner";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/auth/signin?callbackUrl=/account/bookings");
  }

  const waiverStatus = await getMemberWaiverStatus(user.id);

  async function handleSignOut() {
    "use server";
    await signOut("/book");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountNav
        userName={user.user_metadata?.name ?? user.email ?? ""}
        signOutAction={handleSignOut}
      />
      <main className="mx-auto max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <WaiverStatusBanner signed={waiverStatus.signed} needsResign={waiverStatus.needsResign} />
        {(!waiverStatus.signed || waiverStatus.needsResign) && <div className="mt-4" />}
        {children}
      </main>
    </div>
  );
}
