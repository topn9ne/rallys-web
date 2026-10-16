import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireStaff() {
  const session = await auth();
  if (!session || session.user.userType !== "staff") {
    throw new Error("Unauthorized");
  }
  return session;
}
