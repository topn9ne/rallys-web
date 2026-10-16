import { prisma } from "@/lib/prisma";
import { redeemInvite } from "@/server/actions/staff";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const record = await prisma.staffToken.findUnique({
    where: { token },
    include: { staff: true },
  });

  const alreadyUsed = record?.type === "INVITE" && !!record.usedAt;
  const invalid = !record || record.type !== "INVITE" || record.usedAt || record.expiresAt < new Date();

  return (
    <AuthCard
      title="Set Your Password"
      subtitle={!invalid ? `Welcome, ${record.staff.name}!` : undefined}
    >
      {invalid ? (
        <div className="space-y-3 text-center text-sm">
          {alreadyUsed ? (
            <>
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
                Your account is already set up! Sign in below.
              </p>
              <a
                href="/auth/signin"
                className="inline-block w-full rounded-lg bg-admin-primary px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
              >
                Sign In →
              </a>
            </>
          ) : (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              This invite link has expired. Ask an admin to resend your invite.
            </p>
          )}
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
                redirect(`/auth/invite/${token}?error=${encodeURIComponent("Passwords do not match.")}`);
              }
              const result = await redeemInvite(token, password);
              if (result.error) {
                redirect(`/auth/invite/${token}?error=${encodeURIComponent(result.error)}`);
              }
              redirect("/auth/signin?invited=1");
            }}
            className="space-y-3"
          >
            <Input label="Password" name="password" type="password" required hint="Min 8 characters" />
            <Input label="Confirm password" name="confirm" type="password" required />
            <Button type="submit" variant="primary" className="w-full">
              Activate Account
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
