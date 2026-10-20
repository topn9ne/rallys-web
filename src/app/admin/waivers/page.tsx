import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { WaiverTemplateForm } from "@/components/admin/WaiverTemplateForm";
import { getWaiverTemplateWithMeta } from "@/server/actions/waiverTemplate";
import { FileText, Signature } from "@phosphor-icons/react/dist/ssr";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default async function WaiversPage() {
  const [waivers, templateMeta] = await Promise.all([
    prisma.waiver.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        member: { select: { name: true, email: true } },
        booking: {
          include: {
            member: { select: { name: true, email: true } },
            slotA: { select: { date: true, lane: true } },
          },
        },
      },
    }),
    getWaiverTemplateWithMeta(),
  ]);

  const signed = waivers.filter((w: any) => w.status === "SIGNED").length;
  const pending = waivers.filter((w: any) => w.status === "PENDING").length;

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
                <Signature size={18} weight="duotone" color="#1B2A4A" />
                Waivers ({waivers.length})
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="green">{signed} signed</Badge>
                <Badge variant="amber">{pending} pending</Badge>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100">
              {waivers.map((waiver: any) => {
                const isMemberWaiver = !waiver.bookingId;
                const name = waiver.member?.name ?? waiver.booking?.member?.name ?? waiver.booking?.guestName ?? "Guest";
                const email = waiver.member?.email ?? waiver.booking?.member?.email ?? waiver.booking?.guestEmail ?? "";
                const lane = isMemberWaiver
                  ? null
                  : waiver.booking?.bookingType === "BOTH_LANES"
                    ? "Both Lanes"
                    : `Lane ${waiver.booking?.slotA?.lane ?? "?"}`;

                return (
                  <li key={waiver.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 truncate">{name}</p>
                          <Badge variant={waiver.status === "SIGNED" ? "green" : "amber"}>
                            {waiver.status === "SIGNED" ? "Signed" : "Pending"}
                          </Badge>
                          {waiver.isMinor && (
                            <Badge variant="blue">Minor</Badge>
                          )}
                        </div>
                        {email && (
                          <p className="mt-0.5 text-sm text-gray-500 truncate">{email}</p>
                        )}
                        <p className="mt-0.5 text-xs text-gray-400">
                          {isMemberWaiver ? (
                            <span className="font-medium text-brand-blue">Membership waiver</span>
                          ) : (
                            <>
                              {lane} &middot;{" "}
                              {waiver.booking?.slotA?.date
                                ? formatDate(new Date(waiver.booking.slotA.date))
                                : "—"}
                            </>
                          )}
                        </p>
                        {waiver.status === "SIGNED" && waiver.signerName && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            Signed by <span className="font-medium">{waiver.signerName}</span>
                            {waiver.signedAt && <> &middot; {formatDateTime(new Date(waiver.signedAt))}</>}
                          </p>
                        )}
                        {waiver.participants && Array.isArray(waiver.participants) && (waiver.participants as any[]).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(waiver.participants as any[]).map((p: any, i: number) => (
                              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                {p.name}
                                {p.isMinor && <span className="text-amber-600">(minor)</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {waiver.status === "SIGNED" && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-medium text-brand-blue hover:underline select-none">
                          View signed agreement
                        </summary>
                        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <pre className="whitespace-pre-wrap text-xs text-gray-600 font-sans leading-relaxed">
                            {waiver.agreementTextSnapshot}
                          </pre>
                          {waiver.ipAddress && (
                            <p className="mt-2 text-xs text-gray-400 border-t border-gray-200 pt-2">
                              IP: {waiver.ipAddress}
                            </p>
                          )}
                        </div>
                      </details>
                    )}
                  </li>
                );
              })}
              {waivers.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-gray-500">
                  No waivers yet.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <FileText size={18} weight="duotone" color="#1B2A4A" />
              Waiver Template
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <WaiverTemplateForm currentBody={templateMeta.body} resignRequiredAt={templateMeta.resignRequiredAt} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
