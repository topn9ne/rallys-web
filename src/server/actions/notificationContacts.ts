"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toE164, isValidUSPhone } from "@/lib/phone";

const RELATIONSHIPS = ["Parent", "Player", "Coach", "Other"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getNotificationContacts() {
  const user = await requireUser();
  return prisma.notificationContact.findMany({
    where: { memberId: user.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });
}

export async function addNotificationContact(formData: FormData) {
  const user = await requireUser();

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const relationship = (formData.get("relationship") as string)?.trim() || "Other";
  const sendCodes = formData.get("sendCodes") === "on";
  const sendBookings = formData.get("sendBookings") === "on";
  const sendBilling = formData.get("sendBilling") === "on";
  const viaSms = formData.get("viaSms") === "on";
  const viaEmail = formData.get("viaEmail") === "on";

  if (!firstName) return { error: "First name is required." };
  if (!lastName) return { error: "Last name is required." };
  if (!phone && !email) return { error: "Phone or email is required." };
  if (phone && !isValidUSPhone(phone)) return { error: "Enter a valid 10-digit phone number." };
  if (email && !EMAIL_RE.test(email)) return { error: "Enter a valid email address." };

  await prisma.notificationContact.create({
    data: {
      memberId: user.id,
      firstName,
      lastName,
      phone: phone ? toE164(phone) : null,
      email,
      relationship,
      sendCodes,
      sendBookings,
      sendBilling,
      viaSms,
      viaEmail,
    },
  });

  revalidatePath("/account/profile");
  return { success: true };
}

export async function updateNotificationContact(formData: FormData) {
  const user = await requireUser();
  const contactId = formData.get("contactId") as string;

  const contact = await prisma.notificationContact.findFirst({
    where: { id: contactId, memberId: user.id },
  });
  if (!contact) return { error: "Contact not found." };
  if (contact.isPrimary) return { error: "Cannot edit the primary contact here." };

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const relationship = (formData.get("relationship") as string)?.trim() || "Other";
  const sendCodes = formData.get("sendCodes") === "on";
  const sendBookings = formData.get("sendBookings") === "on";
  const sendBilling = formData.get("sendBilling") === "on";
  const viaSms = formData.get("viaSms") === "on";
  const viaEmail = formData.get("viaEmail") === "on";

  if (!firstName) return { error: "First name is required." };
  if (!lastName) return { error: "Last name is required." };
  if (!phone && !email) return { error: "Phone or email is required." };
  if (phone && !isValidUSPhone(phone)) return { error: "Enter a valid 10-digit phone number." };
  if (email && !EMAIL_RE.test(email)) return { error: "Enter a valid email address." };

  await prisma.notificationContact.update({
    where: { id: contactId },
    data: { firstName, lastName, phone: phone ? toE164(phone) : null, email, relationship, sendCodes, sendBookings, sendBilling, viaSms, viaEmail },
  });

  revalidatePath("/account/profile");
  return { success: true };
}

export async function removeNotificationContact(formData: FormData) {
  const user = await requireUser();
  const contactId = formData.get("contactId") as string;

  const contact = await prisma.notificationContact.findFirst({
    where: { id: contactId, memberId: user.id },
  });
  if (!contact) return { error: "Contact not found." };
  if (contact.isPrimary) return { error: "Cannot remove the primary contact." };

  await prisma.notificationContact.delete({ where: { id: contactId } });

  revalidatePath("/account/profile");
  return { success: true };
}

export async function updateNotificationPreferences(formData: FormData) {
  const user = await requireUser();
  const contactId = formData.get("contactId") as string;

  const contact = await prisma.notificationContact.findFirst({
    where: { id: contactId, memberId: user.id },
  });
  if (!contact) return { error: "Contact not found." };

  await prisma.notificationContact.update({
    where: { id: contactId },
    data: {
      sendCodes: formData.get("sendCodes") === "on",
      sendBookings: formData.get("sendBookings") === "on",
      sendBilling: formData.get("sendBilling") === "on",
      viaSms: formData.get("viaSms") === "on",
      viaEmail: formData.get("viaEmail") === "on",
    },
  });

  revalidatePath("/account/profile");
  return { success: true };
}

export async function ensurePrimaryContact() {
  const user = await requireUser();
  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: { name: true, phone: true, email: true },
  });
  if (!member) return;

  const existing = await prisma.notificationContact.findFirst({
    where: { memberId: user.id, isPrimary: true },
  });

  if (!existing) {
    const parts = member.name.split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    await prisma.notificationContact.create({
      data: {
        memberId: user.id,
        firstName,
        lastName,
        phone: member.phone,
        email: member.email,
        relationship: "Self",
        isPrimary: true,
        sendCodes: true,
        sendBookings: true,
        sendBilling: true,
      },
    });
  }
}
