import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateDiscountCode } from "@/server/queries/slots";
import { calcDiscount } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { code, rideType, themeId, baseAmountCents } = body;

  if (!code || !rideType || !baseAmountCents) {
    return NextResponse.json({ valid: false, reason: "Invalid request" }, { status: 400 });
  }

  const customerId = session?.user?.id ?? "__guest__";
  const result = await validateDiscountCode(code, rideType, themeId, customerId);

  if (!result.valid || !result.discount) {
    return NextResponse.json({ valid: false, reason: result.reason });
  }

  const discountAmountCents = calcDiscount(
    baseAmountCents,
    result.discount.type,
    result.discount.value
  );

  return NextResponse.json({
    valid: true,
    discountAmountCents,
    discountCodeId: result.discount.id,
  });
}
