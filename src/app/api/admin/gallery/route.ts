import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/gallery — list all photos
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const photos = await prisma.galleryPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(photos);
}

// POST /api/admin/gallery — upload a photo
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  // Validate size — 8 MB max
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (8 MB max)" }, { status: 400 });
  }

  const filename = `gallery/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const blob = await put(filename, file, { access: "public" });

  // Get current max sort order
  const max = await prisma.galleryPhoto.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (max._max.sortOrder ?? -1) + 1;

  const photo = await prisma.galleryPhoto.create({
    data: { url: blob.url, caption: caption || null, sortOrder: nextOrder },
  });

  revalidatePath("/");
  return NextResponse.json(photo, { status: 201 });
}

// PATCH /api/admin/gallery — reorder (accepts array of { id, sortOrder })
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updates: { id: string; sortOrder: number }[] = body.order ?? [];

  await prisma.$transaction(
    updates.map(({ id, sortOrder }) =>
      prisma.galleryPhoto.update({ where: { id }, data: { sortOrder } })
    )
  );

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
