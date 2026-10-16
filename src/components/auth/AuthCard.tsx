import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Rendered below the card (e.g. "Back to sign in" link). */
  footer?: ReactNode;
};

/**
 * Shared shell for /auth/* pages — white card with brand mark on the navy
 * gradient bg provided by `src/app/auth/layout.tsx`. Matches the admin
 * dashboard's card spec: rounded-[14px], soft double-shadow.
 */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="space-y-5 rounded-[14px] bg-white p-8 shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.18)]">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-lg bg-admin-primary font-display text-[12px] tracking-[0.5px] text-white">
            RR
          </div>
          <h1 className="font-display text-[22px] leading-none tracking-[-0.3px] text-admin-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-admin-text-sub">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
      {footer && <div className="text-center text-sm">{footer}</div>}
    </div>
  );
}
