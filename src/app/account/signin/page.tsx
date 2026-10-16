import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInWithGoogle, signInWithMagicLink } from "./actions";

export default async function CustomerSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; sent?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error, sent } = await searchParams;

  if (session?.user?.userType === "customer") {
    redirect(callbackUrl ?? "/account/bookings");
  }

  const redirectTo = callbackUrl ?? "/auth/redirect";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 border border-gray-200 shadow-lg">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white font-bold text-lg">
            RR
          </div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to view your bookings</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            Something went wrong. Please try again.
          </p>
        )}

        {sent ? (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            <p className="font-medium">Check your email</p>
            <p className="mt-0.5 text-green-700">We sent a sign-in link to {sent}. It expires in 10 minutes.</p>
          </div>
        ) : (
          <>
            {/* Google */}
            <form
              action={async () => {
                "use server";
                await signInWithGoogle(redirectTo);
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400">
                <span className="bg-white px-3">or sign in with email</span>
              </div>
            </div>

            {/* Magic link */}
            <form action={signInWithMagicLink} className="space-y-3">
              <input type="hidden" name="callbackUrl" value={redirectTo} />
              <Input
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
              <Button type="submit" variant="primary" className="w-full">
                Send login link
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-brand-blue hover:underline">Terms</a>{" "}
          and{" "}
          <a href="/privacy" className="text-brand-blue hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
