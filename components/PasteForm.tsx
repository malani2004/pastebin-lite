"use client";
import { useState } from "react";
import CopyButton from "./CopyButton";

const field =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-ink placeholder:text-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

export default function PasteForm() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [views, setViews] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUrl("");
    setBusy(true);
    try {
      const body: Record<string, unknown> = { content };
      if (ttl.trim()) body.ttl_seconds = Number(ttl);
      if (views.trim()) body.max_views = Number(views);

      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Something went wrong. Try again.");
      else setUrl(data.url);
    } catch {
      setError("Couldn’t reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Paste text</span>
        <textarea
          required
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste code, notes or anything else"
          className={`${field} font-mono text-sm`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Expire after (seconds)</span>
          <input
            type="number" min={1} step={1} inputMode="numeric"
            value={ttl} onChange={(e) => setTtl(e.target.value)}
            placeholder="Never" className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Limit views</span>
          <input
            type="number" min={1} step={1} inputMode="numeric"
            value={views} onChange={(e) => setViews(e.target.value)}
            placeholder="Unlimited" className={field}
          />
        </label>
      </div>

      <button
        type="submit" disabled={busy}
        className="rounded-md bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent/90 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {busy ? "Creating…" : "Create link"}
      </button>

      {error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {url && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-white p-3">
          <a href={url} className="min-w-0 flex-1 break-all font-mono text-sm text-accent hover:underline">
            {url}
          </a>
          <CopyButton text={url} label="Copy link" />
        </div>
      )}
    </form>
  );
}
