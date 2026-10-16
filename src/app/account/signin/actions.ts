"use server";

import { signIn } from "@/lib/auth";

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl ?? "/auth/redirect" });
}

export async function signInWithMagicLink(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const callbackUrl = (formData.get("callbackUrl") as string) || "/auth/redirect";
  if (!email) return;
  await signIn("nodemailer", { email, redirectTo: callbackUrl });
}
