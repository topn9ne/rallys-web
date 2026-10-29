import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { resend } from "@/lib/resend";

const ADMIN_EMAIL = "admin@rallysindoor.com";
const FROM_EMAIL = "Rally's Indoor Training <noreply@rallysindoor.com>";

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-twilio-signature") ?? "";
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice/transcription`;
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const { From, TranscriptionText, RecordingUrl } = params;

  console.log(`[twilio/voice] Voicemail from ${From}: ${TranscriptionText}`);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Voicemail from ${From}`,
      html:
        `<p><strong>From:</strong> ${From}</p>` +
        `<p><strong>Transcription:</strong> ${TranscriptionText ?? "(unavailable)"}</p>` +
        (RecordingUrl ? `<p><a href="${RecordingUrl}">Listen to recording</a></p>` : "") +
        `<p style="font-size:13px;color:#888;">Rally's Indoor Training — Voicemail notification</p>`,
    });
  } catch (err) {
    console.error("[twilio/voice] Failed to email voicemail:", err);
  }

  return NextResponse.json({ received: true });
}
