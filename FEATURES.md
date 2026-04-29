# Feature Proposals for Live Session

This document is the initial shortlist of features we can use as the basis for the live session.

The intent is not to implement all of them. The intent is to choose 1-3 features that are:

- visible in the UI
- meaningful on both frontend and backend
- realistic to build live with Claude Code
- easy to validate during the session

## Start By Launching The App

From the repository root:

```bash
uv sync
chmod +x run.sh
./run.sh
```

Open:

- App: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

Notes:

- The app expects `ANTHROPIC_API_KEY` in `.env`.
- The backend loads course files from `docs/` on startup.

## Quality Bar For Any Selected Feature

Every feature we choose for the session should meet these conditions:

- good contrast in both light and dark surfaces
- readable buttons, links, and states
- mobile-safe layout
- keyboard-accessible controls where applicable
- quick manual validation in the browser
- optional Playwright pass for visual and interaction checks

## Recommended Live-Session Features

### 1. Accessible Theme Toggle With Persistent Preference

Why it is a good session feature:

- immediately visible
- small enough to demo live
- useful for discussing contrast, color tokens, and UI polish
- naturally combines frontend behavior with backend persistence

Frontend scope:

- add a light/dark mode toggle in the UI
- replace hard-coded colors with clearer semantic tokens
- improve contrast for sidebar text, buttons, message bubbles, and source panels
- persist the selected mode in the browser for instant reload behavior

Backend scope:

- add a small preferences endpoint such as `GET/POST /api/preferences/{session_id}`
- persist the theme preference by session so the UI can restore it consistently
- optionally return UI preferences with the existing query/session flow

Validation ideas:

- toggle between modes without losing readability
- verify focus states and button visibility
- use Playwright to capture both themes and confirm basic interaction

### 2. Course And Lesson Quick Links In The UI

Why it is a good session feature:

- the document parser already captures `course_link` and `lesson_link`
- the feature is clearly valuable and low-risk
- it creates an obvious frontend/backend narrative for the demo

Frontend scope:

- add direct links in the sidebar for each course
- show lesson links inside an expandable course explorer
- render source references as clickable items instead of plain text
- add clear external-link styling and hover/focus states

Backend scope:

- extend `/api/courses` or add `/api/catalog` to return structured course metadata
- include `title`, `instructor`, `course_link`, `lesson_count`, and lesson-level links
- optionally enrich query responses with structured source objects instead of only strings

Validation ideas:

- confirm every visible link opens the expected course or lesson page
- verify the layout stays readable when titles are long
- use Playwright to test link visibility and keyboard navigation

### 3. Guided Search Filters And Better Source Citations

Why it is a good session feature:

- improves the actual product, not only the visuals
- demonstrates a clean full-stack change to the existing query flow
- gives us a better demo story for “find answers inside a specific course or lesson”

Frontend scope:

- add filters for course and optional lesson number
- add chips or badges showing the active filters
- improve the answer area so sources are easier to understand
- make it easy to clear filters and ask a follow-up question

Backend scope:

- extend `QueryRequest` with `course_name` and `lesson_number`
- pass filters into the search layer instead of relying only on the model to infer them
- return structured citation data, for example course title, lesson number, and link

Validation ideas:

- ask the same question with and without filters and compare results
- confirm citations match the selected course or lesson
- verify empty or invalid filters fail gracefully

### 4. Course Explorer Panel With “Ask About This” Actions

Why it is a good session feature:

- gives the app a stronger navigation model
- lets users browse before they chat
- creates a useful bridge between catalog metadata and chat interaction

Frontend scope:

- replace the plain course list with a searchable course explorer
- show instructor, lesson count, and lesson titles
- add buttons like `Ask about this course` and `Ask about this lesson`
- prefill the chat box from those actions

Backend scope:

- add a richer catalog endpoint for course metadata
- include lesson titles, lesson numbers, and links
- optionally add basic server-side sorting or search support

Validation ideas:

- confirm explorer actions prefill accurate prompts
- verify long course names and many lessons do not break layout
- test mobile collapse/expand behavior

### 5. Content Health Dashboard For The Imported Course Data

Why it is a good session feature:

- shows backend value beyond chat
- helps explain how the ingestion pipeline works
- creates a natural reason to discuss hooks, automation, and future repo checks

Frontend scope:

- add an admin-style panel or sidebar section for content health
- show counts for missing course links, missing lesson links, missing instructors, and total lessons
- visually flag incomplete records with readable warning states

Backend scope:

- add an endpoint such as `/api/content-health`
- inspect stored course metadata and compute completeness metrics
- optionally return per-course warnings for missing fields

Validation ideas:

- confirm the counts match the actual contents of `docs/`
- verify warnings are visible without using aggressive colors
- use this endpoint later as a candidate for hooks or automated checks

## Best Candidates For The First Session

If we want the clearest live-session flow, the best first picks are:

1. Accessible theme toggle
2. Course and lesson quick links
3. Guided search filters and better citations

These three are the strongest mix of:

- visible product improvement
- manageable implementation scope
- clear frontend/backend work split
- easy verification during the demo

## How This Connects To Claude Code Features Later

Once we choose the features, we can turn this into a step-by-step live-session guide that uses this repo to demonstrate:

- `install-github-app`: connect GitHub for repo workflows and PR review
- agent teams: split frontend, backend, and QA tasks
- plugins: use GitHub-related workflows where helpful
- hooks: add guardrails such as checks for formatting, tests, or content-health validation
- skills: use a repeatable repo-analysis or QA workflow during implementation
