import Link from "next/link";

export default function WaiverCompletePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-5xl font-bold text-green-600">&#10003;</div>
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re all set!</h1>
        <p className="mt-3 text-gray-500">
          Your waiver has been signed and your session is confirmed. You&apos;ll
          receive a door code via text before your booking time.
        </p>
        <p className="mt-6 font-semibold text-brand-blue text-lg">
          Start a Rally!
        </p>
        <div className="mt-8">
          <Link
            href="/book"
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Book another session
          </Link>
        </div>
      </div>
    </div>
  );
}
