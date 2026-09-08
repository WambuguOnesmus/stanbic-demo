---
mode: agent
description: "stanbic-demo: implement a GitHub issue end-to-end (branch → code → tests → PR → address Copilot review)"
---

# Implement issue ${input:issue:GitHub issue number, e.g. 14}

You are working in the **stanbic-demo** repository (WambuguOnesmus) — the Stanbic
Banking Portal. Implement GitHub issue **#${input:issue}** end-to-end. If no
issue number was provided, ask for it before doing anything else.

## 0. Ground rules (read first, follow throughout)

1. Read the repo instructions before coding: `.github/copilot-instructions.md`
   and the `react-component` skill in `.github/skills/`.
2. Read the wiki for agreed team practices. Clone or update it locally
   (do NOT commit it into the repo):
   - `git clone https://github.com/WambuguOnesmus/stanbic-demo.wiki.git` into a
     sibling folder (or `git -C <existing-clone> pull` if already present).
   - At minimum read **Branching-Strategy** and **Developer-Guide**, plus
     **Project-Setup** for how to run the app and tests. Treat the wiki as
     authoritative for process; repo instruction files are authoritative for
     code conventions. If anything conflicts, the wiki wins.
3. The approved HTML prototype (`public/prototype/index.html`, live on GitHub
   Pages) is the authoritative visual specification — match its layout, palette
   (`stanbic-navy`, `stanbic-royal`, `stanbic-accent` tokens), copy, and
   `data-testid` attributes exactly.
4. One work item per branch/PR. Never commit to `main`. Never bundle unrelated
   changes or formatting.
5. This is an **npm** + Vite + React + TypeScript-strict + Tailwind repo; tests
   are Playwright only (`e2e/`). There is no backend.
6. Never touch `src/core-ledger/**` or any `*.pem` file — excluded by policy.

## 1. Understand the issue

1. `gh issue view ${input:issue}` — read the full body: Item ID, business
   value, acceptance criteria, and technical notes. View the attached prototype
   screenshots — they define the UI requirements state by state.
2. If requirements are ambiguous or contradict repo conventions, ask me before
   implementing — do not guess on scope.

## 2. Create the branch

1. `git fetch origin` then start from up-to-date `main`
   (`git checkout main && git pull`).
2. Branch name per the wiki Branching-Strategy:
   `feature/${input:issue}-<short-kebab-description>`
   (use `fix/` prefix if the issue is a defect).

## 3. Implement

1. Plan first for anything non-trivial; keep the change scoped strictly to the issue.
2. Follow the repo conventions exactly (from `.github/copilot-instructions.md`
   and the `react-component` skill):
   - Function components with named exports and an exported props `interface`;
     no `any`, no `@ts-ignore`, no non-null assertions
   - Discriminated unions for view state; input sanitization at the component
     boundary; `dangerouslySetInnerHTML` is banned
   - Tailwind Stanbic tokens only — no hex values, no inline styles
   - Accessible: `label`/`htmlFor`, `aria-live` for dynamic updates,
     `role="alert"` errors, dialog semantics for modals, visible focus states
3. **Every interactive or assertable element MUST have a stable kebab-case
   `data-testid="stb-<element>"`** matching the prototype's ids exactly.
4. Write/update Playwright coverage for every acceptance criterion: page
   objects in `e2e/pages/` locating elements exclusively via `getByTestId(...)`,
   declarative specs in `e2e/`. Prefer the repo's Playwright agents
   (`playwright-test-planner` → `playwright-test-generator`) to produce them.
5. Commit messages on the branch: `feat(portal): #${input:issue} <imperative
   description>` (or `fix(portal):` / `test(portal):`). Commit in logical units.

## 4. Verify (evidence before claims)

Run everything relevant and confirm output before claiming success:

- `npm ci` (if needed), then `npm run typecheck` — must pass with zero errors.
- `npm run test:e2e` — the full suite must be green (it starts the Vite dev
  server itself on port 4173; stop any process already holding that port).
- Exercise the real runtime path: `npm run dev`, open http://localhost:4173 and
  click through the feature against the prototype at `/prototype/index.html` —
  compilation and tests alone are not completion.
- Check `git status` before committing: exclude `dist/`, `node_modules/`,
  `playwright-report/`, `test-results/`, `.env`, and any unrelated files.

## 5. Create the PR

1. Push the branch (`git push -u origin <branch>`).
2. PR title: `feat(portal): #${input:issue} <description>` (this becomes the
   squash commit on `main`).
3. PR body must follow `.github/PULL_REQUEST_TEMPLATE.md`: Summary, Linked
   Issue with `Closes #${input:issue}`, Type of Change, and the **full banking
   compliance checklist** (architecture, GHAS/CodeQL, quality gates, data
   privacy, review & sign-off), plus before/after screenshots for UI changes.
4. Use plain ASCII in the PR body and pass it via `--body-file` (Windows
   PowerShell mangles non-ASCII and multiline `--body`).
5. Always create the PR as a **draft**:
   `gh pr create --draft --title "..." --body-file <file>`. Leave it in draft;
   a human marks it ready for review.

## 6. Address Copilot code review

1. After creating the PR, fetch the Copilot Code Review: `gh pr view --comments`
   and `gh api repos/{owner}/{repo}/pulls/<pr>/comments` for inline comments.
2. If no review has appeared, poll a couple of times (short waits); if needed,
   request it: `gh pr edit --add-reviewer copilot` — or tell me it needs manual
   triggering.
3. For each comment, verify the feedback is technically correct before
   implementing; do not blindly apply wrong suggestions — push back with
   reasoning in a reply instead.
4. Fix legitimate findings, re-run the verification from step 4, and push
   follow-up commits (same `feat(portal): #${input:issue} ...` format). If a
   rebase onto `main` is needed, rebase (never merge `main` in) and use
   `git push --force-with-lease`.
5. Reply to or resolve the addressed comments so reviewers can see the
   disposition. Also review any CodeQL findings on the PR and apply or
   disposition Copilot Autofix suggestions.

## 7. Finish

- Do NOT merge the PR — it needs CODEOWNERS approval and green required checks
  (**Playwright E2E Tests**, **CodeQL**, **Dependency Review**). Stop after all
  Copilot comments are addressed and checks are green.
- Report back: branch name, PR link, verification results (typecheck/e2e
  outcomes), Copilot/CodeQL findings and how each was resolved, and anything
  intentionally deferred.
