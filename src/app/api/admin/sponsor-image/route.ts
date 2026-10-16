import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/admin/sponsor-image?id=<sponsorId>
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing sponsor id" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (5 MB max)" }, { status: 400 });
  }

  const sponsor = await prisma.sponsor.findUnique({ where: { id } });
  if (!sponsor) return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });

  if (sponsor.logoUrl) {
    try { await del(sponsor.logoUrl); } catch { /* already gone */ }
  }

  const filename = `sponsors/${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const blob = await put(filename, file, { access: "public" });

  await prisma.sponsor.update({ where: { id }, data: { logoUrl: blob.url } });

  revalidatePath("/");
  revalidatePath("/admin/website/sponsors");
  return NextResponse.json({ url: blob.url });
}

// DELETE /api/admin/sponsor-image?id=<sponsorId>
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing sponsor id" }, { status: 400 });

  const sponsor = await prisma.sponsor.findUnique({ where: { id } });
  if (!sponsor) return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });

  if (sponsor.logoUrl) {
    try { await del(sponsor.logoUrl); } catch { /* already gone */ }
    await prisma.sponsor.update({ where: { id }, data: { logoUrl: "" } });
  }

  revalidatePath("/");
  revalidatePath("/admin/website/sponsors");
  return NextResponse.json({ ok: true });
}
