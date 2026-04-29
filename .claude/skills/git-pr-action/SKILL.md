---
name: git-pr-action
description: Summarize completed feature work, stage files, commit, and draft a PR summary.
user_invocable: true
---

# Git PR Action

Summarize the completed feature work, stage the relevant files, create a concise commit, and draft a PR summary focused on user-visible changes, API changes, and verification.

## Steps

1. **Analyze the work done** — Run `git status` and `git diff` (staged + unstaged) to understand all changes made. Also run `git log` to see recent commit style.

2. **Summarize the feature** — Write a brief internal summary of what was built or changed, grouping changes by:
   - User-visible changes (UI, UX, new features)
   - API changes (new/modified endpoints, request/response shape changes)
   - Internal changes (refactors, config, infra)

3. **Stage relevant files** — Add changed and new files to the staging area. Be selective:
   - Do NOT stage files that contain secrets (`.env`, credentials, keys)
   - Do NOT stage unrelated or accidental changes
   - Prefer staging specific files by name over `git add -A`

4. **Create a concise commit** — Write a commit message that:
   - Starts with a short imperative summary line (under 72 chars)
   - Optionally includes a body paragraph explaining the "why"
   - Ends with `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
   - Uses a HEREDOC to pass the message:
     ```
     git commit -m "$(cat <<'EOF'
     Summary line here

     Optional body here.

     Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
     EOF
     )"
     ```

5. **Draft the PR summary** — Output a PR body in this format (do NOT create the PR automatically):

   ```markdown
   ## Summary
   - <bullet: user-visible change>
   - <bullet: API change, if any>
   - <bullet: other notable change>

   ## API Changes
   <!-- List new/modified endpoints, method, path, and any request/response changes. Omit section if none. -->

   ## Verification
   - [ ] <step to verify the feature works>
   - [ ] <step to check edge cases or regressions>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

6. **Present the PR summary to the user** — Show the drafted PR body and ask the user if they want to:
   - Create the PR now (using `gh pr create`)
   - Edit the summary first
   - Push the branch without creating a PR

## Constraints

- Never force-push or amend existing commits without explicit permission.
- Never push to `main` or `master` directly.
- Never skip pre-commit hooks.
- If a pre-commit hook fails, fix the issue and create a NEW commit (do not amend).
- Do not create the PR unless the user confirms — only draft it.
