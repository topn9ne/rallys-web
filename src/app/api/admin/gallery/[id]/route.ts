import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE /api/admin/gallery/[id] — delete a photo
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from Blob storage
  await del(photo.url);

  // Delete from DB
  await prisma.galleryPhoto.delete({ where: { id } });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/gallery/[id] — update caption
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { caption } = await req.json();

  const photo = await prisma.galleryPhoto.update({
    where: { id },
    data: { caption },
  });

  return NextResponse.json(photo);
}
