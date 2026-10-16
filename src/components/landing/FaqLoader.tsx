import { prisma } from "@/lib/prisma";
import { FaqSection } from "./Faq";

export async function FaqLoader() {
  const items = await prisma.faqItem.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return <FaqSection items={items} />;
}
