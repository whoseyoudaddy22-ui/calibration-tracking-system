---
name: environment-setup
description: Steps and conventions for setting up or restoring the local dev environment for the Calibration Tracking System (Next.js + Prisma + SQLite). Use when initializing the project fresh, onboarding, or diagnosing a broken local environment.
---

# Environment Setup — Next.js + Prisma + SQLite

Reference for getting this project running locally. This project was
scaffolded with:

```bash
npx create-next-app@latest calibration-tracking-system \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Don't re-run `create-next-app` on the existing project — it already exists.
Use this skill to verify/restore a working local setup, not to re-scaffold.

## Stack versions in use

- Next.js 16 (App Router), React 19, TypeScript 5
- Prisma 7 with `@prisma/adapter-better-sqlite3` (SQLite datasource)
- Prisma client output is generated to `src/generated/prisma` (custom
  `output` in `prisma/schema.prisma`) — import from `@/generated/prisma/*`,
  not the default `@prisma/client` path.
- NextAuth.js v5 beta (credentials provider, role-based sessions)
- Tailwind CSS v4 via `@tailwindcss/postcss`

## First-time setup

1. Install dependencies: `npm install`
2. Ensure a `.env` exists with the SQLite connection (check
   `prisma/schema.prisma`'s `datasource db` block for the expected env var
   name — Prisma 7 + SQLite typically needs `DATABASE_URL="file:./dev.db"`).
   `dev.db` is gitignored, so a fresh clone has no database file yet.
3. Generate the Prisma client: `npx prisma generate`
4. Apply migrations to create `dev.db`: `npx prisma migrate dev`
5. Seed initial data (users, sample tools): `npm run db:seed`
   (runs `prisma/seed.ts` via `tsx`, per the `prisma.seed` field in
   `package.json`)
6. Start the dev server: `npm run dev`

## NextAuth configuration

- Auth config lives wherever `auth()` is exported from (`@/auth`, imported
  throughout pages/actions). Credentials provider checks username/password
  against the `User` table with `bcryptjs` for password hashing.
- Required env vars typically include `AUTH_SECRET` (NextAuth v5) — verify
  it's set in `.env` for both dev and any deployed environment; without it,
  sessions/JWTs won't sign correctly.
- Session's `user.role` (`Admin | Editor | Visitor`) is what all RBAC checks
  key off of — confirm the session callback actually attaches `role` from
  the `User` model when debugging access issues.

## Common local workflows

| Task | Command |
|---|---|
| Start dev server | `npm run dev` |
| Type-check / lint | `npm run lint` |
| Build for production | `npm run build` |
| Inspect/edit DB visually | `npx prisma studio` |
| Create a new migration after schema edit | `npx prisma migrate dev --name <description>` |
| Regenerate Prisma client after schema edit | `npx prisma generate` |
| Reset local DB (destructive) | `npx prisma migrate reset` |
| Reseed data | `npm run db:seed` |

## Notes / gotchas

- `dev.db` is intentionally untracked (see git history: "chore: stop
  tracking dev.db, gitignore it instead") — never commit it, and don't
  expect it to exist after a fresh clone.
- Because the Prisma client output path is customized
  (`src/generated/prisma`), stale generated types after a schema change
  usually mean `npx prisma generate` wasn't re-run — this is the first
  thing to check for confusing TypeScript errors referencing Prisma models.
- `npx prisma migrate reset` is destructive (drops and recreates the local
  DB) — confirm with the user before running it, per this project's general
  safety rules around destructive operations.
