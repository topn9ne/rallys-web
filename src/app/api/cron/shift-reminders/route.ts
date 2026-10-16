import { NextRequest, NextResponse } from "next/server";
import { sendShiftReminders } from "@/server/services/notifications";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendShiftReminders();
  return NextResponse.json({ ok: true, ...result });
}
