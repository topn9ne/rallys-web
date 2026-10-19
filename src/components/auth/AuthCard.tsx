import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Rendered below the card (e.g. "Back to sign in" link). */
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="overflow-hidden rounded-[14px] shadow-[0_1px_2px_rgba(11,18,50,0.08),_0_8px_24px_rgba(11,18,50,0.18)]">
        <div className="relative bg-brand-blue px-8 pb-7 pt-7 text-center">
          <p className="font-script text-[38px] leading-none tracking-[-0.5px] text-white">
            Rally<span className="-ml-[5px]">&apos;s</span>
          </p>
          <div className="absolute inset-x-0 bottom-0 h-[5px] bg-brand-orange" />
        </div>
        <div className="space-y-5 bg-white p-8">
          {subtitle && subtitle !== "Rally's Indoor Training" && (
            <p className="text-center text-sm text-admin-text-sub">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
      {footer && <div className="text-center text-sm">{footer}</div>}
    </div>
  );
}
