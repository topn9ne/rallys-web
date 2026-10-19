import {
  Clock,
  Users,
  Sun,
  BaseballCap,
  LockKeyOpen,
  Barbell,
  Target,
} from "@phosphor-icons/react/dist/ssr";

const FEATURES = [
  { icon: Clock, text: "1-hour sessions" },
  { icon: BaseballCap, text: "Two lanes — hit solo or open up the full floor" },
  { icon: Target, text: "Pitching machines for baseball and softball" },
  { icon: Barbell, text: "Room to hit, field, throw, and work out" },
  { icon: Sun, text: "6 AM – 10 PM, every day" },
  { icon: Users, text: "Family and team options" },
  { icon: LockKeyOpen, text: "Open to everyone — no tryouts, no connections, no gatekeepers" },
];

export function WhatYouGet() {
  return (
    <section className="bg-white px-6 py-24 md:px-14">
      <div className="mx-auto max-w-3xl">
        <div className="text-xl text-gold">
          <span className="font-condensed font-extrabold uppercase">The</span> <span className="font-script text-[26px] pt-1 inline-block">Space</span>
        </div>
        <h2 className="mt-3 text-4xl uppercase leading-[0.95] tracking-[-1px] text-navy sm:text-5xl">
          <span className="font-semibold">Just the</span>{" "}
          <span className="font-black">Cage Time</span>
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
