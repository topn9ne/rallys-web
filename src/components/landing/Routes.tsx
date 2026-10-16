import NextImage from "next/image";
import Link from "next/link";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { Placeholder } from "./Placeholder";

async function getThemes() {
  const now = new Date();
  const themes = await prisma.theme.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      photoUrl: true,
      rideSlots: {
        where: { date: { gte: now }, status: "AVAILABLE" },
        orderBy: { date: "asc" },
        take: 1,
        select: { id: true, date: true, startTime: true },
      },
    },
  });

  // Sort cards by closest upcoming date; themes with no slots go last
  return themes.sort((a, b) => {
    const aDate = a.rideSlots[0]?.date ?? null;
    const bDate = b.rideSlots[0]?.date ?? null;
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });
}

function formatSlotDate(date: Date, startTime: Date) {
  // Both stored as UTC representing intended local time — display in UTC to avoid double-shifting
  const datePart = new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const timePart = new Date(startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  return `${datePart} · ${timePart}`;
}

export async function Routes() {
  const themes = await getThemes();

  if (themes.length === 0) return null;

  return (
    <section className="px-6 pb-24 pt-6 md:px-14">
      <h2 className="m-0 mb-10 font-display text-5xl tracking-[-1px] sm:text-6xl lg:text-[64px]">
        JOIN A{" "}
        <span style={{ color: "var(--color-landing-primary)" }}>THEME RIDE</span>
      </h2>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme, i) => {
          const featured = i === 0;
          const slot = theme.rideSlots[0] ?? null;
          return (
            <div
              key={theme.id}
              className="relative p-7 transition-transform hover:-translate-y-0.5"
              style={{
                background: featured
                  ? "var(--color-landing-primary)"
                  : "rgba(255,255,255,0.08)",
                color: featured ? "#fff" : "var(--color-landing-fg)",
                border: featured
                  ? "1px solid var(--color-landing-primary)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
              }}
            >
              {/* Theme photo or placeholder */}
              <div className="relative mb-[22px] w-full overflow-hidden rounded-sm" style={{ aspectRatio: "4/3" }}>
                {theme.photoUrl ? (
                  <NextImage
                    src={theme.photoUrl}
                    alt={theme.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <Placeholder
                    label={`theme photo — ${theme.name.toLowerCase()}`}
                    ratio="4/3"
                    bg={featured ? "rgba(255,255,255,0.13)" : "var(--color-landing-bg)"}
                    stripe={featured ? "rgba(255,255,255,0.18)" : "rgba(74,123,255,0.13)"}
                    color={featured ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.53)"}
                  />
                )}
              </div>

              <div className="font-display text-[28px] leading-none uppercase tracking-[0.3px]">
                {theme.name}
              </div>
              {theme.description && (
                <div className="mt-1 text-sm opacity-75 leading-snug">
                  {theme.description}
                </div>
              )}
              <div className="mt-3">
                {slot ? (
                  <Link
                    href={`/book/${slot.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[13px] tracking-[0.5px] transition-opacity hover:opacity-80"
                    style={{
                      background: featured ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.12)",
                      color: featured ? "#fff" : "var(--color-landing-fg)",
                    }}
                  >
                    <CalendarBlank size={13} weight="bold" />
                    {formatSlotDate(slot.date, slot.startTime)}
                  </Link>
                ) : (
                  <div className="text-[11px] opacity-40">No upcoming dates</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
