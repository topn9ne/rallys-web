import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { WaiverTemplateForm } from "@/components/admin/WaiverTemplateForm";
import { getWaiverTemplate } from "@/server/actions/waiverTemplate";
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
  const [waivers, templateBody] = await Promise.all([
    prisma.waiver.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            customer: { select: { name: true, email: true } },
            slot: { select: { date: true, rideType: true, theme: { select: { name: true } } } },
          },
        },
      },
    }),
    getWaiverTemplate(),
  ]);

  const signed = waivers.filter((w) => w.status === "SIGNED").length;
  const pending = waivers.filter((w) => w.status === "PENDING").length;

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Waivers list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
                <Signature size={18} weight="duotone" color="#2B5CE6" />
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
              {waivers.map((waiver) => (
                <li key={waiver.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 truncate">
                          {waiver.booking.customer.name}
                        </p>
                        <Badge variant={waiver.status === "SIGNED" ? "green" : "amber"}>
                          {waiver.status === "SIGNED" ? "Signed" : "Pending"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500 truncate">
                        {waiver.booking.customer.email}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {waiver.booking.slot.rideType === "THEME" && waiver.booking.slot.theme
                          ? waiver.booking.slot.theme.name
                          : "Group Ride"}{" "}
                        · {formatDate(new Date(waiver.booking.slot.date))}
                      </p>
                      {waiver.status === "SIGNED" && waiver.signerName && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          Signed by <span className="font-medium">{waiver.signerName}</span>
                          {waiver.signedAt && <> · {formatDateTime(new Date(waiver.signedAt))}</>}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expandable snapshot */}
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
                            {waiver.signerDob && <> · DOB: {waiver.signerDob}</>}
                          </p>
                        )}
                      </div>
                    </details>
                  )}
                </li>
              ))}
              {waivers.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-gray-500">
                  No waivers yet.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        {/* Template editor */}
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <FileText size={18} weight="duotone" color="#2B5CE6" />
              Waiver Template
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <WaiverTemplateForm currentBody={templateBody} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
