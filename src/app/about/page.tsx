import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Rally's Indoor Training",
  description:
    "Hastings' first self-service batting facility. Built for players and families who take their training seriously.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans">
      <SiteNav />

      {/* Hero */}
      <section className="bg-navy px-6 py-24 md:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="text-[13px] font-bold uppercase tracking-[2px] text-gold">
            About
          </div>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-tight tracking-[-1px] text-white sm:text-5xl lg:text-[56px]">
            Good Cage Time Shouldn&rsquo;t Be&nbsp;Hard&nbsp;to&nbsp;Find
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Rally&rsquo;s Indoor Training is Hastings&rsquo; first self-service
            batting facility &mdash; built for the players and families who take
            their training seriously.
          </p>
        </div>
      </section>

      {/* The Story */}
      <section className="bg-white px-6 py-24 md:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="text-xl text-gold">
            <span className="font-condensed font-extrabold uppercase">
              The
            </span>{" "}
            <span className="inline-block pt-1 font-script text-[26px]">
              Story
            </span>
          </div>
          <h2 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-[-1px] text-navy sm:text-4xl">
            A Shop Bay on Woodland&nbsp;Ave
          </h2>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-navy/80">
            <p>
              Every indoor training option in Hastings is behind a locked door
              and a favor. You need to know a coach, sit on a board, or have a
              friend with a key.
            </p>
            <p>
              Rally&rsquo;s started with a simple idea: what if anyone could book
              an hour of cage time, get a door code on their phone, and just go
              hit? No favors. No waiting lists. No calling around.
            </p>
            <p>
              Two batting lanes. Pitching machines for baseball and softball.
              Turf. Room to hit, field, and throw. It&rsquo;s not state-of-the-art
              &mdash; it&rsquo;s a place to put in work. And it&rsquo;s the first
              step toward something bigger.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-navy/5 px-6 py-24 md:px-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold uppercase leading-tight tracking-[-1px] text-navy sm:text-4xl">
            Fully Self-Service
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-navy/70">
            There&rsquo;s no front desk. No staff on site. Your door code is
            your key. Book online, show up when your slot starts, punch the code,
            and the cage is yours for an hour.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              {
                label: "Open Daily",
                detail: "6 AM – 10 PM, seven days a week",
              },
              {
                label: "1-Hour Sessions",
                detail: "Book a single lane or both lanes",
              },
              {
                label: "Code via Text",
                detail: "Unique door code delivered before your slot",
              },
              {
                label: "All Ages Welcome",
                detail: "Minors need a signed waiver from a parent",
              },
            ].map(({ label, detail }) => (
              <div
                key={label}
                className="rounded-lg border border-navy/10 bg-white px-5 py-4"
              >
                <div className="text-sm font-bold uppercase tracking-[1px] text-navy">
                  {label}
                </div>
                <div className="mt-1 text-sm leading-relaxed text-navy/60">
                  {detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Vision */}
      <section className="bg-navy px-6 py-24 md:px-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[13px] font-bold uppercase tracking-[2px] text-gold">
            The Vision
          </div>
          <h2 className="mt-4 text-3xl font-bold uppercase leading-tight tracking-[-1px] text-white sm:text-4xl">
            Built for Players Who Put&nbsp;in&nbsp;the&nbsp;Work
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Rally&rsquo;s exists because good cage time shouldn&rsquo;t depend on
            someone else&rsquo;s schedule. We built a facility where the door
            opens when you&rsquo;re ready &mdash; early morning, after practice,
            whatever works. No staff, no small talk, just reps.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/70">
            This is Hastings&rsquo; first self-service batting facility, and
            we&rsquo;re building it for the players and families who take their
            training seriously.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
