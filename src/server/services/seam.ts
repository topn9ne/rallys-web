import { prisma } from "@/lib/prisma";

const SEAM_API_BASE = "https://connect.getseam.com";

function getHeaders() {
  const key = process.env.SEAM_API_KEY;
  if (!key) throw new Error("SEAM_API_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function getDeviceId() {
  const id = process.env.SEAM_DEVICE_ID;
  if (!id) throw new Error("SEAM_DEVICE_ID is not set");
  return id;
}

function generatePin(existingPins: Set<string>): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    if (!existingPins.has(pin)) return pin;
  }
  for (let attempt = 0; attempt < 50; attempt++) {
    const pin = String(Math.floor(10000 + Math.random() * 90000));
    if (!existingPins.has(pin)) return pin;
  }
  throw new Error("Could not generate unique PIN after 100 attempts");
}

async function getActivePins(): Promise<Set<string>> {
  const active = await prisma.accessCode.findMany({
    where: { status: { in: ["SETTING", "ACTIVE"] } },
    select: { pin: true },
  });
  return new Set(active.map((a: { pin: string }) => a.pin));
}

export async function createAccessCode(bookingId: string): Promise<{
  seamAccessCodeId: string;
  pin: string;
}> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slotA: true },
  });
  if (!booking) throw new Error(`Booking ${bookingId} not found`);

  const existingCode = await prisma.accessCode.findUnique({
    where: { bookingId },
  });
  if (existingCode) {
    return { seamAccessCodeId: existingCode.seamAccessCodeId, pin: existingCode.pin };
  }

  const startsAt = new Date(booking.slotA.startTime.getTime() - 5 * 60 * 1000);
  const endsAt = new Date(booking.slotA.endTime.getTime() + 5 * 60 * 1000);

  const activePins = await getActivePins();
  const pin = generatePin(activePins);

  const res = await fetch(`${SEAM_API_BASE}/access_codes/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      device_id: getDeviceId(),
      name: `booking-${bookingId}`,
      code: pin,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      type: "time_bound",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[seam] Failed to create access code: ${res.status} ${body}`);
    throw new Error(`Seam API error: ${res.status}`);
  }

  const data = await res.json();
  const seamAccessCodeId = data.access_code?.access_code_id;
  if (!seamAccessCodeId) throw new Error("Seam response missing access_code_id");

  await prisma.accessCode.create({
    data: {
      seamAccessCodeId,
      pin,
      bookingId,
      type: "TIME_BOUND",
      startsAt,
      endsAt,
      status: "SETTING",
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { accessCodeId: seamAccessCodeId, accessCodePin: pin },
  });

  return { seamAccessCodeId, pin };
}

export async function deleteAccessCode(bookingId: string): Promise<void> {
  const code = await prisma.accessCode.findUnique({
    where: { bookingId },
  });
  if (!code) return;

  try {
    const res = await fetch(`${SEAM_API_BASE}/access_codes/delete`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ access_code_id: code.seamAccessCodeId }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[seam] Failed to delete access code: ${res.status} ${body}`);
    }
  } catch (err) {
    console.error("[seam] Error deleting access code:", err);
  }

  await prisma.accessCode.update({
    where: { id: code.id },
    data: { status: "REVOKED" },
  });
}

export async function markAccessCodeActive(seamAccessCodeId: string): Promise<void> {
  await prisma.accessCode.updateMany({
    where: { seamAccessCodeId, status: "SETTING" },
    data: { status: "ACTIVE" },
  });
}
