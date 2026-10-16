import { render } from "@react-email/render";
import { resend } from "@/lib/resend";
import { twilioClient, getTwilioFrom } from "@/lib/twilio";
import { prisma } from "@/lib/prisma";
import { formatCents, formatDate, formatTime } from "@/lib/utils";
import { BookingConfirmationEmail } from "./emails/BookingConfirmationEmail";
import { RideReminderEmail } from "./emails/RideReminderEmail";
import { CancellationEmail } from "./emails/CancellationEmail";
import { StaffInviteEmail } from "./emails/StaffInviteEmail";
import { PasswordResetEmail } from "./emails/PasswordResetEmail";
import { ShiftOpenEmail } from "./emails/ShiftOpenEmail";
import { OwnerAlertEmail } from "./emails/OwnerAlertEmail";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const FROM_EMAIL = "Railside Rides <hello@railsiderides.com>";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Fetches enabled/disabled state for all channel:audience combos for a trigger.
 * 1 DB query per notification function call. Missing rows default to enabled.
 */
async function getEnabledChannels(trigger: string): Promise<{ has: (key: string) => boolean }> {
  const configs = await prisma.notificationConfig.findMany({
    where: { trigger },
    select: { channel: true, audience: true, enabled: true },
  });
  const disabled = new Set<string>();
  for (const c of configs) {
    if (!c.enabled) disabled.add(`${c.channel}:${c.audience}`);
  }
  return { has: (key: string) => !disabled.has(key) };
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (err) {
    console.error(`[notifications] Failed to send email to ${to}:`, err);
  }
}

async function sendSms(to: string, body: string) {
  try {
    await twilioClient.messages.create({ from: getTwilioFrom(), to, body });
  } catch (err) {
    console.error(`[notifications] Failed to send SMS to ${to}:`, err);
  }
}

// ─── Booking Confirmed ────────────────────────────────────────────────────────

export async function notifyBookingConfirmed(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      slot: { include: { theme: true } },
    },
  });
  if (!booking) return;

  const enabled = await getEnabledChannels("booking_confirmed");
  const { customer, slot } = booking;
  const rideName =
    slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride";
  const waiverUrl = `${APP_URL}/waiver/${bookingId}`;

  // Customer email
  if (enabled.has("EMAIL:CUSTOMER")) {
    const html = await render(
      BookingConfirmationEmail({
        customerName: customer.name,
        rideName,
        rideDate: formatDate(slot.date),
        rideTime: `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`,
        pickupLocation: booking.pickupLocation,
        totalPaid: formatCents(booking.totalAmountCents),
        bookingId,
        waiverUrl,
        appUrl: APP_URL,
      })
    );
    await sendEmail(
      customer.email,
      `You're booked! ${rideName} on ${formatDate(slot.date)}`,
      html
    );
  }

  // Customer SMS (if opted in)
  if (customer.notificationSms && customer.phone && enabled.has("SMS:CUSTOMER")) {
    await sendSms(
      customer.phone,
      `Railside Rides: You're booked for ${rideName} on ${formatDate(slot.date)} at ${formatTime(slot.startTime)}! Sign your waiver: ${waiverUrl}`
    );
  }

  // Owner email
  if (enabled.has("EMAIL:OWNER")) {
    await notifyOwnerBookingConfirmed(bookingId, booking);
  }
}

// ─── Ride Reminder (24h before) ───────────────────────────────────────────────

export async function notifyRideReminder(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      slot: { include: { theme: true } },
      waiver: true,
    },
  });
  if (!booking) return;

  const enabled = await getEnabledChannels("ride_reminder");
  const { customer, slot, waiver } = booking;
  const rideName =
    slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride";
  const waiverSigned = waiver?.status === "SIGNED";
  const waiverUrl = `${APP_URL}/waiver/${bookingId}`;

  if (enabled.has("EMAIL:CUSTOMER")) {
    const html = await render(
      RideReminderEmail({
        customerName: customer.name,
        rideName,
        rideDate: formatDate(slot.date),
        rideTime: formatTime(slot.startTime),
        pickupLocation: booking.pickupLocation,
        pickupAddress: booking.pickupAddress ?? "",
        waiverSigned,
        waiverUrl,
      })
    );
    await sendEmail(
      customer.email,
      `Reminder: Your ${rideName} is tomorrow${!waiverSigned ? " — waiver needed!" : ""}`,
      html
    );
  }

  if (customer.notificationSms && customer.phone && enabled.has("SMS:CUSTOMER")) {
    const smsBody = waiverSigned
      ? `Railside Rides: Your ${rideName} is tomorrow at ${formatTime(slot.startTime)}. Pick-up: ${booking.pickupLocation}. See you there!`
      : `Railside Rides: Reminder — your ${rideName} is tomorrow. ⚠️ Waiver still needed: ${waiverUrl}`;
    await sendSms(customer.phone, smsBody);
  }
}

