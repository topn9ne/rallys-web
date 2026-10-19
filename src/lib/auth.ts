import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Get the current authenticated user. Returns null if not signed in.
 * Uses supabase.auth.getUser() which validates the JWT server-side.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current user or redirect to sign-in.
 */
export async function requireUser(callbackUrl = "/account/bookings") {
  const user = await getUser();
  if (!user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}

/**
 * Get the Member record for the current user, creating it if it doesn't exist.
 * Returns null only if the user is not authenticated.
 */
export async function getMember() {
  const user = await getUser();
  if (!user) return null;

  const existing = await prisma.member.findUnique({ where: { id: user.id } });
  if (existing) return existing;

  return prisma.member.create({
    data: {
      id: user.id,
      name: user.user_metadata?.name ?? "",
      email: user.email ?? "",
      phone: user.user_metadata?.phone ?? "",
      tier: "FAMILY",
      subscriptionStatus: "NONE",
    },
  });
}

/**
 * Check if the current user is an admin (via Supabase app_metadata.role).
 */
export async function isAdmin() {
  const user = await getUser();
  return user?.app_metadata?.role === "admin";
}

/**
 * Sign out and redirect.
 */
export async function signOut(redirectTo = "/auth/signin") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(redirectTo);
}
