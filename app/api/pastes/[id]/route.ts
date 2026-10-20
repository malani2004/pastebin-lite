import { consumePaste, getNow } from "@/lib/paste";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const paste = await consumePaste(id, getNow(req.headers));
    if (!paste) return Response.json({ error: "Paste not found or no longer available" }, { status: 404 });
    return Response.json(paste, { status: 200 });
  } catch (err) {
    console.error("fetch paste failed", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