// ─── Unsigned Waiver Alert (2h before) ───────────────────────────────────────

export async function notifyUnsignedWaiver(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      slot: { include: { theme: true } },
      waiver: true,
    },
  });
  if (!booking || booking.waiver?.status === "SIGNED") return;

  const enabled = await getEnabledChannels("unsigned_waiver");
  const { customer, slot } = booking;
  const rideName =
    slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride";
  const waiverUrl = `${APP_URL}/waiver/${bookingId}`;

  if (enabled.has("EMAIL:CUSTOMER")) {
    await sendEmail(
      customer.email,
      `⚠️ Urgent: Sign your waiver before your ${rideName} today`,
      `<p>Hi ${customer.name},</p><p>Your ${rideName} starts in 2 hours and your waiver is still unsigned. You must sign it before boarding.</p><p><a href="${waiverUrl}">Sign Waiver Now</a></p>`
    );
  }

  if (customer.notificationSms && customer.phone && enabled.has("SMS:CUSTOMER")) {
    await sendSms(
      customer.phone,
      `URGENT: Railside Rides waiver unsigned. Your ride is in 2 hours. Sign now: ${waiverUrl}`
    );
  }
}

// ─── Booking Cancelled ────────────────────────────────────────────────────────

export async function notifyBookingCancelled(
  bookingId: string,
  refundAmountCents?: number,
  reason?: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      slot: { include: { theme: true } },
    },
  });
  if (!booking) return;

  const enabled = await getEnabledChannels("booking_cancelled");
  const { customer, slot } = booking;
  const rideName =
    slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride";

  if (enabled.has("EMAIL:CUSTOMER")) {
    const html = await render(
      CancellationEmail({
        customerName: customer.name,
        rideName,
        rideDate: formatDate(slot.date),
        rideTime: formatTime(slot.startTime),
        refundAmount: refundAmountCents ? formatCents(refundAmountCents) : undefined,
        reason,
      })
    );
    await sendEmail(customer.email, `Booking cancelled: ${rideName}`, html);
  }

  if (customer.notificationSms && customer.phone && enabled.has("SMS:CUSTOMER")) {
    await sendSms(
      customer.phone,
      `Railside Rides: Your ${rideName} booking on ${formatDate(slot.date)} has been cancelled.${refundAmountCents ? ` Refund of ${formatCents(refundAmountCents)} is processing.` : ""}`
    );
  }

  if (enabled.has("EMAIL:OWNER")) {
    await notifyOwnerBookingCancelled(bookingId, refundAmountCents, reason);
  }
}

// ─── Owner Alerts ─────────────────────────────────────────────────────────────

type BookingWithCustomerAndSlot = NonNullable<Awaited<ReturnType<typeof prisma.booking.findUnique>>> & {
  customer: { name: string; email: string };
  slot: { rideType: string; theme: { name: string } | null; date: Date; startTime: Date; endTime: Date };
};

export async function notifyOwnerBookingConfirmed(
  bookingId: string,
  prefetchedBooking?: BookingWithCustomerAndSlot
) {
  const admins = await prisma.staff.findMany({
    where: { role: "ADMIN", active: true },
    select: { email: true },
  });
  if (admins.length === 0) return;

  const booking = prefetchedBooking ?? await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, slot: { include: { theme: true } } },
  }) as BookingWithCustomerAndSlot | null;
  if (!booking) return;

  const rideName =
    booking.slot.rideType === "THEME" ? booking.slot.theme?.name ?? "Theme Ride" : "Group Ride";

  const html = await render(
    OwnerAlertEmail({
      eventType: "confirmed",
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      rideName,
      rideDate: formatDate(booking.slot.date),
      rideTime: `${formatTime(booking.slot.startTime)} – ${formatTime(booking.slot.endTime)}`,
      bookingId,
      totalPaid: formatCents(booking.totalAmountCents),
      adminBookingUrl: `${APP_URL}/admin/bookings`,
    })
  );

  const subject = `New booking: ${booking.customer.name} — ${rideName} on ${formatDate(booking.slot.date)}`;
  await Promise.all(admins.map((admin) => sendEmail(admin.email, subject, html)));
}

