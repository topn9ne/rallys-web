import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  /** Count pill rendered next to the title — e.g. <span>(15)</span> becomes a subtle badge. */
  count?: number | null;
  /** Optional uppercase eyebrow above the title (mono, muted). */
  eyebrow?: string;
  /** Optional icon rendered left of the title. Expected a phosphor (or similar) node. */
  icon?: ReactNode;
  /** Optional subtitle below the title (Inter, muted). */
  subtitle?: ReactNode;
  /** Right-aligned action slot — e.g. primary CTA button(s). */
  action?: ReactNode;
  /** Extra classes on the root wrapper. */
  className?: string;
};

/**
 * Shared page header for /admin/* sub-routes. Uses Archivo Black display type
 * for the title so every page matches the dashboard greeting's voice.
 */
export function AdminPageHeader({
  title,
  count,
  eyebrow,
  icon,
  subtitle,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[2px] text-white/55">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-3">
          {icon && (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.08] text-white">
              {icon}
            </span>
          )}
          <h1 className="flex items-center gap-2.5 font-display text-[28px] leading-none tracking-[-0.5px] text-white">
            {title}
            {count !== undefined && count !== null && (
              <span className="rounded-full bg-white/[0.08] px-2.5 py-[3px] font-mono text-[11px] font-semibold tracking-[0.5px] text-white/70">
                {count}
              </span>
            )}
          </h1>
        </div>
        {subtitle && (
          <div className="mt-2 text-sm text-white/70">{subtitle}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
