"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthCard title="Sign In" subtitle="Rally's Indoor Training"><div className="h-64" /></AuthCard>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account/bookings";
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(errorParam ? "Something went wrong. Please try again." : "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email for a confirmation link.");
    setLoading(false);
  }

  return (
    <AuthCard
      title={mode === "signin" ? "Sign In" : "Create Account"}
      subtitle="Rally's Indoor Training"
    >
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          {message}
        </p>
      )}

      {!message && (
        <form
          onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
          className="space-y-3"
        >
          {mode === "signup" && (
            <>
              <Input
                label="Full Name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              />
            </>
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500">
        {mode === "signin" ? (
          <>
            New member?{" "}
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
              className="font-medium text-admin-primary hover:underline"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); setMessage(""); }}
              className="font-medium text-admin-primary hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="text-center text-xs text-gray-400">
        By continuing, you agree to our{" "}
        <a href="/terms" className="hover:underline">Terms</a>{" "}
        and{" "}
        <a href="/privacy" className="hover:underline">Privacy Policy</a>.
      </p>
    </AuthCard>
  );
}