export async function notifyOwnerBookingCancelled(
  bookingId: string,
  refundAmountCents?: number,
  reason?: string
) {
  const admins = await prisma.staff.findMany({
    where: { role: "ADMIN", active: true },
    select: { email: true },
  });
  if (admins.length === 0) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, slot: { include: { theme: true } } },
  });
  if (!booking) return;

  const rideName =
    booking.slot.rideType === "THEME" ? booking.slot.theme?.name ?? "Theme Ride" : "Group Ride";

  const html = await render(
    OwnerAlertEmail({
      eventType: "cancelled",
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      rideName,
      rideDate: formatDate(booking.slot.date),
      rideTime: `${formatTime(booking.slot.startTime)} – ${formatTime(booking.slot.endTime)}`,
      bookingId,
      totalPaid: formatCents(booking.totalAmountCents),
      refundAmount: refundAmountCents ? formatCents(refundAmountCents) : undefined,
      reason,
      adminBookingUrl: `${APP_URL}/admin/bookings`,
    })
  );

  const subject = `Booking cancelled: ${booking.customer.name} — ${rideName} on ${formatDate(booking.slot.date)}`;
  await Promise.all(admins.map((admin) => sendEmail(admin.email, subject, html)));
}

// ─── Staff Invite ─────────────────────────────────────────────────────────────

export async function sendStaffInvite(email: string, name: string, role: string, token: string, phone?: string | null) {
  const inviteUrl = `${APP_URL}/auth/invite/${token}`;
  const html = await render(StaffInviteEmail({ name, inviteUrl, role }));
  await sendEmail(email, "You've been invited to join Railside Rides", html);

  if (phone) {
    await sendSms(
      phone,
      `Railside Rides: Hi ${name}, you've been invited to join the team! Set up your account: ${inviteUrl}`
    );
  }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordReset(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/auth/reset-password/${token}`;
  const html = await render(PasswordResetEmail({ name, resetUrl }));
  await sendEmail(email, "Reset your Railside Rides password", html);
}

// ─── Shift Assignment ─────────────────────────────────────────────────────────

export async function sendShiftAssigned(
  staff: { email: string; name: string; phone?: string | null },
  slot: { rideLabel: string; rideDate: string; rideTime: string; bike: string }
) {
  const subject = `You're scheduled: ${slot.rideLabel} on ${slot.rideDate}`;
  const html = `<p>Hi ${staff.name},</p>
<p>You've been assigned to the following ride:</p>
<ul>
  <li><strong>Ride:</strong> ${slot.rideLabel}</li>
  <li><strong>Date:</strong> ${slot.rideDate}</li>
  <li><strong>Time:</strong> ${slot.rideTime}</li>
  <li><strong>Bike:</strong> ${slot.bike}</li>
</ul>
<p>Questions? Reply to this email or contact an admin.</p>
<p>— Railside Rides</p>`;

  await sendEmail(staff.email, subject, html);

  if (staff.phone) {
    await sendSms(
      staff.phone,
      `Railside Rides: You're scheduled for ${slot.rideLabel} on ${slot.rideDate} at ${slot.rideTime} (${slot.bike}). Questions? Call us.`
    );
  }
}

// ─── Shift Open Broadcast ─────────────────────────────────────────────────────

export async function sendShiftOpenNotification(
  staff: { email: string; name: string; phone?: string | null },
  slot: { rideLabel: string; rideDate: string; rideTime: string; bike: string },
  interestUrl: string
) {
  const html = await render(
    ShiftOpenEmail({
      staffName: staff.name,
      rideLabel: slot.rideLabel,
      rideDate: slot.rideDate,
      rideTime: slot.rideTime,
      bike: slot.bike,
      interestUrl,
    })
  );
  await sendEmail(staff.email, `Shift open: ${slot.rideLabel} on ${slot.rideDate}`, html);

  if (staff.phone) {
    await sendSms(
      staff.phone,
      `Railside Rides: A shift is open — ${slot.rideLabel} on ${slot.rideDate} at ${slot.rideTime}. Available? ${interestUrl}`
    );
  }
}

// ─── Ride Today (Morning-of) ─────────────────────────────────────────────────

export async function notifyRideToday(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      slot: { include: { theme: true } },
      waiver: true,
    },
  });
  if (!booking) return;

  const enabled = await getEnabledChannels("ride_today");
  const { customer, slot, waiver } = booking;
  const rideName =
    slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride";
  const waiverSigned = waiver?.status === "SIGNED";
  const waiverUrl = `${APP_URL}/waiver/${bookingId}`;

  if (enabled.has("EMAIL:CUSTOMER")) {
    const html = await render(
      RideReminderEmail({
        customerName: customer.name,
        rideName,
        rideDate: formatDate(slot.date),
        rideTime: formatTime(slot.startTime),
        pickupLocation: booking.pickupLocation,
        pickupAddress: booking.pickupAddress ?? "",
        waiverSigned,
        waiverUrl,
      })
    );
    await sendEmail(
      customer.email,
      `Today's the day! ${rideName} at ${formatTime(slot.startTime)}`,
      html
    );
  }

  if (customer.notificationSms && customer.phone && enabled.has("SMS:CUSTOMER")) {
    const smsBody = waiverSigned
      ? `Railside Rides: Your ${rideName} is TODAY at ${formatTime(slot.startTime)}! Pick-up: ${booking.pickupLocation}. See you soon!`
      : `Railside Rides: Your ${rideName} is TODAY at ${formatTime(slot.startTime)}! ⚠️ Waiver still needed: ${waiverUrl}`;
    await sendSms(customer.phone, smsBody);
  }
}

