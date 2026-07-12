---
name: ui-design-system
description: Defines the visual design system (colors, typography, spacing, component conventions) for the Calibration Tracking System, derived from the existing dashboard, tool management, and alert banner pages. Use this skill whenever building or editing any page, component, or layout in this project so every screen stays visually consistent.
---

# UI Design System — Calibration Tracking System

This system codifies the conventions already established in the built pages
(`src/app/dashboard`, `src/app/tools/manage`, `src/components/AlertBanner*`,
`src/components/Nav.tsx`). Follow it for every new page or component so the
app doesn't accumulate inconsistent one-off styling. There is no separate
mockup file — this document *is* the reference.

## Layout

- Page wrapper: `min-h-screen bg-gray-50 p-8`
- Content container: `mx-auto max-w-5xl space-y-6` (use `space-y-8` when a
  page has multiple heavy sections, as in `tools/manage`)
- Every page starts with `<Nav role={session?.user.role} />` immediately
  inside the content container, followed by an `<h1>`.

## Typography

- Page title (`h1`): `text-2xl font-semibold text-gray-900`
- Section title (`h2`): `text-lg font-medium text-gray-900`
- Body/table text: `text-sm text-gray-900`
- Muted/help text (empty states, timestamps): `text-sm text-gray-500` or
  `text-xs text-gray-700`
- Table header text: `text-left font-medium text-gray-700`
- Thai is the primary UI language — all labels, buttons, and messages are in
  Thai. Keep field labels short and consistent with existing wording (e.g.
  รหัสเครื่องมือ, ชื่อเครื่องมือ, แผนก, วันที่สอบเทียบล่าสุด, วันหมดอายุ).

## Color palette

| Purpose | Classes |
|---|---|
| Page background | `bg-gray-50` |
| Card/panel background | `bg-white` with `border border-gray-200 rounded-lg` |
| Primary text | `text-gray-900` |
| Secondary/label text | `text-gray-700` |
| Muted text | `text-gray-500` |
| Links | `text-blue-700 hover:underline` |
| Primary button | `bg-gray-900 text-white` |
| Destructive button (outline) | `border border-red-300 text-red-700 hover:bg-red-50` |
| Secondary button (outline) | `border border-gray-300 text-gray-700 hover:bg-gray-50` |

### Status colors (🟢🟡🔴) — do not invent new ones

Status is computed by `getToolStatus()` in `src/lib/status.ts` and rendered
via `STATUS_LABEL` / `STATUS_BADGE_CLASS` from the same file. Always reuse
those exports instead of hardcoding status strings or colors in a page:

| Status | Label | Badge classes |
|---|---|---|
| `normal` | 🟢 ปกติ | `bg-green-100 text-green-800` |
| `warning` | 🟡 ใกล้ครบกำหนด | `bg-yellow-100 text-yellow-800` |
| `expired` | 🔴 หมดอายุ | `bg-red-100 text-red-800` |

The alert banner uses a distinct amber treatment (`border-amber-300
bg-amber-50 text-amber-900`) since it is a page-level notice, not a
per-row badge — keep that distinction (amber for the banner, red/yellow/green
badges for individual tool rows).

## Components

- **Badges**: `rounded-full px-2 py-1 text-xs font-medium` + status color
  from the table above.
- **Buttons**: `rounded-md px-4 py-2 text-sm font-medium` + color variant
  from the palette table. Group related actions with `flex items-end gap-2`.
- **Form fields**: label wraps input, `space-y-1 text-sm`; label text is
  `block font-medium text-gray-700`; input/select is
  `w-full rounded-md border border-gray-300 px-3 py-2`. Use the existing
  `Field` component pattern in `tools/manage/page.tsx` rather than
  redefining inputs inline.
- **Cards/sections**: `rounded-lg border border-gray-200 bg-white p-6`
  (or `p-4` for tighter list rows).
- **Tables**: wrapper `overflow-x-auto rounded-lg border border-gray-200
  bg-white`; `table` is `min-w-full divide-y divide-gray-200 text-sm`; header
  row `bg-gray-50`; body rows separated with `divide-y divide-gray-100`;
  cells `px-4 py-2`.
- **Nav**: `flex flex-wrap items-center justify-between gap-4 border-b
  border-gray-200 pb-4`; links are plain text with `hover:underline`; no
  active-state styling currently exists — don't add it speculatively.

## Role-based UI (RBAC)

Nav links and action buttons must be conditionally rendered by
`session.user.role`, matching `Nav.tsx`:

- **Visitor**: dashboard + calibration history view only, no edit/delete
  controls anywhere.
- **Editor**: adds "จัดการเครื่องมือ" (tool CRUD).
- **Admin**: adds "จัดการผู้ใช้" (user management), on top of Editor access.

Never rely on hiding a button alone for access control — the corresponding
server action must also check role server-side (see `review-code` skill).

## When extending the design system

If a new page needs a pattern not covered here (e.g. modals, pagination,
toasts), pick the closest existing convention (buttons, cards, form fields)
and extend it minimally — don't introduce a new color, spacing scale, or
component library without updating this file.
