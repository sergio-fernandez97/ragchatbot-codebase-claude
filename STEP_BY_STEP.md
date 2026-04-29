# Live Session Guide: Claude Code on the RAG Chatbot Codebase

This guide is the session script for demonstrating Claude Code with this repository.

It covers:

- launching the app
- using `claude --worktree`
- configuring and using agent teams
- demonstrating `/install-github-app`
- ~~demonstrating plugins~~
- demonstrating project skills
- demonstrating hooks
- implementing three selected product features with agent-team orchestration

## Session Goal

During the live session, we will implement these three features:

1. Course and lesson quick links in the UI
2. Guided search filters and better source citations
3. Content health dashboard for imported course data

These two features are intentionally deferred to the student assignment after the session:

1. Accessible light/dark theme toggle
2. Course explorer panel with “Ask about this” actions

## Why These Three Features Fit Agent Teams

These three are strong examples for agent teams because they are cross-layer changes with a clean split:

- backend teammate owns API and data-model changes
- frontend teammate owns UI rendering and interactions
- QA teammate owns validation, accessibility checks, and demo verification

This matches the Claude Code guidance that agent teams work best for:

- new modules or features
- cross-layer coordination
- independent parallel work

It also avoids the main failure mode from the docs: multiple teammates editing the same files.

## Session Prerequisites

Before the live session, make sure you have:

- Claude Code `v2.1.32+`
- a valid Claude login
- `uv` installed
- the repo cloned locally
- `ANTHROPIC_API_KEY` available in `.env` for the app itself
- GitHub repo admin access if you want to run `/install-github-app`

Check Claude Code version:

```bash
claude --version
```

## Step 1: Launch The App First

From the repository root:

```bash
uv sync
chmod +x run.sh
./run.sh
```

Open:

- App: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

What to say during the session:

- explain that this is a small FastAPI + static frontend app
- show the current sidebar, chat area, and course list
- mention that the backend already parses course and lesson links from the source documents, but the UI does not expose them yet

## Step 2: Prepare The Repository For Worktree-Based Work

Claude Code worktrees are useful here because they isolate the live-session branch from the main checkout.

Recommended prep:

```bash
git remote set-head origin -a
```

Add this line to `.gitignore` if it is not already present:

```gitignore
.claude/worktrees/
```

Why:

- Claude Code creates worktrees under `.claude/worktrees/<name>`
- the branch is named `worktree-<name>`
- worktrees are based on whatever `origin/HEAD` points to

Because this repo relies on `.env`, also create a `.worktreeinclude` file so worktrees receive local secrets:

```text
.env
```

What to explain:

- `claude --worktree` creates an isolated checkout for the session
- this is ideal for demos, because the main checkout remains untouched
- `.worktreeinclude` is simpler than a custom `WorktreeCreate` hook for this repo

## Step 3: Enable Agent Teams

