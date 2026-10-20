"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addPlayer(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "You must be signed in." };

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  if (!firstName) return { error: "First name is required." };
  if (!lastName) return { error: "Last name is required." };

  const dateOfBirth = (formData.get("dateOfBirth") as string)?.trim() || null;
  const positions = (formData.get("positions") as string)?.trim() || null;
  const school = (formData.get("school") as string)?.trim() || null;
  const travelTeam = (formData.get("travelTeam") as string)?.trim() || null;

  await prisma.player.create({
    data: {
      memberId: user.id,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      positions,
      school,
      travelTeam,
    },
  });

  revalidatePath("/account/players");
  return { success: true };
}

export async function updatePlayer(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "You must be signed in." };

  const playerId = formData.get("playerId") as string;
  if (!playerId) return { error: "Player ID is required." };

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { memberId: true },
  });
  if (!player || player.memberId !== user.id) {
    return { error: "Player not found." };
  }

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  if (!firstName) return { error: "First name is required." };
  if (!lastName) return { error: "Last name is required." };

  const dateOfBirth = (formData.get("dateOfBirth") as string)?.trim() || null;
  const positions = (formData.get("positions") as string)?.trim() || null;
  const school = (formData.get("school") as string)?.trim() || null;
  const travelTeam = (formData.get("travelTeam") as string)?.trim() || null;

  await prisma.player.update({
    where: { id: playerId },
    data: {
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      positions,
      school,
      travelTeam,
    },
  });

  revalidatePath("/account/players");
  return { success: true };
}

export async function removePlayer(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "You must be signed in." };

  const playerId = formData.get("playerId") as string;
  if (!playerId) return { error: "Player ID is required." };

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { memberId: true, _count: { select: { bookingPlayers: true } } },
  });
  if (!player || player.memberId !== user.id) {
    return { error: "Player not found." };
  }

  if (player._count.bookingPlayers > 0) {
    return { error: "Cannot remove a player with booking history. Contact support." };
  }

  await prisma.player.delete({ where: { id: playerId } });

  revalidatePath("/account/players");
  return { success: true };
}
