"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* clipboard unavailable; ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {done ? "Copied" : label}
    </button>
  );
}
