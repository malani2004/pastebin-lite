# Pastebin Lite

A small Pastebin-style app: create a text paste, get a shareable link, and view it later.
Pastes can optionally expire after a time limit, a view limit, or both.

Built with Next.js (App Router), TypeScript, Tailwind CSS and Neon Postgres. Deployed on Vercel.

Live: https://YOUR-APP.vercel.app

## Run locally

```bash
npm install
cp .env.example .env.local   # then set DATABASE_URL to your Neon connection string
npm run dev                  # http://localhost:3000
```

The `pastes` table is created automatically on first use (the SQL is also in `schema.sql`).

## API

| Method | Route | Description |
|---|---|---|
| GET | `/api/healthz` | `{ "ok": true }` when the database is reachable |
| POST | `/api/pastes` | Body `{ content, ttl_seconds?, max_views? }`. Returns `201 { id, url }`. Invalid input returns `400 { error }` |
| GET | `/api/pastes/:id` | Returns `{ content, remaining_views, expires_at }`. Counts as one view. Returns `404` if missing, expired or out of views |
| GET | `/p/:id` | HTML view of the paste. Also counts as one view; `404` page when unavailable |

`ttl_seconds` and `max_views` must be integers >= 1. `remaining_views` and `expires_at` are `null` when no limit is set.

## Design decisions

- **Persistence:** Neon Postgres. Serverless functions share no memory between invocations, so an in-memory store would lose pastes.
- **Atomic view counting:** one `UPDATE ... WHERE (not expired) AND (views < max_views) RETURNING ...` statement checks the limits and increments the counter together. Concurrent requests can never exceed `max_views`, and there is no read-then-write race.
- **One failure response:** expired, exhausted and unknown pastes all return 404, so a response doesn't reveal whether an id ever existed.
- **Safe rendering:** content is rendered as text by React, never as raw HTML, so a paste can't run scripts (XSS).
- **Testable time:** with `TEST_MODE=1`, an `x-test-now-ms` request header overrides the current time, so expiry can be tested without waiting. Without `TEST_MODE`, the header is ignored.
- **Unguessable ids:** 48 random bits from `crypto.randomBytes`, base64url encoded.
- **Input limits:** content is capped at 500,000 characters.

## Possible improvements

Rate limiting on paste creation, a background job to delete expired rows, and syntax highlighting.
