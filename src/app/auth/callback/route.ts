import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account/bookings";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const existing = await prisma.member.findUnique({ where: { id: user.id } });
        if (!existing) {
          await prisma.member.create({
            data: {
              id: user.id,
              name: user.user_metadata?.name ?? "",
              email: user.email ?? "",
              phone: user.user_metadata?.phone ?? "",
              tier: "FAMILY",
              subscriptionStatus: "NONE",
            },
          });
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`);
}
