"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { StaffRole } from "@prisma/client";
import { sendStaffInvite, sendPasswordReset, sendShiftOpenNotification, sendShiftAssigned } from "@/server/services/notifications";
import { signShiftToken, verifyShiftToken } from "@/lib/shiftToken";
import { formatDate, formatTime } from "@/lib/utils";
import { requireAdmin } from "@/lib/authGuard";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// ─── Create Staff (sends invite email) ───────────────────────────────────────

const StaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  role: z.nativeEnum(StaffRole),
});

export async function createStaff(formData: FormData) {
  await requireAdmin();
  const result = StaffSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { name, email, phone, role } = result.data;

  const existing = await prisma.staff.findUnique({ where: { email } });
  if (existing) return { error: { email: ["A staff member with this email already exists"] } };

  const staff = await prisma.staff.create({
    data: { name, email: email.toLowerCase().trim(), phone: phone || null, role },
  });

  // Generate invite token (expires 48h)
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.staffToken.create({
    data: {
      staffId: staff.id,
      token,
      type: "INVITE",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  await sendStaffInvite(staff.email, staff.name, staff.role, token, staff.phone);

  revalidatePath("/admin/staff");
  return { success: true };
}

// ─── Redeem Invite ────────────────────────────────────────────────────────────

export async function redeemInvite(token: string, password: string) {
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const record = await prisma.staffToken.findUnique({
    where: { token },
    include: { staff: true },
  });

  if (!record || record.type !== "INVITE") return { error: "Invalid invite link." };
  if (record.usedAt) return { error: "This invite has already been used." };
  if (record.expiresAt < new Date()) return { error: "This invite link has expired. Ask an admin to resend it." };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.staff.update({ where: { id: record.staffId }, data: { passwordHash } }),
    prisma.staffToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { success: true };
}

// ─── Request Password Reset ───────────────────────────────────────────────────

export async function requestPasswordReset(email: string) {
  // Always return success to prevent email enumeration
  const staff = await prisma.staff.findUnique({
    where: { email: email.toLowerCase().trim(), active: true },
  });
  if (!staff) return { success: true };

  // Cooldown: one reset email per 5 minutes
  const recent = await prisma.staffToken.findFirst({
    where: {
      staffId: staff.id,
      type: "RESET",
      usedAt: null,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
    },
  });
  if (recent) return { success: true };

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.staffToken.create({
    data: {
      staffId: staff.id,
      token,
      type: "RESET",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  await sendPasswordReset(staff.email, staff.name, token);
  return { success: true };
}

// ─── Redeem Password Reset ────────────────────────────────────────────────────

export async function redeemReset(token: string, password: string) {
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const record = await prisma.staffToken.findUnique({
    where: { token },
    include: { staff: true },
  });

  if (!record || record.type !== "RESET") return { error: "Invalid reset link." };
  if (record.usedAt) return { error: "This reset link has already been used." };
  if (record.expiresAt < new Date()) return { error: "This reset link has expired. Request a new one." };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.staff.update({ where: { id: record.staffId }, data: { passwordHash } }),
    prisma.staffToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { success: true };
}

// ─── Broadcast Shift Open ─────────────────────────────────────────────────────

export async function broadcastShiftOpen(slotId: string) {
  await requireAdmin();
  const slot = await prisma.rideSlot.findUnique({
    where: { id: slotId },
    include: {
      theme: true,
      bike: true,
      staffAssignments: { select: { staffId: true } },
    },
  });
  if (!slot) return { error: "Slot not found" };

  const assignedIds = new Set(slot.staffAssignments.map((a) => a.staffId));

  const allStaff = await prisma.staff.findMany({
    where: { active: true },
  });

  const unassigned = allStaff.filter((s) => !assignedIds.has(s.id));
  if (unassigned.length === 0) return { success: true, notified: 0 };

  const rideLabel = slot.rideType === "THEME" ? slot.theme?.name ?? "Theme Ride" : "Group Ride";
  const rideDate = formatDate(slot.date);
  const rideTime = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`;
  const bike = slot.bike.name;

  let notified = 0;
  for (const staff of unassigned) {
    const token = await signShiftToken(staff.id, slotId);
    const interestUrl = `${APP_URL}/staff/shift/${slotId}/interest?token=${token}`;
    await sendShiftOpenNotification(
      { email: staff.email, name: staff.name, phone: staff.phone },
      { rideLabel, rideDate, rideTime, bike },
      interestUrl
    );
    notified++;
  }

  return { success: true, notified };
}

// ─── Record Shift Interest ────────────────────────────────────────────────────

export async function recordShiftInterest(staffId: string, slotId: string, token: string) {
  const payload = await verifyShiftToken(token);
  if (!payload || payload.staffId !== staffId || payload.slotId !== slotId) {
    return { error: "Invalid or expired token" };
  }
  await prisma.shiftInterest.upsert({
    where: { staffId_slotId: { staffId, slotId } },
    create: { staffId, slotId },
    update: {},
  });
  return { success: true };
}

// ─── Update Staff ─────────────────────────────────────────────────────────────

const UpdateStaffSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  role: z.nativeEnum(StaffRole),
});

export async function updateStaff(formData: FormData) {
  await requireAdmin();
  const result = UpdateStaffSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const { id, name, phone, role } = result.data;

  await prisma.staff.update({
    where: { id },
    data: { name, phone: phone || null, role },
  });

  revalidatePath("/admin/staff");
  return { success: true };
}

// ─── Toggle Staff Active ──────────────────────────────────────────────────────

export async function toggleStaffActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.staff.update({ where: { id }, data: { active } });
  revalidatePath("/admin/staff");
  return { success: true };
}

// ─── Delete Staff ─────────────────────────────────────────────────────────────

export async function deleteStaff(id: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.shiftInterest.deleteMany({ where: { staffId: id } }),
    prisma.staffAssignment.deleteMany({ where: { staffId: id } }),
    prisma.staffToken.deleteMany({ where: { staffId: id } }),
    prisma.staff.delete({ where: { id } }),
  ]);
  revalidatePath("/admin/staff");
  return { success: true };
}

// ─── Slot Staff Assignment ────────────────────────────────────────────────────

export async function assignStaffToSlot(slotId: string, staffId: string) {
  await requireAdmin();
  await prisma.staffAssignment.create({ data: { slotId, staffId } });
  // Remove any shift interest now that they're assigned
  await prisma.shiftInterest.deleteMany({ where: { slotId, staffId } });
  revalidatePath("/admin/schedule");

  // Notify the assigned staff member
  const [staff, slot] = await Promise.all([
    prisma.staff.findUnique({ where: { id: staffId }, select: { name: true, email: true, phone: true } }),
    prisma.rideSlot.findUnique({ where: { id: slotId }, include: { theme: true, bike: true } }),
  ]);

  if (staff && slot) {
    const rideLabel = slot.theme?.name ?? "Group Ride";
    const rideDate = formatDate(slot.date);
    const rideTime = formatTime(slot.startTime);
    const bike = slot.bike?.name ?? "Bike";
    sendShiftAssigned(staff, { rideLabel, rideDate, rideTime, bike }).catch((err) =>
      console.error("[assignStaffToSlot] Failed to send assignment notification:", err)
    );
  }

  return { success: true };
}

export async function unassignStaffFromSlot(slotId: string, staffId: string) {
  await requireAdmin();
  await prisma.staffAssignment.deleteMany({ where: { slotId, staffId } });
  revalidatePath("/admin/schedule");
  return { success: true };
}

export async function getSlotStaff(slotId: string) {
  await requireAdmin();
  const [assignments, allStaff, interests] = await Promise.all([
    prisma.staffAssignment.findMany({
      where: { slotId },
      include: { staff: true },
      orderBy: { assignedAt: "asc" },
    }),
    prisma.staff.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.shiftInterest.findMany({
      where: { slotId },
      include: { staff: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { assignments, allStaff, interests };
}

// ─── Resend Invite ────────────────────────────────────────────────────────────

export async function resendInvite(staffId: string) {
  await requireAdmin();
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) return { error: "Staff not found" };

  // Invalidate any existing unused invite tokens
  await prisma.staffToken.updateMany({
    where: { staffId, type: "INVITE", usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.staffToken.create({
    data: {
      staffId,
      token,
      type: "INVITE",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  await sendStaffInvite(staff.email, staff.name, staff.role, token, staff.phone);
  revalidatePath("/admin/staff");
  return { success: true };
}
