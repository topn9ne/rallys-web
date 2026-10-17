import {
  Clock,
  Users,
  Sun,
  BaseballCap,
  LockKeyOpen,
} from "@phosphor-icons/react/dist/ssr";

const FEATURES = [
  { icon: Clock, text: "1-hour sessions" },
  { icon: BaseballCap, text: "Two lanes — individual or full cage" },
  { icon: Sun, text: "6 AM – 10 PM daily" },
  { icon: Users, text: "Family and team options" },
  { icon: LockKeyOpen, text: "Open to everyone — no tryouts, no connections, no gatekeepers" },
];

export function WhatYouGet() {
  return (
    <section className="bg-white px-6 py-24 md:px-14">
      <div className="mx-auto max-w-3xl">
        <div className="text-[13px] font-bold uppercase tracking-[1.5px] text-gold">
          What You Get
        </div>
        <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.95] tracking-[-1px] text-navy sm:text-5xl">
          Just the Cage Time
        </h2>

        <ul className="mt-12 space-y-6">
          {FEATURES.map((f) => (
            <li key={f.text} className="flex items-start gap-4">
              <f.icon
                size={28}
                weight="bold"
                className="mt-0.5 shrink-0 text-rally-red"
              />
              <span className="text-lg text-navy/80">{f.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
