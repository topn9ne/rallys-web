// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationChannel = "EMAIL" | "SMS";
export type NotificationAudience = "CUSTOMER" | "OWNER";

export type NotificationTrigger =
  | "booking_confirmed"
  | "booking_cancelled"
  | "ride_reminder"
  | "ride_today"
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
  audience: "STAFF";
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
    trigger: "staff_invite",
    label: "Staff Invite",
    description: "Sent when a new staff member is invited to the platform.",
    rows: [
      {
        channel: "EMAIL",
        audience: "STAFF",
        subjectPreview: "You've been invited to join Railside Rides",
        bodyPreview: "Hi {name}, you've been invited as a {role}. Click the link to set your password and get started.",
      },
    ],
  },
  {
    trigger: "password_reset",
    label: "Password Reset",
    description: "Sent when a staff member requests a password reset.",
    rows: [
      {
        channel: "EMAIL",
        audience: "STAFF",
        subjectPreview: "Reset your Railside Rides password",
        bodyPreview: "Click the link to reset your password. It expires in 1 hour.",
      },
    ],
  },
  {
    trigger: "shift_reminder",
    label: "Shift Reminder (Morning-of)",
    description: "Sent at 7am on ride day to assigned staff.",
    rows: [
      {
        channel: "EMAIL",
        audience: "STAFF",
        subjectPreview: "Reminder: You're on {rideLabel} today at {rideTime}",
        bodyPreview: "Hi {name}, just a heads-up — you're assigned to {rideLabel} today at {rideTime} on {bike}.",
      },
      {
        channel: "SMS",
        audience: "STAFF",
        bodyPreview: "Railside Rides: Reminder — you're on {rideLabel} today at {rideTime} ({bike}). See you there!",
      },
    ],
  },
  {
    trigger: "shift_open",
    label: "Shift Open",
    description: "Sent to staff when a ride slot is published and open for interest.",
    rows: [
      {
        channel: "EMAIL",
        audience: "STAFF",
        subjectPreview: "Shift open: {rideLabel} on {rideDate}",
        bodyPreview: "A new shift is available. Click to indicate your interest.",
      },
      {
        channel: "SMS",
        audience: "STAFF",
        bodyPreview: "Railside Rides: A shift is open — {rideLabel} on {rideDate} at {rideTime}. Available? {interestUrl}",
      },
    ],
  },
];

// ─── Configurable definitions ─────────────────────────────────────────────────

export const NOTIFICATION_DEFINITIONS: NotificationDefinition[] = [
  {
    trigger: "booking_confirmed",
    label: "Booking Confirmed",
    description: "Fires immediately after a Stripe checkout completes.",
    rows: [
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "You're booked! {rideName} on {rideDate}",
        bodyPreview: "Your reservation is confirmed. Here are your ride details and a link to sign your waiver.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Railside Rides: You're booked for {rideName} on {rideDate} at {rideTime}! Sign your waiver: {waiverUrl}",
      },
      {
        channel: "EMAIL",
        audience: "OWNER",
        subjectPreview: "New booking: {customerName} — {rideName} on {rideDate}",
        bodyPreview: "A new booking has been confirmed. Customer details, ride info, and a link to the booking in admin.",
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
        subjectPreview: "Booking cancelled: {rideName}",
        bodyPreview: "Your booking for {rideName} on {rideDate} has been cancelled. Refund details included if applicable.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Railside Rides: Your {rideName} booking on {rideDate} has been cancelled.",
      },
      {
        channel: "EMAIL",
        audience: "OWNER",
        subjectPreview: "Booking cancelled: {customerName} — {rideName} on {rideDate}",
        bodyPreview: "A booking has been cancelled by admin. Customer and refund details included.",
      },
    ],
  },
  {
    trigger: "ride_reminder",
    label: "Ride Reminder (24h)",
    description: "Sent by cron at 8am the day before each confirmed ride.",
    rows: [
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "Reminder: Your {rideName} is tomorrow",
        bodyPreview: "Just a heads-up — your ride is tomorrow at {rideTime}. Waiver status and pickup details included.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Railside Rides: Your {rideName} is tomorrow at {rideTime}. Pick-up: {pickupLocation}.",
      },
    ],
  },
  {
    trigger: "ride_today",
    label: "Ride Today (Morning-of)",
    description: "Sent by cron at 8am on the day of the ride.",
    rows: [
      {
        channel: "EMAIL",
        audience: "OWNER",
        subjectPreview: "Today's lineup: {rideCount} rides scheduled",
        bodyPreview: "Summary of today's rides with booking counts, staff assignments, and schedule.",
      },
      {
        channel: "SMS",
        audience: "OWNER",
        subjectPreview: "SMS",
        bodyPreview: "Railside Rides: {rideCount} rides today. {summary}. Full details in your email.",
      },
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "Today's the day! {rideName} at {rideTime}",
        bodyPreview: "Your {rideName} is today at {rideTime}. Ride details and pick-up info included.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Railside Rides: Your {rideName} is TODAY at {rideTime}! Pick-up: {pickupLocation}. See you soon!",
      },
    ],
  },
  {
    trigger: "unsigned_waiver",
    label: "Unsigned Waiver Alert (2h)",
    description: "Sent by cron when a waiver is still unsigned 2 hours before a ride.",
    rows: [
      {
        channel: "EMAIL",
        audience: "CUSTOMER",
        subjectPreview: "⚠️ Urgent: Sign your waiver before your {rideName} today",
        bodyPreview: "Your {rideName} starts in 2 hours and your waiver is still unsigned. You must sign before boarding.",
      },
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "URGENT: Railside Rides waiver unsigned. Your ride is in 2 hours. Sign now: {waiverUrl}",
      },
    ],
  },
  {
    trigger: "review_request",
    label: "Post-Ride Review Request",
    description: "Sent by cron at noon the day after a ride.",
    rows: [
      {
        channel: "SMS",
        audience: "CUSTOMER",
        subjectPreview: "SMS",
        bodyPreview: "Railside Rides: Hope you had a blast! We'd love a quick review: {reviewUrl}",
      },
    ],
  },
];
