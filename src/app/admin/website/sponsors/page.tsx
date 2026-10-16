import { prisma } from "@/lib/prisma";
import { SponsorManager } from "@/components/admin/SponsorManager";

export default async function SponsorsPage() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return <SponsorManager sponsors={sponsors} />;
}
