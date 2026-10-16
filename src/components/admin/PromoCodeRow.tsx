"use client";

import { Button } from "@/components/ui/Button";
import { togglePromoCode } from "@/server/actions/promoCodes";

interface PromoCodeData {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountAmount: number;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
}

export function PromoCodeRow({ code }: { code: PromoCodeData }) {
  const discount =
    code.discountType === "PERCENT"
      ? `${code.discountAmount}% off`
      : `$${(code.discountAmount / 100).toFixed(2)} off`;

  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-gray-900">
            {code.code}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
              code.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {code.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {discount}
          {code.maxUses !== null && ` · ${code.currentUses}/${code.maxUses} used`}
          {code.description && ` · ${code.description}`}
        </p>
      </div>
      <form action={async (formData: FormData) => {
        await togglePromoCode(formData);
      }}>
        <input type="hidden" name="id" value={code.id} />
        <Button variant="ghost" size="sm" type="submit">
          {code.isActive ? "Deactivate" : "Activate"}
        </Button>
      </form>
    </div>
  );
}
