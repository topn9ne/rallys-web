"use client";

import { useState } from "react";
import type { FaqItem } from "@prisma/client";

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b"
      style={{ borderColor: "rgba(255,255,255,0.1)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg tracking-tight" style={{ color: "var(--color-landing-fg)" }}>
          {item.question}
        </span>
        <span
          className="flex-none text-xl font-light transition-transform duration-200"
          style={{
            color: "var(--color-landing-primary)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          className="pb-5 text-sm leading-relaxed"
          style={{ color: "var(--color-landing-fg)", opacity: 0.7 }}
        >
          {item.answer}
        </div>
      )}
    </div>
  );
}

export function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="px-6 pb-24 pt-6 md:px-14">
      <h2 className="mb-10 font-display text-5xl tracking-[-1px] sm:text-6xl lg:text-[64px]">
        GOOD{" "}
        <span style={{ color: "var(--color-landing-primary)" }}>QUESTIONS</span>
      </h2>
      <div className="max-w-3xl">
        {items.map((item) => (
          <FaqAccordionItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