// ─── Shift Reminder (Morning-of for Staff) ──────────────────────────────────

export async function sendShiftReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const assignments = await prisma.staffAssignment.findMany({
    where: {
      slot: { date: { gte: today, lt: tomorrow }, status: "AVAILABLE" },
    },
    include: {
      staff: true,
      slot: { include: { theme: true, bike: true } },
    },
  });

  console.log(`[cron] Sending shift reminders for ${assignments.length} assignments`);

  for (const a of assignments) {
    const rideLabel =
      a.slot.rideType === "THEME" ? a.slot.theme?.name ?? "Theme Ride" : "Group Ride";
    const rideTime = formatTime(a.slot.startTime);
    const bikeName = a.slot.bike.name;

    await sendEmail(
      a.staff.email,
      `Reminder: You're on ${rideLabel} today at ${rideTime}`,
      `<p>Hi ${a.staff.name},</p>
<p>Just a heads-up — you're assigned to the following ride today:</p>
<ul>
  <li><strong>Ride:</strong> ${rideLabel}</li>
  <li><strong>Time:</strong> ${rideTime}</li>
  <li><strong>Bike:</strong> ${bikeName}</li>
</ul>
<p>See you there!</p>
<p>— Railside Rides</p>`
    );

    if (a.staff.phone) {
      await sendSms(
        a.staff.phone,
        `Railside Rides: Reminder — you're on ${rideLabel} today at ${rideTime} (${bikeName}). See you there!`
      );
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  return { sent: assignments.length };
}

// ─── Daily Reminder Cron Job ──────────────────────────────────────────────────

/**
 * Called by /api/cron/reminders once daily at 8am.
 * Sends reminders for all confirmed bookings where the slot is tomorrow.
 */
export async function sendUpcomingRideReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      slot: { date: { gte: tomorrow, lt: dayAfter } },
    },
    select: { id: true },
  });

  console.log(`[cron] Sending reminders for ${bookings.length} bookings`);

  for (const booking of bookings) {
    await notifyRideReminder(booking.id);
    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 200));
  }

  return { sent: bookings.length };
}

/**
 * Called by /api/cron/ride-today once daily at 8am.
 * Sends morning-of reminders for all confirmed bookings where the slot is today.
 */
export async function sendRideTodayReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      slot: { date: { gte: today, lt: tomorrow } },
    },
    select: { id: true },
  });

  console.log(`[cron] Sending ride-today reminders for ${bookings.length} bookings`);

  for (const booking of bookings) {
    await notifyRideToday(booking.id);
    await new Promise((r) => setTimeout(r, 200));
  }

  // Owner daily summary
  await sendOwnerDailySummary();

  return { sent: bookings.length };
}

/**
 * Sends admins a morning-of summary: today's rides, booking counts, staff assignments.
 */
