"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const RELATIONSHIPS = ["Parent", "Player", "Coach", "Other"] as const;

export async function getNotificationContacts() {
  const user = await requireUser();
  return prisma.notificationContact.findMany({
    where: { memberId: user.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });
}

export async function addNotificationContact(formData: FormData) {
  const user = await requireUser();

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const relationship = (formData.get("relationship") as string)?.trim() || "Other";
  const sendCodes = formData.get("sendCodes") === "on";
  const sendBookings = formData.get("sendBookings") === "on";
  const sendBilling = formData.get("sendBilling") === "on";
  const viaSms = formData.get("viaSms") === "on";
  const viaEmail = formData.get("viaEmail") === "on";

  if (!name) return { error: "Name is required." };
  if (!phone && !email) return { error: "Phone or email is required." };

  await prisma.notificationContact.create({
    data: {
      memberId: user.id,
      name,
      phone,
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

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const relationship = (formData.get("relationship") as string)?.trim() || "Other";
  const sendCodes = formData.get("sendCodes") === "on";
  const sendBookings = formData.get("sendBookings") === "on";
  const sendBilling = formData.get("sendBilling") === "on";
  const viaSms = formData.get("viaSms") === "on";
  const viaEmail = formData.get("viaEmail") === "on";

  if (!name) return { error: "Name is required." };
  if (!phone && !email) return { error: "Phone or email is required." };

  await prisma.notificationContact.update({
    where: { id: contactId },
    data: { name, phone, email, relationship, sendCodes, sendBookings, sendBilling, viaSms, viaEmail },
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
    await prisma.notificationContact.create({
      data: {
        memberId: user.id,
        name: member.name,
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
