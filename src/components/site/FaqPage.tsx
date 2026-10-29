"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

const CATEGORIES: { label: string; items: FaqItem[] }[] = [
  {
    label: "Getting Started",
    items: [
      {
        q: "How does self-service work?",
        a: "Book a 1-hour slot online. You'll get a unique door code via text message before your session. Punch the code at the door, the cage is yours for an hour, and the code expires when your slot ends.",
      },
      {
        q: "Do I need a membership?",
        a: "Nope. Anyone can book a drop-in session. Memberships just give you a better rate and the ability to book further ahead.",
      },
      {
        q: "What ages can use the cages?",
        a: "All ages are welcome. Minors under 18 need a waiver signed by a parent or guardian, which can be completed online during booking.",
      },
      {
        q: "Is there a waiver?",
        a: "Yes. All users must have a signed waiver on file before their first session. You can complete it digitally during the booking process. Parents or guardians sign for anyone under 18.",
      },
    ],
  },
  {
    label: "Booking & Scheduling",
    items: [
      {
        q: "What are your hours?",
        a: "The facility is open 6 AM to 10 PM, seven days a week. You can book any available 1-hour slot within those hours.",
      },
      {
        q: "How far in advance can I book?",
        a: "Members can book further ahead than drop-in users. Exact booking windows are shown when you go to book a session.",
      },
      {
        q: "What if I need to cancel?",
        a: "You can cancel from your account page. Members can reschedule freely. Drop-in cancellation and refund policies are shown at checkout.",
      },
      {
        q: "Can I book back-to-back sessions?",
        a: "Yes, if the next slot is available you can book it. Each session is a separate 1-hour booking with its own door code.",
      },
    ],
  },
  {
    label: "The Facility",
    items: [
      {
        q: "What's the difference between single lane and both lanes?",
        a: "We have two batting lanes (A and B) separated by a removable center divider. A single-lane booking gives you one lane. Both-lanes booking removes the divider and gives your group the full facility — great for teams.",
      },
      {
        q: "Can I bring my own equipment?",
        a: "Absolutely. Bring your bat, helmet, gloves — whatever you need. We provide the pitching machines and balls.",
      },
      {
        q: "Do you have baseball and softball?",
        a: "Yes. Our pitching machines handle both baseball and softball. Balls for both are provided.",
      },
      {
        q: "Is there staff on site?",
        a: "No — that's the point. The facility is fully self-service. Your door code is your key. If you run into trouble, there's a support number posted inside.",
      },
    ],
  },
  {
    label: "Teams & Groups",
    items: [
      {
        q: "Can my team practice here?",
        a: "Yes. Book a both-lanes session and your team gets the full facility. Team memberships give you a flat monthly rate for unlimited both-lanes sessions.",
      },
      {
        q: "How many people can use the cages at once?",
        a: "A single-lane booking is great for one or two hitters. A both-lanes booking opens the full floor for your group — perfect for team batting practice.",
      },
    ],
  },
  {
    label: "Access & Door Codes",
    items: [
      {
        q: "How do I get my door code?",
        a: "Your unique door code is sent via text message before your session starts. It activates 15 minutes before your slot and expires 15 minutes after.",
      },
      {
        q: "Can I share my door code?",
        a: "Your code is for your booking party only. Do not share it with people outside your session. Unauthorized access may result in account suspension.",
      },
      {
        q: "What if I didn't get my code?",
        a: "Check your text messages — it comes from the number you registered with. If you still don't see it, contact support using the info posted at the facility entrance.",
      },
    ],
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

export function FaqPage() {
  return (
    <>
      <section className="bg-navy px-6 py-24 md:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="text-[13px] font-bold uppercase tracking-[2px] text-gold">
            FAQ
          </div>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-tight tracking-[-1px] text-white sm:text-5xl lg:text-[56px]">
            Good <span className="text-rally-red-bright">Questions</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Everything you need to know about booking, access, and using the
            facility.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-24 md:px-14">
        <div className="mx-auto max-w-3xl space-y-16">
          {CATEGORIES.map(({ label, items }) => (
            <div key={label}>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[1.5px] text-gold">
                {label}
              </h2>
              <div>
                {items.map((item) => (
                  <FaqAccordionItem key={item.q} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
