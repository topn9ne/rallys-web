"use client";

import { useActionState } from "react";
import { joinWaitlist } from "@/server/actions/waitlist";

type WaitlistResult = { success?: boolean; message?: string; error?: string } | null;

export function WaitlistForm({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const [state, formAction, pending] = useActionState<WaitlistResult, FormData>(
    async (_prev, formData) => joinWaitlist(formData),
    null
  );

  if (state?.success) {
    return (
      <p
        className={`text-lg font-semibold ${
          variant === "dark" ? "text-gold" : "text-white"
        }`}
      >
        {state.message}
      </p>
    );
  }

  const inputBg = variant === "dark" ? "bg-white/10 text-white placeholder:text-white/40 border-white/15" : "bg-white/20 text-white placeholder:text-white/50 border-white/25";
  const buttonBg = variant === "dark" ? "bg-rally-red-bright text-white" : "bg-white text-rally-red-bright";

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email"
        name="email"
        placeholder="your@email.com"
        required
        className={`flex-1 rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold ${inputBg}`}
      />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-[1px] transition-[filter] hover:brightness-110 disabled:opacity-60 ${buttonBg}`}
      >
        {pending ? "..." : "Notify Me"}
      </button>
      {state?.error && (
        <p className="text-sm text-rally-red-bright sm:absolute">{state.error}</p>
      )}
    </form>
  );
}
