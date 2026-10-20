import Link from "next/link";

export const metadata = { title: "Waiver Signed | Rally's Indoor Training" };

export default function MemberWaiverCompletePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-5xl font-bold text-green-600">&#10003;</div>
        <h1 className="text-2xl font-bold text-gray-900">Waiver Signed!</h1>
        <p className="mt-3 text-gray-500">
          Your participation waiver is on file. You&apos;re covered for all future
          sessions — no need to sign again unless our terms change.
        </p>
        <p className="mt-6 font-semibold text-brand-blue text-lg">
          Start a Rally!
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/book"
            className="rounded-lg bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Book a Session
          </Link>
          <Link
            href="/account/bookings"
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
