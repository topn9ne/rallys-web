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

// ── Helpers ──────────────────────────────────────────────────────────────────

// Transactional: door codes, confirmations, payment failures — always send
function memberPhone(member: { phone: string | null }): string | null {
  return member.phone || null;
}

// Non-critical: reminders, welcome — respect notificationSms preference
function memberPhoneIfOptedIn(member: { phone: string | null; notificationSms: boolean }): string | null {
  return member.notificationSms && member.phone ? member.phone : null;
}

// ── NotificationContact routing ─────────────────────────────────────────────

type ContactFlag = "sendCodes" | "sendBookings" | "sendBilling";

async function getContacts(memberId: string, flag: ContactFlag) {
  return prisma.notificationContact.findMany({
    where: { memberId, [flag]: true },
  });
}

async function notifyContacts(
  memberId: string,
  flag: ContactFlag,
  sms: string,
  emailSubject: string,
  emailHtml: string,
) {
  const contacts = await getContacts(memberId, flag);
  for (const c of contacts) {
    if (c.viaSms && c.phone) await sendSms(c.phone, sms);
    if (c.viaEmail && c.email) await sendEmail(c.email, emailSubject, emailHtml);
  }
}

// ── Booking confirmed (with door code) ───────────────────────────────────────
// TRANSACTIONAL — always send. They need the door code to enter.

