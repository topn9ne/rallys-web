import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-twilio-signature") ?? "";
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice/voicemail`;
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    console.warn("[twilio/voice/voicemail] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const dialStatus = params.DialCallStatus;
  console.log(`[twilio/voice/voicemail] Dial status: ${dialStatus}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // If the call was answered, no voicemail needed
  if (dialStatus === "completed") {
    return new NextResponse(twiml(`<Hangup />`), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // No answer / busy / failed — play voicemail prompt
  const response = twiml(
    `<Play>${appUrl}/audio/missed-call.mp3</Play>` +
    `<Record maxLength="120" transcribe="true" transcribeCallback="/api/twilio/voice/transcription" />` +
    `<Play>${appUrl}/audio/no-message.mp3</Play>`
  );

  return new NextResponse(response, {
    headers: { "Content-Type": "text/xml" },
  });
}

function twiml(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}
