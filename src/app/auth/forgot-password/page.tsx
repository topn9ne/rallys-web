import { requestPasswordReset } from "@/server/actions/staff";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="We'll send you a reset link"
      footer={
        <a href="/auth/signin" className="text-admin-primary hover:underline">
          Back to sign in
        </a>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-700">
          If that email is registered, you&apos;ll receive a reset link shortly.
          Check your inbox.
        </div>
      ) : (
        <form
          action={async (formData: FormData) => {
            "use server";
            const email = formData.get("email") as string;
            await requestPasswordReset(email);
            redirect("/auth/forgot-password?sent=1");
          }}
          className="space-y-3"
        >
          <Input label="Email address" name="email" type="email" required autoComplete="email" />
          <Button type="submit" variant="primary" className="w-full">
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
