import { SignJWT, jwtVerify } from "jose";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET is required for shift token signing");
}
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

const EXPIRY = "7d";

export async function signShiftToken(staffId: string, slotId: string): Promise<string> {
  return new SignJWT({ staffId, slotId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret);
}

export async function verifyShiftToken(
  token: string
): Promise<{ staffId: string; slotId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const { staffId, slotId } = payload as { staffId: string; slotId: string };
    if (!staffId || !slotId) return null;
    return { staffId, slotId };
  } catch {
    return null;
  }
}
