# Live Session Delivery

Implement the three live-session features for the RAG chatbot. Use this skill to recall the feature scope, file ownership rules, and quality requirements during agent-team work.

## Features

### 1. Course and Lesson Quick Links (issues/01-course-lesson-quick-links.md)

Expose `course_link` and `lesson_link` metadata already captured by the document parser. Add a catalog endpoint returning structured course/lesson data. Render courses in the sidebar as clickable links with expandable lesson sections. Source references in chat responses become clickable items.

### 2. Guided Search Filters and Better Citations (issues/02-guided-search-filters-citations.md)

Add optional `course_name` and `lesson_number` filters to the query flow. Scope vector-store retrieval before the model sees results. Show a course dropdown and optional lesson input above the chat box with clearable filter chips. Return structured citations (course title, lesson number, link) instead of plain strings.

### 3. Content Health Dashboard (issues/03-content-health-dashboard.md)

Add `GET /api/content-health` returning completeness metrics: total courses/lessons, missing course links, missing lesson links, missing instructors, and per-course warnings. Render an admin panel with aggregate counts and expandable per-course detail. Use muted warning indicators, not aggressive colors.

## File Ownership

Strict ownership prevents merge conflicts during agent-team work.

| Teammate | Owns | Must not edit |
|----------|------|---------------|
| Backend  | `backend/*` | `frontend/*` |
| Frontend | `frontend/*` | `backend/*` |
| QA       | No production files | `backend/*`, `frontend/*` (unless explicitly reassigned) |

If a change requires coordinating across layers, the lead orchestrates handoff — teammates do not cross boundaries on their own.

## Quality Requirements

### Contrast and visibility
- All new UI text must meet WCAG AA contrast (4.5:1 for normal text, 3:1 for large text) against the existing background.
- Links must have visible hover and focus states.
- Warning indicators in the health dashboard use muted colors — no bright red on dark backgrounds.

### Source links
- All rendered links must be clickable and open in a new tab with `rel="noopener noreferrer"`.
- Links must be visually distinguishable from surrounding text.
- Long titles must not break the layout.

### Verification before completion
Every teammate must report the following before a task is marked complete:

1. **Files changed** — list every file modified or created.
2. **Verification performed** — describe what was tested and how (manual check, API call, browser inspection, etc.).
3. **Remaining risks** — note anything not covered or any known edge case.

If any of these three items is missing, the task is not complete.
