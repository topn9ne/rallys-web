"use server";

import { signOut, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function handleSignOut() {
  await signOut("/auth/signin");
}

export async function requestPasswordReset() {
  const user = await requireUser("/account/profile");
  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: { email: true },
  });

  if (!member?.email) return { error: "No email on file." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(member.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/account/profile`,
  });

  if (error) return { error: error.message };
  return { success: true };
}
