---
name: live-session-delivery
description: Orchestrate implementation of the three live-session features with strict teammate ownership and quality gates.
user_invocable: true
---

# Live Session Delivery

Use this skill to guide agent-team implementation of the three live-session features. Invoke it when planning or starting work on any of the features below.

## Features

### 1. Course and Lesson Quick Links (Issue #1)

- **Backend**: Extend or add a `/api/catalog` endpoint returning structured course metadata (`title`, `instructor`, `course_link`, per-lesson `lesson_number`, `title`, `lesson_link`). Optionally enrich query responses with structured source objects.
- **Frontend**: Render sidebar course titles as clickable links. Add expandable lesson sections per course. Render chat source references as clickable items. Use `target="_blank" rel="noopener noreferrer"`.
- **Accept when**: Every course/lesson link is clickable, opens in new tab, has visible focus states, and layout handles long titles.

### 2. Guided Search Filters and Better Source Citations (Issue #2)

- **Backend**: Add optional `course_name` and `lesson_number` fields to `QueryRequest`. Pass filters into vector store retrieval. Return structured citation objects (`course_title`, `lesson_number`, `lesson_title`, `link`).
- **Frontend**: Add course dropdown and lesson number input above chat. Show active filters as clearable chips/badges. Render citations with course, lesson, and link instead of plain strings.
- **Accept when**: Filters scope results correctly, citations are structured and linked, empty/invalid filters fall back gracefully, controls are keyboard-accessible.

### 3. Content Health Dashboard (Issue #3)

- **Backend**: Add `GET /api/content-health` returning completeness metrics (total courses/lessons, missing `course_link`/`lesson_link`/`instructor` counts, per-course warnings).
- **Frontend**: Add a health panel showing aggregate counts and per-course detail. Use muted warning indicators (not bright red). Ensure readability on small screens.
- **Accept when**: Counts are accurate, warnings are visible but not harsh, per-course detail is expandable, panel is mobile-readable.

## File Ownership

| Teammate | Owns | Must NOT edit |
|----------|------|---------------|
| Backend | `backend/*` | `frontend/*` |
| Frontend | `frontend/*` | `backend/*` |
| QA | no production files | `backend/*`, `frontend/*` (unless explicitly reassigned) |

Multiple teammates must never edit the same file. If a change requires coordination across layers, define an API contract first, then let each teammate implement their side independently.

## Quality Requirements

### UI Contrast and Visibility
- All new text must meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text).
- Links must be visually distinguishable from surrounding text (not just by color — use underline or icon).
- Warning indicators must be visible on both light backgrounds and the app's dark theme without being visually aggressive.

### Source Links
- All source links must be clickable and open in a new tab.
- Link text must be human-readable (course title + lesson number, not raw URLs).
- Broken or missing links must degrade gracefully (show text without a link, not a 404).

### Verification Before Completion
Every teammate must include these notes before marking a task complete:

1. **Files changed** — list every file modified or created.
2. **What was verified** — describe the manual or automated check performed.
3. **Remaining risks** — note any known edge cases, untested paths, or assumptions.

If any of these three items is missing, the task is not complete.