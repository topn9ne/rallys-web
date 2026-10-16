import { getUser, getMember } from "@/lib/auth";

export async function requireAdmin() {
  const user = await getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireMember() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const member = await getMember();
  if (!member) throw new Error("No member record");
  return { user, member };
}
