"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authGuard";

export async function publishGallery() {
  await requireAdmin();
  revalidatePath("/");
}
