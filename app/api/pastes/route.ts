import { createPaste, getNow, MAX_CONTENT_LENGTH } from "@/lib/paste";

export const dynamic = "force-dynamic";

const isPositiveInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1;
const bad = (error: string) => Response.json({ error }, { status: 400 });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return bad("Body must be a JSON object");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return bad("Body must be valid JSON");
  }

  const { content, ttl_seconds, max_views } = body;

  if (typeof content !== "string" || content.trim() === "") {
    return bad("content is required and must be a non-empty string");
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return bad(`content must be at most ${MAX_CONTENT_LENGTH} characters`);
  }
  if (ttl_seconds !== undefined && ttl_seconds !== null && !isPositiveInt(ttl_seconds)) {
    return bad("ttl_seconds must be an integer >= 1");
  }
  if (max_views !== undefined && max_views !== null && !isPositiveInt(max_views)) {
    return bad("max_views must be an integer >= 1");
  }

  try {
    const id = await createPaste({
      content,
      ttlSeconds: (ttl_seconds as number | null | undefined) ?? undefined,
      maxViews: (max_views as number | null | undefined) ?? undefined,
      now: getNow(req.headers),
    });

    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const origin = host ? `${proto}://${host}` : new URL(req.url).origin;

    return Response.json({ id, url: `${origin}/p/${id}` }, { status: 201 });
  } catch (err) {
    console.error("create paste failed", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
