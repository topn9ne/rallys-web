import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const ADMIN_EMAIL = "admin@rallysindoor.com";

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-twilio-signature") ?? "";
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`;
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    console.warn("[twilio/voice] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const { From } = params;
  console.log(`[twilio/voice] Inbound call from ${From}`);

  const response = twiml(
    `<Say voice="Google.en-US-Standard-J">` +
      `Thanks for calling Rally's Indoor Training. ` +
      `We're a self-service batting cage facility in Hastings, Nebraska. ` +
      `To book a cage session, visit rally's indoor dot com. ` +
      `To leave a message, wait for the beep.` +
    `</Say>` +
    `<Record maxLength="120" transcribe="true" transcribeCallback="/api/twilio/voice/transcription" />` +
    `<Say voice="Google.en-US-Standard-J">We didn't receive a message. Goodbye.</Say>`
  );

  return new NextResponse(response, {
    headers: { "Content-Type": "text/xml" },
  });
}

function twiml(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}
