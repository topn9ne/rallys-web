import Link from "next/link";

interface WaiverStatusBannerProps {
  signed: boolean;
  needsResign: boolean;
}

export function WaiverStatusBanner({ signed, needsResign }: WaiverStatusBannerProps) {
  if (signed && !needsResign) return null;

  if (needsResign) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">Waiver Update Required</p>
            <p className="mt-0.5 text-sm text-amber-700">
              Our liability waiver has been updated. Please review and re-sign to continue booking.
            </p>
          </div>
          <Link
            href="/waiver/member"
            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Re-sign Waiver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-800">Waiver Required</p>
          <p className="mt-0.5 text-sm text-blue-700">
            Sign our liability waiver before your first session. It covers all future bookings.
          </p>
        </div>
        <Link
          href="/waiver/member"
          className="shrink-0 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Sign Waiver
        </Link>
      </div>
    </div>
  );
}
