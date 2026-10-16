import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-4 text-5xl">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-500">
          You don't have permission to view this page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-brand-blue hover:underline"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
