import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const FAILED_STATUSES = new Set(["failed", "undelivered"]);

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-twilio-signature") ?? "";
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`;
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    console.warn("[twilio/status] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const { MessageSid, MessageStatus, To, ErrorCode, ErrorMessage } = params;

  if (FAILED_STATUSES.has(MessageStatus)) {
    console.error(
      `[twilio/status] SMS ${MessageStatus}: sid=${MessageSid} to=${To} error=${ErrorCode} ${ErrorMessage ?? ""}`
    );
  }

  return NextResponse.json({ received: true });
}
