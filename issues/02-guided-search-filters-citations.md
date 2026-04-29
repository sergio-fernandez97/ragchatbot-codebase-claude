# Guided Search Filters and Better Source Citations

## Summary

Add course and lesson filters to the query flow so users can scope their questions to specific content. Improve the response format so source citations clearly identify which course and lesson the answer came from, with links where available.

## Motivation

Currently, all queries search the entire corpus and sources are returned as plain strings. Users who want answers about a specific course or lesson have no way to narrow their search except by phrasing their question carefully. Explicit filters make results more precise and citations more trustworthy.

## Backend Scope

- Extend `QueryRequest` in `app.py` with optional `course_name: str` and `lesson_number: int` fields.
- Pass these filters into the search/vector-store layer so retrieval is scoped before the model sees results.
- Return structured citation data in the response — e.g., `{ course_title, lesson_number, lesson_title, link }` — instead of (or in addition to) plain source strings.

### Files to change

- `backend/app.py` — update `QueryRequest` and `QueryResponse` models
- `backend/rag_system.py` — pass filters through to search
- `backend/search_tools.py` — accept and apply filter parameters in `CourseSearchTool`
- `backend/vector_store.py` — filter ChromaDB queries by course/lesson metadata

## Frontend Scope

- Add a course dropdown and optional lesson number input above the chat box.
- Show active filters as chips or badges that can be cleared.
- Update the query payload to include selected filters.
- Render the answer's source citations with course title, lesson number, and clickable link (where available) instead of plain comma-separated strings.

### Files to change

- `frontend/index.html` — filter controls above the chat input
- `frontend/script.js` — read filter values, include in fetch body, render structured citations
- `frontend/style.css` — filter controls, chips/badges, citation styling

## Acceptance Criteria

- [ ] User can select a course from a dropdown to filter queries
- [ ] User can optionally enter a lesson number to narrow further
- [ ] Active filters are visually indicated and clearable
- [ ] Asking the same question with and without filters returns different, appropriately scoped results
- [ ] Citations in the response identify course title, lesson number, and include a link if available
- [ ] Empty or invalid filter values are handled gracefully (no errors, falls back to unfiltered)
- [ ] Filter controls are keyboard-accessible
