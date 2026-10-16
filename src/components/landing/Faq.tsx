"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How does self-service work?",
    a: "Book a 30-minute slot online. You'll get a unique door code via text message before your session. Punch the code at the door, the cage is yours for 30 minutes, and the code expires when your slot ends.",
  },
  {
    q: "Do I need a membership?",
    a: "Nope. Anyone can book a drop-in session. Memberships just give you a better rate and the ability to book further ahead.",
  },
  {
    q: "What's the difference between single lane and both lanes?",
    a: "We have two batting lanes (A and B) separated by a removable center divider. A single-lane booking gives you one lane. Both-lanes booking removes the divider and gives your group the full facility — great for teams.",
  },
  {
    q: "Can I bring my own equipment?",
    a: "Absolutely. Bring your bat, helmet, gloves — whatever you need. We provide the pitching machines and balls.",
  },
  {
    q: "What if I need to cancel?",
    a: "You can cancel from your account page. Members can reschedule freely. Drop-in cancellation and refund policies are shown at checkout.",
  },
  {
    q: "Is there staff on site?",
    a: "No — that's the point. The facility is fully self-service. Your door code is your key. If you run into trouble, there's a support number posted inside.",
  },
  {
    q: "What ages can use the cages?",
    a: "All ages are welcome. Minors under 18 need a waiver signed by a parent or guardian, which can be completed online during booking.",
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-navy/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-lg font-semibold tracking-tight text-navy">
          {item.q}
        </span>
        <span
          className="flex-none text-xl font-light text-gold transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="pb-5 text-sm leading-relaxed text-navy/70">
          {item.a}
        </div>
      )}
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="bg-white px-6 py-24 md:px-14">
      <h2 className="mb-10 text-5xl font-bold uppercase tracking-[-1px] text-navy sm:text-6xl lg:text-[64px]">
        Good <span className="text-rally-red">Questions</span>
      </h2>
      <div className="max-w-3xl">
        {FAQS.map((item) => (
          <FaqAccordionItem key={item.q} item={item} />
        ))}
      </div>
    </section>
  );
}
