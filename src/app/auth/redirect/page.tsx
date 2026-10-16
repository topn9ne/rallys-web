import { getUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  if (await isAdmin()) {
    redirect("/admin");
  }

  redirect("/account/bookings");
}
