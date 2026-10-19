"use client";

import { useState } from "react";
import { SlotForm } from "@/components/admin/SlotForm";
import { BulkSlotForm } from "@/components/admin/BulkSlotForm";
import { CardHeader, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { CalendarPlus, CalendarDots, CalendarBlank } from "@phosphor-icons/react";

export function SlotFormTabs() {
  const [tab, setTab] = useState<"single" | "bulk">("bulk");

  return (
    <>
      <CardHeader className="px-8 py-5">
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 font-extrabold text-brand-blue">
            <CalendarPlus size={22} weight="duotone" color="#1B2A4A" />
            Create Slots
          </h2>

          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 self-start">
            <button
              onClick={() => setTab("bulk")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition-colors cursor-pointer",
                tab === "bulk"
                  ? "bg-brand-blue text-white"
                  : "bg-white text-gray-700 hover:text-brand-blue"
              )}
            >
              <CalendarDots size={18} weight={tab === "bulk" ? "fill" : "duotone"} />
              Multiple
            </button>
            <button
              onClick={() => setTab("single")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition-colors cursor-pointer border-l-2 border-gray-200",
                tab === "single"
                  ? "bg-brand-blue text-white"
                  : "bg-white text-gray-700 hover:text-brand-blue"
              )}
            >
              <CalendarBlank size={18} weight={tab === "single" ? "fill" : "duotone"} />
              Single
            </button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-8 pt-6 pb-8">
        {tab === "single" ? <SlotForm /> : <BulkSlotForm />}
      </CardBody>
    </>
  );
}
