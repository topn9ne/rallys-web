"use client";

import { useState, useTransition } from "react";
import { createShopCheckoutSession } from "@/server/actions/shopCheckout";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/utils";
import type { InRideUpsellItem } from "@prisma/client";

interface ShopUpsellFormProps {
  bikeId: string;
  items: InRideUpsellItem[];
  driverLabel: string;
}

const GRATUITY_PRESETS = [500, 1000, 2000, 3000]; // cents

export function ShopUpsellForm({ bikeId, items, driverLabel }: ShopUpsellFormProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [gratuityPreset, setGratuityPreset] = useState<number | null>(null);
  const [customGratuity, setCustomGratuity] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const gratuityAmountCents =
    gratuityPreset ??
    (customGratuity ? Math.round(parseFloat(customGratuity) * 100) : 0);

  const itemTotal = items
    .filter((i) => selectedItems.has(i.id))
    .reduce((sum, i) => sum + i.priceCents, 0);
  const total = itemTotal + (gratuityAmountCents || 0);

  function toggleItem(id: string) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (total === 0) {
      setError("Select at least one item or add a gratuity.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("bikeId", bikeId);
      fd.set("itemIds", JSON.stringify(Array.from(selectedItems)));
      fd.set("gratuityAmountCents", gratuityAmountCents.toString());
      const result = await createShopCheckoutSession(fd);
      if (result?.url) window.location.href = result.url;
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {items.length > 0 && (
        <div className="rounded-xl bg-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-700">
            <h2 className="font-semibold">Extras</h2>
          </div>
          <ul className="divide-y divide-gray-700">
            {items.map((item) => (
              <li key={item.id}>
                <label className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="h-5 w-5 rounded border-gray-600 text-brand-blue focus:ring-brand-blue bg-gray-700"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-400">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-brand-orange">
                    {formatCents(item.priceCents)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl bg-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700">
          <h2 className="font-semibold">{driverLabel}</h2>
          <p className="text-sm text-gray-400 mt-0.5">100% goes to your guide</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {GRATUITY_PRESETS.map((cents) => (
              <button
                key={cents}
                type="button"
                onClick={() => {
                  setGratuityPreset(gratuityPreset === cents ? null : cents);
                  setCustomGratuity("");
                }}
                className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                  gratuityPreset === cents
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {formatCents(cents)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">$</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Custom amount"
              value={customGratuity}
              onChange={(e) => {
                setCustomGratuity(e.target.value);
                setGratuityPreset(null);
              }}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand-blue focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-800 px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">Total</span>
          <span className="text-xl font-bold text-brand-orange">
            {formatCents(total)}
          </span>
        </div>
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <Button
          type="submit"
          loading={pending}
          size="lg"
          className="w-full"
          disabled={total === 0}
        >
          Pay Now
        </Button>
      </div>
    </form>
  );
}