async function sendOwnerDailySummary() {
  const enabled = await getEnabledChannels("ride_today");
  if (!enabled.has("EMAIL:OWNER") && !enabled.has("SMS:OWNER")) return;

  const admins = await prisma.staff.findMany({
    where: { role: "ADMIN", active: true },
    select: { email: true, phone: true },
  });
  if (admins.length === 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const slots = await prisma.rideSlot.findMany({
    where: { date: { gte: today, lt: tomorrow }, status: "AVAILABLE" },
    include: {
      theme: true,
      bike: true,
      bookings: { where: { status: "CONFIRMED" }, select: { seats: true } },
      staffAssignments: { include: { staff: { select: { name: true } } } },
    },
    orderBy: { startTime: "asc" },
  });

  if (slots.length === 0) return;

  const totalBookings = slots.reduce((sum, s) => sum + s.bookings.length, 0);
  const totalSeats = slots.reduce((sum, s) => sum + s.bookings.reduce((ss, b) => ss + b.seats, 0), 0);

  // Build email HTML
  if (enabled.has("EMAIL:OWNER")) {
    const slotRows = slots
      .map((s) => {
        const label = s.rideType === "THEME" ? s.theme?.name ?? "Theme Ride" : "Group Ride";
        const time = formatTime(s.startTime);
        const booked = s.bookings.reduce((sum, b) => sum + b.seats, 0);
        const staff = s.staffAssignments.map((a) => a.staff.name).join(", ") || "None assigned";
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${time}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${s.bike.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${booked}/${s.seatsTotal}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${staff}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#2B5CE6;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;font-size:20px;margin:0">Railside Rides</h1>
        </div>
        <div style="padding:24px 32px;background:#fff">
          <h2 style="font-size:18px;color:#111827;margin:0 0 4px">Today's Lineup</h2>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px">${formatDate(today)} &mdash; ${slots.length} ride${slots.length === 1 ? "" : "s"}, ${totalBookings} booking${totalBookings === 1 ? "" : "s"}, ${totalSeats} seat${totalSeats === 1 ? "" : "s"}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
            <thead>
              <tr style="background:#f9fafb;text-align:left">
                <th style="padding:8px 12px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Ride</th>
                <th style="padding:8px 12px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Time</th>
                <th style="padding:8px 12px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Bike</th>
                <th style="padding:8px 12px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Seats</th>
                <th style="padding:8px 12px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Staff</th>
              </tr>
            </thead>
            <tbody>${slotRows}</tbody>
          </table>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px">
          <p style="font-size:12px;color:#9ca3af;margin:2px 0">Railside Rides &middot; Grand Island, NE</p>
        </div>
      </div>`;

    const subject = `Today's lineup: ${slots.length} ride${slots.length === 1 ? "" : "s"}, ${totalSeats} seats booked`;
    await Promise.all(admins.map((a) => sendEmail(a.email, subject, html)));
  }

  // Owner SMS
  if (enabled.has("SMS:OWNER")) {
    const slotSummaries = slots.map((s) => {
      const label = s.rideType === "THEME" ? s.theme?.name ?? "Theme" : "Group";
      const booked = s.bookings.reduce((sum, b) => sum + b.seats, 0);
      return `${label} ${formatTime(s.startTime)} (${booked}/${s.seatsTotal})`;
    });
    const smsBody = `Railside Rides: ${slots.length} ride${slots.length === 1 ? "" : "s"} today. ${slotSummaries.join(", ")}. Full details in your email.`;

    for (const admin of admins) {
      if (admin.phone) {
        await sendSms(admin.phone, smsBody);
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }
}

/**
 * Called by /api/cron/waiver-alerts — sends alerts for unsigned waivers 2h before ride.
 */
export async function sendUnsignedWaiverAlerts() {
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const twoHoursPlus15 = new Date(twoHoursFromNow.getTime() + 15 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      waiver: { status: { not: "SIGNED" } },
      slot: { startTime: { gte: twoHoursFromNow, lte: twoHoursPlus15 } },
    },
    select: { id: true },
  });

  for (const booking of bookings) {
    await notifyUnsignedWaiver(booking.id);
    await new Promise((r) => setTimeout(r, 200));
  }

  return { sent: bookings.length };
}

/**
 * Called by /api/cron/review-requests — runs daily at noon.
 * Sends post-ride review SMS to customers whose ride was yesterday.
 */
export async function sendPostRideReviewRequests() {
  const enabled = await getEnabledChannels("review_request");
  if (!enabled.has("SMS:CUSTOMER")) {
    console.log("[cron] Review request SMS disabled — skipping");
    return { sent: 0 };
  }

  const reviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? "https://railsiderides.com";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const today = new Date(yesterday);
  today.setDate(today.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      slot: { date: { gte: yesterday, lt: today } },
      customer: { notificationSms: true, phone: { not: null } },
    },
    include: { customer: true },
  });

  console.log(`[cron] Sending review requests for ${bookings.length} bookings`);

  for (const booking of bookings) {
    if (!booking.customer.phone) continue;
    await sendSms(
      booking.customer.phone,
      `Railside Rides: Hope you had a blast! If you did, we'd love a quick review — it helps more than you know: ${reviewUrl}`
    );
    await new Promise((r) => setTimeout(r, 200));
  }

  return { sent: bookings.length };
}
