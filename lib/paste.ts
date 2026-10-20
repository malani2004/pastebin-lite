import { randomBytes } from "crypto";
import { ensureSchema, getSql } from "./db";

export const MAX_CONTENT_LENGTH = 500_000;

export type Paste = {
  content: string;
  expires_at: string | null;
  remaining_views: number | null;
};

/**
 * Current time. When TEST_MODE=1 and the request carries an
 * `x-test-now-ms` header (unix ms), that value is used instead,
 * so expiry can be tested without waiting.
 */
export function getNow(headers: Headers): Date {
  if (process.env.TEST_MODE === "1") {
    const raw = headers.get("x-test-now-ms");
    if (raw && /^\d+$/.test(raw)) return new Date(Number(raw));
  }
  return new Date();
}

export async function createPaste(input: {
  content: string;
  ttlSeconds?: number;
  maxViews?: number;
  now: Date;
}): Promise<string> {
  await ensureSchema();
  const sql = getSql();
  const id = randomBytes(6).toString("base64url");
  const expiresAt =
    input.ttlSeconds !== undefined
      ? new Date(input.now.getTime() + input.ttlSeconds * 1000).toISOString()
      : null;

  await sql`
    insert into pastes (id, content, expires_at, max_views)
    values (${id}, ${input.content}, ${expiresAt}::timestamptz, ${input.maxViews ?? null}::integer)`;
  return id;
}

/**
 * Fetches a paste AND counts the view in one atomic statement.
 * The WHERE clause rejects expired or exhausted pastes, so two concurrent
 * requests can never push `views` past `max_views`.
 * Returns null if the paste is missing, expired or out of views.
 */
export async function consumePaste(id: string, now: Date): Promise<Paste | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    update pastes
       set views = views + 1
     where id = ${id}
       and (expires_at is null or expires_at > ${now.toISOString()}::timestamptz)
       and (max_views is null or views < max_views)
 returning content, expires_at, max_views, views`;

  const row = rows[0];
  if (!row) return null;
  return {
    content: row.content as string,
    expires_at: row.expires_at ? new Date(row.expires_at as string).toISOString() : null,
    remaining_views:
      row.max_views === null ? null : (row.max_views as number) - (row.views as number),
  };
}
