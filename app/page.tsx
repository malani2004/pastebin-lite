import PasteForm from "@/components/PasteForm";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Pastebin Lite</h1>
      <p className="mb-8 mt-2 max-w-prose text-muted">
        Paste text, get a link. Optionally let it expire after a set time or a number of views.
      </p>
      <PasteForm />
    </main>
  );
}
