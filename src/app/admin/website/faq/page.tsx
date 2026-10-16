import { prisma } from "@/lib/prisma";
import { FaqManager } from "@/components/admin/FaqManager";

export default async function FaqPage() {
  const items = await prisma.faqItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return <FaqManager items={items} />;
}
