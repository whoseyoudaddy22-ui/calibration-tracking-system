---
description: Prepare and start the app locally for a customer demo (local-only — never deploy/expose this online without explicit customer go-live approval).
---

# Demo Start

Get the Calibration Tracking System running on **this local machine** for a
customer demo. This project has not been approved to go live — do not start
any tunnel, deploy, or public-facing service. Only run `npm run dev` bound to
localhost.

Follow these steps in order, stopping to report if any step fails instead of
skipping ahead:

0. **Check Node.js/npm are installed**: run `node -v` and `npm -v`. If
   either command is not found, Node.js is missing on this machine. Do
   **not** install it silently — this modifies the system, so tell the user
   Node.js/npm are missing and ask for explicit confirmation before
   proceeding. Once confirmed, install via the Windows package manager
   (trusted source, no manual installer download needed):
   ```
   winget install OpenJS.NodeJS.LTS
   ```
   After install, open a new shell (`PATH` needs to reload) and re-run
   `node -v` / `npm -v` to confirm before continuing to step 1.
1. **Check dependencies**: if `node_modules` is missing or looks stale
   relative to `package.json`, run `npm install`.
2. **Check `.env`**: confirm `DATABASE_URL`, `AUTH_SECRET`,
   `SEED_ADMIN_USERNAME`, and `SEED_ADMIN_PASSWORD` are present (see
   `.env` at the project root). Do not print secret values back verbatim in
   chat — just confirm they exist.
3. **Generate the Prisma client**: `npx prisma generate`
4. **Apply migrations**: `npx prisma migrate deploy` (use `migrate dev` only
   if there are unapplied schema changes still in development).
5. **Seed the demo admin user** (idempotent — skips if it already exists):
   `npm run db:seed`
6. **Start the dev server**: `npm run dev`, then report the local URL
   (default `http://localhost:3000`) and the admin login
   (`SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` from `.env`) so the demo
   presenter can log in.

After starting, remind whoever is running the demo:
- This instance is local-only; nothing here is exposed to the internet.
- Data entered during the demo lives in the local `dev.db` SQLite file and
  will persist across restarts unless `npx prisma migrate reset` is run.
- Do not commit `dev.db` or `.env` — both are gitignored intentionally.
