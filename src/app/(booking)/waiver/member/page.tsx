export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWaiverTemplate } from "@/server/actions/waiverTemplate";
import { getMemberWaiverStatus } from "@/server/actions/waiver";
import { MemberWaiverForm } from "@/components/booking/MemberWaiverForm";

export const metadata = { title: "Sign Waiver | Rally's Indoor Training" };

export default async function MemberWaiverPage() {
  const user = await getUser();
  if (!user) redirect("/auth/signin?callbackUrl=/waiver/member");

  const status = await getMemberWaiverStatus(user.id);

  if (status.signed && !status.needsResign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl text-green-600">&#10003;</div>
          <h1 className="text-2xl font-bold text-gray-900">Waiver Already Signed</h1>
          <p className="mt-2 text-gray-500">
            Your participation waiver was signed on{" "}
            {status.signedAt?.toLocaleDateString()}. You&apos;re all set!
          </p>
          <a
            href="/book"
            className="mt-6 inline-block rounded-lg bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Book a Session
          </a>
        </div>
      </div>
    );
  }

  const waiverText = await getWaiverTemplate();
  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {status.needsResign ? "Updated Waiver — Re-sign Required" : "Participation Waiver"}
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            {status.needsResign
              ? "Our waiver terms have been updated. Please review and sign the new version to continue booking sessions."
              : "Sign once to cover all your future sessions at Rally's Indoor Training."}
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">
            Participant Waiver and Release of Liability
          </h2>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
            {waiverText}
          </div>
        </div>

        <MemberWaiverForm defaultName={member?.name} />
      </div>
    </div>
  );
}
