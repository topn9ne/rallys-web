// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationChannel = "EMAIL" | "SMS";
export type NotificationAudience = "CUSTOMER" | "OWNER";

export type NotificationTrigger =
  | "booking_confirmed"
  | "booking_cancelled"
  | "session_reminder"
  | "session_today"
  | "unsigned_waiver"
  | "review_request";

export type ConfigKey = `${NotificationTrigger}:${NotificationChannel}:${NotificationAudience}`;
export type NotificationConfigMap = Record<ConfigKey, boolean>;

// ─── Definitions (static — UI metadata, not stored in DB) ────────────────────

export interface NotificationRow {
  channel: NotificationChannel;
  audience: NotificationAudience;
  subjectPreview: string;
  bodyPreview: string;
}

export interface NotificationDefinition {
  trigger: NotificationTrigger;
  label: string;
  description: string;
  rows: NotificationRow[];
}

// ─── Always-on definitions (transactional, no toggle) ────────────────────────

export interface AlwaysOnRow {
  channel: NotificationChannel;
  audience: "OWNER";
  subjectPreview?: string;
  bodyPreview: string;
}

export interface AlwaysOnDefinition {
  trigger: string;
  label: string;
  description: string;
  rows: AlwaysOnRow[];
}

export const ALWAYS_ON_DEFINITIONS: AlwaysOnDefinition[] = [
  {
    trigger: "password_reset",
    label: "Password Reset",
    description: "Sent when a member requests a password reset.",
    rows: [
      {
        channel: "EMAIL",
        audience: "OWNER",
        subjectPreview: "Reset your Rally's Indoor Training password",
        bodyPreview: "Click the link to reset your password. It expires in 1 hour.",
      },
    ],
  },
];

// ─── Configurable definitions ─────────────────────────────────────────────────

export const NOTIFICATION_DEFINITIONS: NotificationDefinition[] = [
  {
    trigger: "booking_confirmed",
    label: "Booking Confirmed",
    description: "Fires immediately after a Stripe checkout completes or a member reserves a slot.",
    rows: [
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "You're booked! {lane} on {sessionDate}",
        bodyPreview: "Your cage session is confirmed. Here are your details, door code, and a link to sign your waiver.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Rally's: You're booked for {lane} on {sessionDate} at {sessionTime}! Door code: {doorCode}. Sign waiver: {waiverUrl}",
      },
      {
        channel: "EMAIL",
        audience: "OWNER",
        subjectPreview: "New booking: {name} — {lane} on {sessionDate}",
        bodyPreview: "A new booking has been confirmed. Customer details, lane info, and a link to the booking in admin.",
      },
    ],
  },
  {
    trigger: "booking_cancelled",
    label: "Booking Cancelled",
    description: "Fires when an admin cancels or refunds a booking.",
    rows: [
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "Session cancelled: {lane} on {sessionDate}",
        bodyPreview: "Your session on {lane} on {sessionDate} has been cancelled. Refund details included if applicable.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Rally's: Your {lane} session on {sessionDate} has been cancelled.",
      },
      {
        channel: "EMAIL",
        audience: "OWNER",
        subjectPreview: "Booking cancelled: {name} — {lane} on {sessionDate}",
        bodyPreview: "A booking has been cancelled by admin. Customer and refund details included.",
      },
    ],
  },
  {
    trigger: "session_reminder",
    label: "Session Reminder (24h)",
    description: "Sent by cron at 8am the day before each confirmed session.",
    rows: [
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "Reminder: Your session is tomorrow",
        bodyPreview: "Your cage session is tomorrow at {sessionTime}. Door code and waiver status included.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Rally's: Your session is tomorrow at {sessionTime} on {lane}. Door code: {doorCode}",
      },
    ],
  },
  {
    trigger: "session_today",
    label: "Session Today (Morning-of)",
    description: "Sent by cron at 8am on the day of the session.",
    rows: [
      {
        channel: "EMAIL",
        audience: "OWNER",
        subjectPreview: "Today's lineup: {sessionCount} sessions scheduled",
        bodyPreview: "Summary of today's cage sessions with booking counts and schedule.",
      },
      {
        channel: "SMS",
        audience: "OWNER",
        subjectPreview: "SMS",
        bodyPreview: "Rally's: {sessionCount} sessions today. {summary}. Full details in your email.",
      },
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "Today's the day! Your session at {sessionTime}",
        bodyPreview: "Your cage session is today at {sessionTime}. Door code and session details included.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Rally's: Your session is TODAY at {sessionTime} on {lane}! Door code: {doorCode}. See you there!",
      },
    ],
  },
  {
    trigger: "unsigned_waiver",
    label: "Unsigned Waiver Alert (2h)",
    description: "Sent by cron when a waiver is still unsigned 2 hours before a session.",
    rows: [
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "Urgent: Sign your waiver before your session today",
        bodyPreview: "Your session starts in 2 hours and your waiver is still unsigned. You must sign before entering the facility.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "URGENT: Rally's waiver unsigned. Your session is in 2 hours. Sign now: {waiverUrl}",
      },
    ],
  },
  {
    trigger: "review_request",
    label: "Post-Session Review Request",
    description: "Sent by cron at noon the day after a session.",
    rows: [
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Rally's: Hope you had a great session! We'd love a quick review: {reviewUrl}",
      },
    ],
  },
];
