import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/admin/theme-image?id=<themeId>
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing theme id" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (12 MB max)" }, { status: 400 });
  }

  const theme = await prisma.theme.findUnique({ where: { id } });
  if (!theme) return NextResponse.json({ error: "Theme not found" }, { status: 404 });

  if (theme.photoUrl) {
    try { await del(theme.photoUrl); } catch { /* already gone */ }
  }

  const filename = `themes/${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const blob = await put(filename, file, { access: "public" });

  await prisma.theme.update({ where: { id }, data: { photoUrl: blob.url } });

  revalidatePath("/");
  revalidatePath("/admin/themes");
  return NextResponse.json({ url: blob.url });
}

// DELETE /api/admin/theme-image?id=<themeId>
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing theme id" }, { status: 400 });

  const theme = await prisma.theme.findUnique({ where: { id } });
  if (!theme) return NextResponse.json({ error: "Theme not found" }, { status: 404 });

  if (theme.photoUrl) {
    try { await del(theme.photoUrl); } catch { /* already gone */ }
    await prisma.theme.update({ where: { id }, data: { photoUrl: null } });
  }

  revalidatePath("/");
  revalidatePath("/admin/themes");
  return NextResponse.json({ ok: true });
}
