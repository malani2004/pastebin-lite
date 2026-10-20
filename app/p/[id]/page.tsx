import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { consumePaste, getNow } from "@/lib/paste";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

export default async function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paste = await consumePaste(id, getNow(await headers()));
  if (!paste) notFound();

  const notes: string[] = [];
  if (paste.remaining_views !== null) {
    notes.push(`${paste.remaining_views} ${paste.remaining_views === 1 ? "view" : "views"} left`);
  }
  if (paste.expires_at) notes.push(`expires ${new Date(paste.expires_at).toUTCString()}`);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-medium text-accent hover:underline">
          New paste
        </Link>
        <CopyButton text={paste.content} label="Copy text" />
      </div>
      {/* Rendered as plain text by React, so HTML in a paste is never executed. */}
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-line bg-white p-5 font-mono text-sm leading-relaxed text-ink">
        {paste.content}
      </pre>
      {notes.length > 0 && <p className="mt-3 text-sm text-muted">{notes.join(" · ")}</p>}
    </main>
  );
}
