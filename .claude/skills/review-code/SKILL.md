---
name: review-code
description: Reviews code changes in the Calibration Tracking System against this project's Next.js App Router / TypeScript conventions. Use whenever reviewing a diff, a new page/component/server action, or before considering a change complete.
---

# Code Review — Next.js / TypeScript Conventions

This project is Next.js (App Router) + TypeScript + Prisma + NextAuth.js.
Review changes against the conventions below, in addition to general
correctness. Flag violations; don't silently "fix" unrelated code while
reviewing.

## Server vs. client components

- Default to server components. Only add `"use client"` when the component
  needs interactivity, browser APIs, or React state/effects (see
  `AlertBannerClient.tsx` for the pattern: a server component fetches data,
  a thin client component handles interaction).
- Data fetching (`prisma.*`, `auth()`) belongs in server components or
  server actions — never call Prisma from a client component.
- Keep client components small and push data-fetching/session logic to the
  server parent, as done with `AlertBanner` → `AlertBannerClient`.

## Server actions & mutations

- Mutations (`createTool`, `updateTool`, `deleteTool`, etc.) live in a
  colocated `actions.ts` with `"use server"`, not inline in page files.
- Every mutating server action must re-check the caller's role via
  `auth()` server-side — do not trust that the UI hid the button. A
  Visitor or unauthenticated request hitting the action directly must be
  rejected.
- Validate and coerce form input (dates, required fields) before writing
  to Prisma; don't pass raw `FormData` values through untyped.

## Types & Prisma

- Use generated Prisma types (`@/generated/prisma/*`) instead of
  hand-rolled duplicate interfaces for `Tool`, `User`, `CalibrationHistory`.
- Avoid `any`; prefer the narrowed types already used in the codebase (e.g.
  the `status` discriminated union in `AlertBanner.tsx`).
- Schema changes require a corresponding Prisma migration — check that
  `prisma/schema.prisma` changes are paired with a migration file, not left
  to `db push` silently in production paths.

## Status/date logic

- Never reimplement the 🟢/🟡/🔴 threshold logic inline. Always import
  `getToolStatus`, `STATUS_LABEL`, `STATUS_BADGE_CLASS` from
  `src/lib/status.ts`. If a change needs different thresholds, update that
  one file, not call sites.
- Date handling should go through consistent formatting (`toLocaleDateString("th-TH")`
  for display, `toISOString().slice(0, 10)` for date input values) — check
  new code doesn't introduce a second date-formatting convention.

## Consistency with UI conventions

- Cross-check new UI against the `ui-design-system` skill (colors, spacing,
  component patterns) rather than inventing new Tailwind class combos.
- All user-facing strings are Thai; check new strings match existing
  terminology instead of introducing synonyms for the same concept.

## General correctness checklist

- Does every new route/action correctly enforce RBAC (Admin / Editor /
  Visitor) per the scope in `CLAUDE.md`?
- Are Prisma queries scoped correctly (no missing `where`, no N+1 query
  patterns when a single `findMany` with `include` would do)?
- Are error/empty states handled (e.g. "ยังไม่มีข้อมูลเครื่องมือ" pattern) for
  new lists/tables?
- Is there dead code, unused imports, or leftover debug statements?
- Do TypeScript types compile without `any`/`@ts-ignore` suppressions?

Report findings by severity (correctness/security issues first, then
convention deviations, then minor cleanup) rather than a flat list.
