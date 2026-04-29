# Course and Lesson Quick Links in the UI

## Summary

The document parser already captures `course_link` and `lesson_link` for each course and lesson, but the UI does not expose them. This feature adds clickable links throughout the interface so users can navigate directly to course and lesson pages.

## Motivation

Users currently see course titles as plain text in the sidebar and source references as unlinked strings in chat responses. Adding direct links makes the app immediately more useful as a course navigation tool.

## Backend Scope

- Extend `GET /api/courses` or add a new `GET /api/catalog` endpoint that returns structured course metadata including:
  - `title`, `instructor`, `course_link`, `lesson_count`
  - Per-lesson data: `lesson_number`, `title`, `lesson_link`
- Optionally enrich query responses with structured source objects (course title, lesson number, link) instead of plain strings.

### Files to change

- `backend/app.py` — new or extended endpoint, new response model
- `backend/rag_system.py` — expose richer metadata from `get_course_analytics()`
- `backend/models.py` — may need a new response model for catalog data

## Frontend Scope

- Render course titles in the sidebar as clickable links (open in new tab).
- Show lesson links inside an expandable section per course.
- Render source references in chat responses as clickable items instead of plain text.
- Add clear external-link styling and hover/focus states.

### Files to change

- `frontend/index.html` — sidebar structure for expandable course/lesson links
- `frontend/script.js` — update `loadCourseStats()` to consume richer data; update `addMessage()` to render linked sources
- `frontend/style.css` — link styling, hover/focus states, external-link indicators

## Acceptance Criteria

- [ ] Every course in the sidebar has a clickable link to its `course_link` (if available)
- [ ] Lessons are accessible from an expandable section under each course
- [ ] Source references in chat responses link to the relevant course or lesson
- [ ] Links open in a new tab with `rel="noopener noreferrer"`
- [ ] Layout remains readable with long course/lesson titles
- [ ] Links have visible focus states for keyboard navigation
