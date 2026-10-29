import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const ADMIN_PHONE = "+13083909955";
const OPEN_HOUR = 6; // 6 AM CST
const CLOSE_HOUR = 22; // 10 PM CST
const TIMEZONE = "America/Chicago";

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

  const isDuringHours = isBusinessHours();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const greeting = `<Play>${appUrl}/audio/greeting.mp3</Play>`;

  let inner: string;

  if (isDuringHours) {
    // During business hours: greet, ring cell for 25 seconds, then voicemail
    inner =
      greeting +
      `<Dial timeout="25" callerId="+18662825305" action="/api/twilio/voice/voicemail">` +
      `<Number>${ADMIN_PHONE}</Number>` +
      `</Dial>`;
  } else {
    // After hours: greet, straight to voicemail
    inner =
      greeting +
      `<Play>${appUrl}/audio/after-hours.mp3</Play>` +
      `<Record maxLength="120" transcribe="true" transcribeCallback="/api/twilio/voice/transcription" />` +
      `<Play>${appUrl}/audio/no-message.mp3</Play>`;
  }

  return new NextResponse(twiml(inner), {
    headers: { "Content-Type": "text/xml" },
  });
}

function isBusinessHours(): boolean {
  const now = new Date();
  const cst = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(now);
  const hour = parseInt(cst, 10);
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

function twiml(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}
