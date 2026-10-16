import { NextRequest, NextResponse } from "next/server";
import { sendUpcomingRideReminders } from "@/server/services/notifications";

export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendUpcomingRideReminders();
  return NextResponse.json({ ok: true, ...result });
}
