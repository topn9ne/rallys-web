import { prisma } from "@/lib/prisma";
import { GalleryManager } from "@/components/admin/GalleryManager";

export default async function GalleryPage() {
  const photos = await prisma.galleryPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <GalleryManager
      initialPhotos={photos.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
