# Content Health Dashboard for Imported Course Data

## Summary

Add an admin-facing dashboard panel that shows completeness metrics for the imported course data — missing links, missing instructors, total lesson counts, and per-course warnings. This helps content maintainers understand data quality at a glance.

## Motivation

The ingestion pipeline silently accepts documents with missing metadata (no `course_link`, no `lesson_link`, no instructor). There is currently no way to see which courses have gaps without manually inspecting the source files. A health dashboard surfaces these issues in the UI.

## Backend Scope

- Add a `GET /api/content-health` endpoint.
- Inspect stored course metadata and compute completeness metrics:
  - Total courses and total lessons
  - Count of courses missing `course_link`
  - Count of courses missing `instructor`
  - Count of lessons missing `lesson_link`
- Optionally return per-course warnings listing which fields are missing.

### Files to change

- `backend/app.py` — new endpoint and response model
- `backend/rag_system.py` — new method to compute health metrics from vector store data
- `backend/vector_store.py` — may need a method to retrieve all course metadata for inspection

## Frontend Scope

- Add a content health panel (sidebar section or separate tab/view).
- Display aggregate counts: total courses, total lessons, missing course links, missing lesson links, missing instructors.
- Visually flag incomplete records with warning indicators (not aggressive red — use muted warning colors).
- Keep the panel readable on smaller screens.

### Files to change

- `frontend/index.html` — health panel markup
- `frontend/script.js` — fetch from `/api/content-health` and render metrics
- `frontend/style.css` — health panel layout, warning indicators, responsive behavior

## Acceptance Criteria

- [ ] Dashboard shows correct total counts for courses and lessons
- [ ] Missing `course_link`, `lesson_link`, and `instructor` counts are accurate and match `docs/` contents
- [ ] Warning indicators are visible but not visually harsh (no bright red on dark backgrounds)
- [ ] Per-course detail is available (expandable or listed) showing which fields are missing
- [ ] Panel is readable on mobile-width screens
- [ ] Data refreshes when the page loads (or on demand)
