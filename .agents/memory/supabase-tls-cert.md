---
name: Supabase DB TLS cert issue
description: This project's DATABASE_URL points to an external Supabase pooler (aws-*.pooler.supabase.com), not Replit's managed Postgres. drizzle-kit and raw `pg` connections fail with a self-signed cert error.
---

Any tool that connects with the plain `pg` driver (drizzle-kit push, raw `pg.Pool`, libraries like `stripe-replit-sync` that build their own pool from `DATABASE_URL`) will fail with:

```
self-signed certificate in certificate chain
```

This is a TLS trust issue with the Supabase pooler's certificate — not a timeout, even though `drizzle-kit push` appears to hang at "Pulling schema from database...".

The app's actual runtime (`server/db.ts`) uses `@neondatabase/serverless` (websocket/HTTP-based), which does not hit this problem, so the running app works fine even though dev-time tooling fails.

**Why:** Confirmed root cause with a standalone `pg.Pool` connection test — same "self-signed certificate" error, ruling out a timeout/network issue.

**How to apply:**
- For one-off CLI commands (e.g. `drizzle-kit push`), prefix with `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- For any code that builds its own `pg` Pool/Client from `DATABASE_URL` (e.g. `stripe-replit-sync`'s `poolConfig`), pass `ssl: { rejectUnauthorized: false }` explicitly.
- Because `checkDatabase()` reports "not provisioned" for this external DB, the `database` skill's SQL tools cannot be used to inspect/apply schema directly — must go through `drizzle-kit push` (with the TLS workaround) instead.
