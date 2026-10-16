import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_KEYS = ["hero_photo", "group_photo", "custom_hero_photo"];

// POST /api/admin/site-image?key=hero_photo|group_photo
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!VALID_KEYS.includes(key ?? "")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (12 MB max)" }, { status: 400 });
  }

  // Delete old blob if one exists
  const existing = await prisma.siteSetting.findUnique({ where: { key: key! } });
  if (existing?.value) {
    try { await del(existing.value); } catch { /* ignore if already gone */ }
  }

  const filename = `site/${key}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const blob = await put(filename, file, { access: "public" });

  await prisma.siteSetting.upsert({
    where: { key: key! },
    update: { value: blob.url },
    create: { key: key!, value: blob.url },
  });

  revalidatePath("/");
  revalidatePath("/custom");
  return NextResponse.json({ url: blob.url });
}

// DELETE /api/admin/site-image?key=hero_photo|group_photo
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!VALID_KEYS.includes(key ?? "")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const existing = await prisma.siteSetting.findUnique({ where: { key: key! } });
  if (existing?.value) {
    try { await del(existing.value); } catch { /* ignore */ }
    await prisma.siteSetting.delete({ where: { key: key! } });
  }

  revalidatePath("/");
  revalidatePath("/custom");
  return NextResponse.json({ ok: true });
}
