import { prisma } from "@/lib/prisma";
import { redeemReset } from "@/server/actions/staff";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const record = await prisma.staffToken.findUnique({ where: { token } });
  const invalid = !record || record.type !== "RESET" || record.usedAt || record.expiresAt < new Date();

  return (
    <AuthCard title="Reset Password" subtitle="Choose a new password">
      {invalid ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            This reset link is invalid or has expired.
          </div>
          <a
            href="/auth/forgot-password"
            className="block text-center text-sm text-admin-primary hover:underline"
          >
            Request a new reset link
          </a>
        </div>
      ) : (
        <>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {decodeURIComponent(error)}
            </p>
          )}
          <form
            action={async (formData: FormData) => {
              "use server";
              const password = formData.get("password") as string;
              const confirm = formData.get("confirm") as string;
              if (password !== confirm) {
                redirect(`/auth/reset-password/${token}?error=${encodeURIComponent("Passwords do not match.")}`);
              }
              const result = await redeemReset(token, password);
              if (result.error) {
                redirect(`/auth/reset-password/${token}?error=${encodeURIComponent(result.error)}`);
              }
              redirect("/auth/signin?reset=1");
            }}
            className="space-y-3"
          >
            <Input label="New password" name="password" type="password" required hint="Min 8 characters" />
            <Input label="Confirm password" name="confirm" type="password" required />
            <Button type="submit" variant="primary" className="w-full">
              Reset Password
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
