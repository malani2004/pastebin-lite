import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-2xl font-semibold text-ink">This paste isn’t available</h1>
      <p className="mt-3 text-muted">
        It may have expired, reached its view limit, or the link may be wrong.
      </p>
      <Link href="/" className="mt-6 inline-block font-medium text-accent hover:underline">
        Create a new paste
      </Link>
    </main>
  );
}
