import Link from "next/link";

export default function WaiverCompletePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-6xl">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900">You're all set!</h1>
        <p className="mt-3 text-gray-500">
          Your waiver has been signed and your ride is confirmed. We'll send you
          a reminder the day before with pick-up details.
        </p>
        <p className="mt-6 font-semibold text-brand-blue text-lg">
          See you at the ride! #RailsideGetsRowdy
        </p>
        <div className="mt-8">
          <Link
            href="/book"
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Book another ride
          </Link>
        </div>
      </div>
    </div>
  );
}
