import { prisma } from "@/lib/prisma";
import { HeroImageManager } from "@/components/admin/HeroImageManager";

export default async function HeroPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["hero_photo", "group_photo", "custom_hero_photo"] } },
  });

  const get = (key: string) => settings.find((s) => s.key === key)?.value ?? null;

  return (
    <HeroImageManager
      heroPhotoUrl={get("hero_photo")}
      groupPhotoUrl={get("group_photo")}
      customHeroPhotoUrl={get("custom_hero_photo")}
    />
  );
}