[Agent teams](https://code.claude.com/docs/en/agent-teams) are experimental and disabled by default.

Use either a temporary shell export:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

Or add this to `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Choose display mode:

- `in-process` is simpler and safer for a live demo
- `tmux` is better if you want visible split panes

For a simple first run:

```bash
claude --worktree rag-live-session --teammate-mode in-process
```

If you want split panes:

```bash
claude --worktree rag-live-session --teammate-mode tmux
```

What to explain:

- the worktree isolates the live session
- the lead session runs inside that worktree
- teammates are independent Claude Code sessions coordinated by the lead
- for this demo, we will rely on clear file ownership instead of multiple teammates editing the same file

## Step 4: Initialize Claude Context For The Repo

Inside Claude Code, run:

```text
/init
```

Goal:

- create or improve `CLAUDE.md`
- capture repo conventions
- record the session scope and the three selected features

Suggested instruction to Claude:

```text
Create a concise CLAUDE.md for this repository. Keep it short and focused on:
- FastAPI backend in backend/
- static frontend in frontend/
- app launch steps
- the three live-session features we will build
- a warning to avoid same-file conflicts during agent-team work
```

## Step 5: Demonstrate `/install-github-app`

Inside Claude Code:

```text
/install-github-app
```

What to explain:

- this is the easiest setup path for Claude Code GitHub Actions
- you must be a repository admin
- the GitHub app asks for read/write permissions on Contents, Issues, and Pull Requests
- the quick setup path is for direct Claude API users
- if the repo uses AWS Bedrock or Vertex AI, use the manual setup path from the docs instead

If the command cannot be completed live, still demonstrate the workflow:

1. run `/install-github-app`
2. explain the permissions prompt
3. explain that the fallback is manual GitHub App installation plus workflow setup

## Step 6: Demonstrate Plugins

For the live session, use plugins for shareable functionality and use standalone project config for fast repo-local customization.

That distinction is important:

- standalone `.claude/` config is best for project-specific experiments
- plugins are better for sharing skills, agents, and hooks across projects or teams

Inside Claude Code, show the plugin manager:

```text
/plugin
```

Then install a plugin from the official marketplace:

```text
/plugin install github@claude-plugins-official
```

Alternative CLI form:

```bash
claude plugin install github@claude-plugins-official --scope project
```

What to explain:

- plugin skills are namespaced, for example `/plugin-name:skill-name`
- plugins are versioned and reusable
- for this workshop, we will keep the custom workflow logic in project-local skills and hooks because it is faster to create and easier for students to inspect

Optional talking point:

- after the live session, the skills and hooks created in `.claude/` can be migrated into a plugin if you want to distribute the workshop tooling

## Step 7: Add A Project Skill For The Session

Use a project skill rather than a personal skill so the audience can inspect it in the repo.

Path:

```text
.claude/skills/live-session-delivery/SKILL.md
```

What the skill should do:

- remind Claude of the three selected features
- restate teammate ownership boundaries
- include acceptance criteria
- require concise progress summaries and verification before completion

Suggested prompt to Claude:

```text
Create a project skill at .claude/skills/live-session-delivery/SKILL.md.
The skill should:
- summarize the three live-session features described in the Issues section of this repo.
- define file ownership:
  - backend teammate: backend/*
  - frontend teammate: frontend/*
  - qa teammate: validation only unless explicitly reassigned
- require contrast and visibility checks for any new UI
- require source links to be clickable and readable
- require verification notes before a task is marked complete
Set it up so we can invoke it manually during the session.
```

What to explain:

- project skills live under `.claude/skills/<skill-name>/SKILL.md`
- they are repo-specific
- they are lighter-weight than stuffing all this into `CLAUDE.md`
- skills are a good way to encode a repeatable playbook for implementation

## Step 8: Add Hooks For Quality Gates

Hooks are the deterministic layer. Use them for guardrails that should always run, instead of hoping the model remembers.

For this session, use project-level hooks in `.claude/settings.json`.

Recommended hook set:

1. `TaskCompleted` prompt hook
Purpose:
- block task completion if the teammate has not reported what changed and how it was verified

2. `TeammateIdle` prompt hook
Purpose:
- nudge idle teammates to summarize status and propose the next action

3. `Notification` command hook
Purpose:
- surface when Claude needs attention

Example `TaskCompleted` hook:

```json
{
  "hooks": {
    "TaskCompleted": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Allow completion only if the teammate has clearly stated: 1) files changed, 2) verification performed, and 3) any remaining risk. If anything is missing, respond with {\"ok\": false, \"reason\": \"what is missing\"}."
          }
        ]
      }
    ]
  }
}
```

Example `TeammateIdle` hook:

```json
{
  "hooks": {
    "TeammateIdle": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "If the teammate is going idle without a clear status update, respond with {\"ok\": false, \"reason\": \"Summarize current status, blockers, and next step before going idle.\"}. Otherwise respond with {\"ok\": true}."
          }
        ]
      }
    ]
  }
}
```

Example `Notification` hook:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"$CLAUDE_NOTIFICATION\" with title \"Claude Code\"' 2>/dev/null; echo '{\"ok\": true}'"
          }
        ]
      }
    ]
  }
}
```

What to explain:

- agent-team docs explicitly call out `TeammateIdle`, `TaskCreated`, and `TaskCompleted` as useful quality-gate events
- hooks are where we make the session more reliable
- use prompt hooks when the rule requires judgment
- use command hooks when the behavior is deterministic

## Step 9: Create The Agent Team In Planning Mode First

Do not start with implementation. Start with planning and file ownership. This follows the Claude docs recommendation to begin with research/review style work if the audience is new to agent teams.

Prompt to the lead:

```text
Create an agent team for this repository with 3 teammates:

1. Backend teammate
- Owns backend/*
- Responsible for API contracts, response models, and data shaping

2. Frontend teammate
- Owns frontend/*
- Responsible for layout, interactions, accessibility, and visible UI behavior

3. QA teammate
- Does not edit production files unless explicitly reassigned
- Responsible for verification, contrast/readability review, and demo test scenarios

First work in planning mode only.
Do not implement yet.
Use Sonnet for each teammate.
Require plan approval before implementation.

The feature scope is: "Course and lesson quick links in the UI". Retrive the specifications from Github Issues.

Constraints:
- avoid same-file conflicts
- backend teammate must not edit frontend/*
- frontend teammate must not edit backend/*
- QA teammate should produce a verification checklist
- keep the existing visual style unless readability needs improvement

Use the live-session-delivery skill if helpful.
When the plan is ready, summarize the task breakdown and wait for approval.
```

What to explain:

- the lead owns orchestration
- teammates can message each other directly, but the lead remains the control point
- plan approval reduces the chance of messy live implementation

## Step 10: Review The Plan And Approve It

When the plan arrives, look for:

- clear backend/frontend/QA separation
- no shared-file collisions
- realistic sequence for the three features
- explicit verification for links, filters, citations, and dashboard counts

If the plan is too vague, say:

```text
Refine the plan. I want explicit file ownership, endpoint changes, frontend changes, and verification steps for each feature.
```

If the plan looks good, say:

```text
Approve the plans and start implementation.
Keep file ownership strict.
Wait for teammates to finish their tasks before proceeding.
```

## Step 11: Suggested Implementation Breakdown

This is the intended split during the session.

Backend teammate:

- add or extend a catalog endpoint for structured course metadata
- expose `course_link`, `lesson_link`, instructor, and lesson metadata
- extend query input with `course_name` and `lesson_number`
- return richer citation data for answers
- add a content-health endpoint

Frontend teammate:

- add clickable course and lesson links in the sidebar
- add query filters for course and lesson
- render sources as structured citations instead of plain strings
- add a content-health panel
- keep text contrast and link visibility strong

QA teammate:

- define manual test scenarios
- verify links, filter behavior, and dashboard counts
- check mobile and long-title behavior
- if browser automation is available, capture a quick verification pass

## [OPTIONAL] Step 12: Useful Prompts During The Demo

Use these when the team needs steering.

If the lead starts coding instead of coordinating:

```text
Wait for your teammates to complete their tasks before proceeding.
Focus on coordination and synthesis.
```

If a teammate is stuck:

```text
Check on the teammate that is blocked, summarize the blocker, and either help them recover or reassign the task.
```

If tasks are too large:

```text
Break the work into smaller tasks with explicit dependencies and ownership.
```

If you want a mid-session summary:

```text
Summarize current progress by teammate, completed tasks, open tasks, and risks.
```

If you want the QA teammate to be stricter:

```text
QA teammate should verify contrast, keyboard accessibility, link behavior, and edge cases before allowing task completion.
```

## Step 13: Run And Verify The Updated App

After implementation, run the app from the worktree:

```bash
uv sync
./run.sh
```

Verify the three features live:

1. Quick links
- course links are visible and clickable
- lesson links are accessible from the UI
- long labels remain readable

2. Filters and citations
- user can select a course
- user can optionally filter by lesson number
- returned citations clearly identify course and lesson
- source links are clickable where possible

3. Content health dashboard
- counts render correctly
- missing metadata is visible but not visually harsh
- panel remains readable on smaller screens

Optional QA prompt:

```text
QA teammate: run a final verification pass on the three features and report findings in priority order. Include any residual risks.
```

## Step 14: Show The GitHub Follow-Through

This is where `/install-github-app` connects back to the rest of the workflow.

Suggested actions:

1. ask Claude to summarize the changes
2. ask it to stage and commit
3. ask it to prepare a PR description
4. mention that future iterations can be triggered from GitHub with `@claude`

Suggested prompt:

```text
Summarize the completed feature work, stage the relevant files, create a concise commit, and draft a PR summary focused on user-visible changes, API changes, and verification.
```

## Step 15: Close The Team Cleanly

Do not leave the team running.

Ask the lead:

```text
Shut down the teammates, then clean up the team.
```

What to explain:

- clean shutdown matters because agent teams create shared runtime state
- cleanup should be initiated by the lead, not by individual teammates

## Step 16: Create a skill for creating PR after each feature is finished.
```
Create a skill at .claude/skills/git-pr-action/SKILL.md from the following prompt: "..."
```

## Step 17: Use `claude --worktree` + agent teams.
Use a modified version of the prompt located at [AGENT_TEAMS_PROMPT.md](./AGENT_TEAMS_PROMPT.md).

## Step 18: Transition To The Practical Assignment

End the live session by assigning the remaining two features:

1. Accessible light/dark theme toggle
2. Course explorer panel with “Ask about this” actions

Suggested framing:

- these are intentionally left for students because they are valuable but less ideal for the first agent-team orchestration demo
- they are good follow-up exercises for practicing skills, hooks, and subagents implementation

## Recommended Live Narrative

Use this order during the session:

1. Launch the app and show the current limitations
2. Explain why the three selected features are good for agent teams
3. Start a Claude worktree session
4. Enable and explain agent teams
5. Demonstrate `/install-github-app`
6. Demonstrate plugin discovery/installation
7. Add a project skill
8. Add project hooks
9. Create the team in planning mode
10. Approve the plan
11. Let the team implement with strict ownership
12. Verify the app
13. Close the loop with git and GitHub
14. Hand off the remaining two features as student assignment

## Reference Commands

```bash
# launch app
uv sync
./run.sh

# enable agent teams for current shell
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# start Claude in a worktree
claude --worktree rag-live-session --teammate-mode in-process

# optional split-pane mode
claude --worktree rag-live-session --teammate-mode tmux

# sync local origin/HEAD before worktree creation
git remote set-head origin -a

# install a plugin from CLI
claude plugin install github@claude-plugins-official --scope project
```

## Official Docs Used For This Guide

- Agent teams: [https://code.claude.com/docs/en/agent-teams](https://code.claude.com/docs/en/agent-teams)
- Worktrees and common workflows: [https://code.claude.com/docs/en/common-workflows](https://code.claude.com/docs/en/common-workflows)
- GitHub app setup: [https://code.claude.com/docs/en/github-actions](https://code.claude.com/docs/en/github-actions)
- Plugins: [https://code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)
- Discover/install plugins: [https://code.claude.com/docs/en/discover-plugins](https://code.claude.com/docs/en/discover-plugins)
- Skills: [https://code.claude.com/docs/en/slash-commands](https://code.claude.com/docs/en/slash-commands)
- Hooks: [https://code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)
- Settings/configuration: [https://code.claude.com/docs/en/configuration](https://code.claude.com/docs/en/configuration)
- The settings.json That Made Claude Code 10x Faster [https://x.com/zodchiii/status/2049421095350972922?s=12](https://x.com/zodchiii/status/2049421095350972922?s=12)
