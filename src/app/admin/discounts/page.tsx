import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCents } from "@/lib/utils";
import { DiscountForm } from "@/components/admin/DiscountForm";
import { DiscountToggle } from "@/components/admin/DiscountToggle";
import { DiscountDeleteButton } from "@/components/admin/DiscountDeleteButton";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { Tag, PlusCircle } from "@phosphor-icons/react/dist/ssr";

export default async function DiscountsPage() {
  const [codes, themes] = await Promise.all([
    prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.theme.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <SettingsTabs />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <Tag size={18} weight="duotone" color="#2B5CE6" />
              Codes ({codes.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100">
              {codes.map((code) => (
                <li key={code.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-blue-50 px-1.5 py-0.5 text-sm font-mono font-semibold text-brand-blue">
                          {code.code}
                        </code>
                        <Badge variant={code.active ? "green" : "gray"}>
                          {code.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {code.type === "PERCENT_OFF"
                          ? `${code.value}% off`
                          : `${formatCents(code.value)} off`}
                        {" · "}
                        {code.usesCount} used
                        {code.maxUses ? ` / ${code.maxUses}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DiscountToggle code={code} />
                      <DiscountDeleteButton id={code.id} code={code.code} />
                    </div>
                  </div>
                </li>
              ))}
              {codes.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-gray-500">
                  No discount codes yet.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
              <PlusCircle size={18} weight="duotone" color="#2B5CE6" />
              Add Code
            </h2>
          </CardHeader>
          <CardBody className="pb-6">
            <DiscountForm themes={themes} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
