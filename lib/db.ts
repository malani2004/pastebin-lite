import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;
let ready: Promise<void> | null = null;

// Lazy so that `next build` works without DATABASE_URL.
export function getSql() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

// Creates the table on first use, so a fresh database just works.
export function ensureSchema(): Promise<void> {
  if (!ready) {
    const sql = getSql();
    ready = sql`
      create table if not exists pastes (
        id         text primary key,
        content    text not null,
        created_at timestamptz not null default now(),
        expires_at timestamptz,
        max_views  integer,
        views      integer not null default 0
      )`.then(() => undefined);
    ready.catch(() => {
      ready = null; // allow a retry on the next request
    });
  }
  return ready;
}