export async function notifyBookingConfirmed(bookingId: string, pin: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { member: true, slotA: true },
  });
  if (!booking) return;

  const email = booking.guestEmail ?? booking.member?.email;
  const name = booking.guestName ?? booking.member?.name ?? "there";
  const date = formatDate(booking.slotA.date);
  const time = formatTime(booking.slotA.startTime);
  const lane = booking.bookingType === "BOTH_LANES"
    ? "Both Lanes"
    : `Lane ${booking.slotA.lane}`;

  const phone = booking.guestPhone
    ?? (booking.member ? memberPhone(booking.member) : null);

  if (phone) {
    await sendSms(
      phone,
      `Rally's: You're booked for ${date} at ${time}, ${lane}. Door code: ${pin}. Code active 15 min before your slot. Start a Rally!`
    );
  }

  if (email) {
    await sendEmail(
      email,
      `Booking Confirmed — ${date} at ${time}`,
      bookingConfirmedHtml({ name, date, time, lane, pin, bookingId })
    );
  }

  if (booking.memberId) {
    await notifyContacts(
      booking.memberId,
      "sendCodes",
      `Rally's: ${name}'s session — ${date} at ${time}, ${lane}. Door code: ${pin}. Code active 15 min before.`,
      `Door Code for ${name} — ${date} at ${time}`,
      bookingConfirmedHtml({ name, date, time, lane, pin, bookingId }),
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

  // TRANSACTIONAL — always send
  const phone = booking.guestPhone
    ?? (booking.member ? memberPhone(booking.member) : null);
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

  if (booking.memberId) {
    const cancelHtml = `<p>Rally's booking for ${date} at ${time} has been cancelled.</p>`;
    await notifyContacts(
      booking.memberId,
      "sendBookings",
      `Rally's: Booking for ${date} at ${time} has been cancelled.`,
      `Booking Cancelled — ${date} at ${time}`,
      cancelHtml,
    );
  }
}

// ── New member welcome ───────────────────────────────────────────────────────

export async function notifyNewMember(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  if (memberPhoneIfOptedIn(member)) {
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

export async function notifyMemberWaiverNeeded(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member?.email) return;

  await sendEmail(
    member.email,
    "Sign Your Participation Waiver",
    signWaiverHtml(member.name)
  );

  await notifyContacts(
    memberId,
    "sendBookings",
    `Rally's: ${member.name} needs to sign a participation waiver before their next session.`,
    `Waiver Needed — ${member.name}`,
    `<p>${member.name} needs to sign a participation waiver at Rally's before their next cage session.</p><p style="font-size:13px;color:#888;">Rally's Indoor Training</p>`,
  );
}

// ── Subscription alerts ──────────────────────────────────────────────────────

export async function notifyPaymentFailed(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  // TRANSACTIONAL — always send, they need to fix payment
  if (memberPhone(member)) {
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

  await notifyContacts(
    memberId,
    "sendBilling",
    `Rally's: ${member.name}'s membership payment failed. They may need to update their payment method.`,
    `Payment Failed — ${member.name}`,
    `<p>${member.name}'s Rally's membership payment didn't go through.</p><p style="font-size:13px;color:#888;">Rally's Indoor Training</p>`,
  );
}

export async function notifySubscriptionCancelled(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  // TRANSACTIONAL — account status change
  if (memberPhone(member)) {
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

  await notifyContacts(
    memberId,
    "sendBilling",
    `Rally's: ${member.name}'s membership has been cancelled.`,
    `Membership Cancelled — ${member.name}`,
    `<p>${member.name}'s Rally's membership has been cancelled.</p><p style="font-size:13px;color:#888;">Rally's Indoor Training</p>`,
  );
}

// ── Contact welcome (sent when a NotificationContact is first added) ────────

export async function notifyContactWelcome(contactId: string) {
  const contact = await prisma.notificationContact.findUnique({
    where: { id: contactId },
    include: { member: true },
  });
  if (!contact) return;

  const memberName = contact.member.name;
  const sms = `Rally's: You've been added as a notification contact for ${memberName}. You'll receive door codes and booking updates via text. Reply STOP to opt out.`;
  const subject = `You're a notification contact for ${memberName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 24px; color: #1a1a1a;">Hey ${contact.firstName}!</h1>
      <p>${memberName} added you as a notification contact at Rally's Indoor Training.</p>
      <p>Depending on their settings, you may receive:</p>
      <ul style="color: #444; line-height: 1.6;">
        ${contact.sendCodes ? "<li>Door codes for their cage sessions</li>" : ""}
        ${contact.sendBookings ? "<li>Booking confirmations and cancellations</li>" : ""}
        ${contact.sendBilling ? "<li>Billing and membership alerts</li>" : ""}
      </ul>
      <p style="font-size: 13px; color: #888; margin-top: 24px;">
        Rally's Indoor Training<br>
        203 S Woodland Ave, Bay 5, Hastings, NE 68901
      </p>
    </div>
  `;

  if (contact.viaSms && contact.phone) await sendSms(contact.phone, sms);
  if (contact.viaEmail && contact.email) await sendEmail(contact.email, subject, html);
}

// ── Waiver re-sign required (admin-triggered) ──────────────────────────────

export async function notifyWaiverResignRequired(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  // TRANSACTIONAL — required action before next session
  if (memberPhone(member)) {
    await sendSms(
      member.phone,
      `Rally's: Our participation waiver has been updated. Please re-sign before your next session: ${APP_URL}/waiver/member`
    );
  }

  if (member.email) {
    await sendEmail(
      member.email,
      "Action Required — Updated Waiver",
      resignWaiverHtml(member.name)
    );
  }

  await notifyContacts(
    memberId,
    "sendBookings",
    `Rally's: ${member.name} needs to re-sign an updated participation waiver before their next session.`,
    `Updated Waiver — ${member.name}`,
    `<p>${member.name} needs to re-sign an updated participation waiver at Rally's before their next cage session.</p><p style="font-size:13px;color:#888;">Rally's Indoor Training</p>`,
  );
}

// ── Booking reminder (called by cron, e.g. 1 hour before) ───────────────────

export async function notifyBookingReminder(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { member: true, slotA: true },
  });
  if (!booking || booking.status !== "CONFIRMED") return;

  // Reminders are non-critical — respect opt-in
  const phone = booking.guestPhone
    ?? (booking.member ? memberPhoneIfOptedIn(booking.member) : null);
  const time = formatTime(booking.slotA.startTime);
  const pin = booking.accessCodePin;

  if (phone && pin) {
    await sendSms(
      phone,
      `Rally's reminder: Your cage session is at ${time} today. Door code: ${pin}. See you soon!`
    );
  }

  if (booking.memberId && pin) {
    const name = booking.member?.name ?? "Member";
    await notifyContacts(
      booking.memberId,
      "sendCodes",
      `Rally's reminder: ${name}'s session is at ${time} today. Door code: ${pin}.`,
      `Session Reminder — ${time} today`,
      `<p>${name}'s Rally's session is at ${time} today. Door code: <strong>${pin}</strong></p><p style="font-size:13px;color:#888;">Rally's Indoor Training</p>`,
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
        <p style="margin: 8px 0 0; color: #666; font-size: 12px;">Active 15 min before your session</p>
      </div>
      <h3 style="font-size: 16px;">What to do</h3>
      <ol style="color: #444; line-height: 1.6;">
        <li>Enter your code on the keypad at the front door</li>
        <li>Set up the pitching machine to your preferred speed</li>
        <li>Hit! Your session is 1 hour</li>
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
      <p>Your membership is now active. You can book 1-hour cage sessions anytime during operating hours (6 AM – 10 PM daily).</p>
      <p>Here's how it works:</p>
      <ol style="color: #444; line-height: 1.6;">
        <li><strong>Sign your waiver</strong> — one-time, covers all future sessions</li>
        <li>Book a session from the calendar</li>
        <li>You'll get a door code via text before your slot</li>
        <li>Enter the code on the keypad and you're in</li>
      </ol>
      <p>
        <a href="${APP_URL}/waiver/member" style="display: inline-block; background: #1a56db; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Sign Waiver &amp; Book
        </a>
      </p>
      <p style="font-size: 13px; color: #888; margin-top: 24px;">
        Rally's Indoor Training<br>
        203 S Woodland Ave, Bay 5, Hastings, NE 68901
      </p>
    </div>
  `;
}

function signWaiverHtml(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 24px; color: #1a1a1a;">Sign Your Participation Waiver</h1>
      <p>Hey ${name},</p>
      <p>Before your first session, you'll need to sign our participation waiver. It only takes a minute and covers all your future sessions.</p>
      <p>
        <a href="${APP_URL}/waiver/member" style="display: inline-block; background: #1a56db; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Sign Waiver Now
        </a>
      </p>
      <p style="font-size: 13px; color: #888; margin-top: 24px;">
        Rally's Indoor Training<br>
        203 S Woodland Ave, Bay 5, Hastings, NE 68901
      </p>
    </div>
  `;
}

function resignWaiverHtml(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 24px; color: #1a1a1a;">Updated Participation Waiver</h1>
      <p>Hey ${name},</p>
      <p>Our participation waiver has been updated. Please review and re-sign it before your next session.</p>
      <p>
        <a href="${APP_URL}/waiver/member" style="display: inline-block; background: #1a56db; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Review &amp; Re-sign
        </a>
      </p>
      <p style="font-size: 13px; color: #888; margin-top: 24px;">
        Rally's Indoor Training<br>
        203 S Woodland Ave, Bay 5, Hastings, NE 68901
      </p>
    </div>
  `;
}
