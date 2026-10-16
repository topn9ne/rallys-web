import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session.user.role === "OPERATOR" || session.user.role === "DRIVER") {
    redirect("/operator");
  }

  if (session.user.userType === "customer") {
    redirect("/account/bookings");
  }

  // Fallback for unexpected roles
  redirect("/auth/signin");
}
