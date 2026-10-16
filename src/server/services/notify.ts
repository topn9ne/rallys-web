import { twilioClient, getTwilioFrom } from "@/lib/twilio";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, formatCents } from "@/lib/utils";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const FROM_EMAIL = "Rally's Indoor Training <noreply@rallysindoor.com>";

// ── Low-level senders ────────────────────────────────────────────────────────

async function sendSms(to: string, body: string) {
  try {
    await twilioClient.messages.create({ from: getTwilioFrom(), to, body });
  } catch (err) {
    console.error(`[notify] SMS failed to ${to}:`, err);
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (err) {
    console.error(`[notify] Email failed to ${to}:`, err);
  }
}

// ── Booking confirmed (with door code) ───────────────────────────────────────

export async function notifyBookingConfirmed(bookingId: string, pin: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { member: true, slotA: true },
  });
  if (!booking) return;

  const phone = booking.guestPhone ?? booking.member?.phone;
  const email = booking.guestEmail ?? booking.member?.email;
  const name = booking.guestName ?? booking.member?.name ?? "there";
  const date = formatDate(booking.slotA.date);
  const time = formatTime(booking.slotA.startTime);
  const lane = booking.bookingType === "BOTH_LANES"
    ? "Both Lanes"
    : `Lane ${booking.slotA.lane}`;

  if (phone) {
    await sendSms(
      phone,
      `Rally's: You're booked for ${date} at ${time}, ${lane}. Door code: ${pin}. Code active 5 min before your slot. Start a Rally!`
    );
  }

  if (email) {
    await sendEmail(
      email,
      `Booking Confirmed — ${date} at ${time}`,
      bookingConfirmedHtml({ name, date, time, lane, pin, bookingId })
    );
  }
}

// ── Booking cancelled ────────────────────────────────────────────────────────

export async function notifyBookingCancelled(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { member: true, slotA: true },
  });
  if (!booking) return;

  const phone = booking.guestPhone ?? booking.member?.phone;
  const email = booking.guestEmail ?? booking.member?.email;
  const date = formatDate(booking.slotA.date);
  const time = formatTime(booking.slotA.startTime);

  if (phone) {
    await sendSms(
      phone,
      `Rally's: Your booking for ${date} at ${time} has been cancelled. If you were charged, your refund is being processed.`
    );
  }

  if (email) {
    await sendEmail(
      email,
      `Booking Cancelled — ${date} at ${time}`,
      `<p>Your Rally's booking for ${date} at ${time} has been cancelled.</p><p>If a refund is due, it will appear on your statement within 5–10 business days.</p>`
    );
  }
}

// ── New member welcome ───────────────────────────────────────────────────────

export async function notifyNewMember(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  if (member.phone) {
    await sendSms(
      member.phone,
      `Welcome to Rally's! Your membership is active. Book your first session: ${APP_URL}/book`
    );
  }

  if (member.email) {
    await sendEmail(
      member.email,
      "Welcome to Rally's Indoor Training!",
      welcomeHtml(member.name)
    );
  }
}

// ── Subscription alerts ──────────────────────────────────────────────────────

export async function notifyPaymentFailed(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  if (member.phone) {
    await sendSms(
      member.phone,
      `Rally's: Your membership payment failed. Update your payment method to keep booking: ${APP_URL}/account/membership`
    );
  }

  if (member.email) {
    await sendEmail(
      member.email,
      "Action Required — Payment Failed",
      `<p>Hey ${member.name},</p><p>Your Rally's membership payment didn't go through. Please <a href="${APP_URL}/account/membership">update your payment method</a> to keep your membership active.</p><p style="font-size:13px;color:#888;">Rally's Indoor Training</p>`
    );
  }
}

export async function notifySubscriptionCancelled(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  if (member.phone) {
    await sendSms(
      member.phone,
      `Rally's: Your membership has been cancelled. You can still book drop-in sessions anytime: ${APP_URL}/book`
    );
  }

  if (member.email) {
    await sendEmail(
      member.email,
      "Membership Cancelled",
      `<p>Hey ${member.name},</p><p>Your Rally's membership has been cancelled. You can still book drop-in cage sessions anytime at <a href="${APP_URL}/book">rallysindoor.com/book</a>.</p><p>If you'd like to resubscribe, visit your <a href="${APP_URL}/account/membership">membership page</a>.</p><p style="font-size:13px;color:#888;">Rally's Indoor Training</p>`
    );
  }
}

// ── Booking reminder (called by cron, e.g. 1 hour before) ───────────────────

export async function notifyBookingReminder(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { member: true, slotA: true },
  });
  if (!booking || booking.status !== "CONFIRMED") return;

  const phone = booking.guestPhone ?? booking.member?.phone;
  const time = formatTime(booking.slotA.startTime);
  const pin = booking.accessCodePin;

  if (phone && pin) {
    await sendSms(
      phone,
      `Rally's reminder: Your cage session is at ${time} today. Door code: ${pin}. See you soon!`
    );
  }
}

// ── Email HTML templates ─────────────────────────────────────────────────────

function bookingConfirmedHtml(data: {
  name: string;
  date: string;
  time: string;
  lane: string;
  pin: string;
  bookingId: string;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 24px; color: #1a1a1a;">You're Booked!</h1>
      <p>Hey ${data.name},</p>
      <p>Your cage session is confirmed:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="padding: 8px 0; font-weight: bold;">${data.date}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Time</td><td style="padding: 8px 0; font-weight: bold;">${data.time}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Location</td><td style="padding: 8px 0; font-weight: bold;">${data.lane}</td></tr>
      </table>
      <div style="background: #f0f7ff; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
        <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Your Door Code</p>
        <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #1a56db;">${data.pin}</p>
        <p style="margin: 8px 0 0; color: #666; font-size: 12px;">Active 5 min before your session</p>
      </div>
      <h3 style="font-size: 16px;">What to do</h3>
      <ol style="color: #444; line-height: 1.6;">
        <li>Enter your code on the keypad at the front door</li>
        <li>Set up the pitching machine to your preferred speed</li>
        <li>Hit! Your session is 30 minutes</li>
        <li>Leave the cage as you found it</li>
      </ol>
      <p style="font-size: 13px; color: #888; margin-top: 24px;">
        Rally's Indoor Training<br>
        203 S Woodland Ave, Bay 5, Hastings, NE 68901
      </p>
    </div>
  `;
}

function welcomeHtml(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 24px; color: #1a1a1a;">Welcome to Rally's!</h1>
      <p>Hey ${name},</p>
      <p>Your membership is now active. You can book 30-minute cage sessions anytime during operating hours (6 AM – 10 PM daily).</p>
      <p>Here's how it works:</p>
      <ol style="color: #444; line-height: 1.6;">
        <li>Book a session from the calendar</li>
        <li>You'll get a door code via text before your slot</li>
        <li>Enter the code on the keypad and you're in</li>
      </ol>
      <p>
        <a href="${APP_URL}/book" style="display: inline-block; background: #1a56db; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Book Your First Session
        </a>
      </p>
      <p style="font-size: 13px; color: #888; margin-top: 24px;">
        Rally's Indoor Training<br>
        203 S Woodland Ave, Bay 5, Hastings, NE 68901
      </p>
    </div>
  `;
}
