"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/server/actions/auth";

function action(_prev: { error?: string; success?: boolean } | null) {
  return requestPasswordReset();
}

export function PasswordReset() {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">Password</h2>
      <p className="mt-0.5 text-sm text-gray-500">
        Change your account password.
      </p>
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {state?.success ? (
          <p className="text-sm text-green-700">
            Reset link sent! Check your email.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              We&apos;ll send a password reset link to your email address.
            </p>
            {state?.error && (
              <p className="mt-2 text-sm text-red-600">{state.error}</p>
            )}
            <form action={formAction} className="mt-4">
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                loading={isPending}
              >
                Send password reset email
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
