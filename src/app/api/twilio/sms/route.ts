import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const ADMIN_PHONE = "+13083909955";
const ADMIN_EMAIL = "admin@rallysindoor.com";

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-twilio-signature") ?? "";
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/sms`;
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    console.warn("[twilio/sms] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const { From, Body } = params;
  const upperBody = (Body ?? "").trim().toUpperCase();

  // Let Twilio's built-in STOP/HELP handling work — don't interfere
  if (["STOP", "CANCEL", "END", "QUIT", "UNSUBSCRIBE", "START", "YES", "HELP", "INFO"].includes(upperBody)) {
    return new NextResponse(twiml(""), { headers: { "Content-Type": "text/xml" } });
  }

  console.log(`[twilio/sms] Inbound from ${From}: ${Body}`);

  // Auto-reply to the sender
  const reply =
    "Thanks for reaching out to Rally's Indoor Training! " +
    "Book a session at rallysindoor.com/book or email admin@rallysindoor.com. " +
    "We'll get back to you shortly.";

  // Forward the message to admin via SMS
  const forward = `[Rally's] Inbound SMS from ${From}:\n${Body}`;

  const twimlResponse = twiml(
    `<Message>${escapeXml(reply)}</Message>` +
    `<Message to="${ADMIN_PHONE}">${escapeXml(forward)}</Message>`
  );

  return new NextResponse(twimlResponse, {
    headers: { "Content-Type": "text/xml" },
  });
}

function twiml(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
