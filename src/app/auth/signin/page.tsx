import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; invited?: string }>;
}) {
  const { error, invited } = await searchParams;

  const errorMessage =
    error === "PendingInvite"
      ? "Check your email — you need to set your password via the invite link before signing in."
      : error === "CredentialsSignin"
      ? "Invalid email or password."
      : null;

  return (
    <AuthCard
      title="Staff Sign In"
      subtitle="Railside Rides"
      footer={
        <a href="/auth/forgot-password" className="text-admin-primary hover:underline">
          Forgot password?
        </a>
      }
    >
      {invited && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          Account created! Sign in below to get started.
        </p>
      )}
      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <form
        action={async (formData: FormData) => {
          "use server";
          try {
            await signIn("staff-credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo: "/auth/redirect",
            });
          } catch (error) {
            if (error instanceof AuthError) {
              const code = (error.cause as any)?.err?.message === "PendingInvite"
                ? "PendingInvite"
                : error.type;
              redirect(`/auth/signin?error=${code}`);
            }
            throw error;
          }
        }}
        className="space-y-3"
      >
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Button type="submit" variant="primary" className="w-full">
          Sign In
        </Button>
      </form>
    </AuthCard>
  );
}
