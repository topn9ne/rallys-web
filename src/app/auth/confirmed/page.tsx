import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

export default function ConfirmedPage() {
  return (
    <AuthCard
      title="You're In"
      subtitle="Rally's Indoor Training"
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <CheckCircle size={48} weight="fill" className="text-green-500" />
        <p className="text-center text-sm leading-relaxed text-gray-600">
          Your email is confirmed and your account is ready to go.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex w-full items-center justify-center rounded-lg bg-admin-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-admin-primary/90"
        >
          Sign In
        </Link>
      </div>
    </AuthCard>
  );
}
