---
mode: agent
description: "Generate the e2e suite for a GitHub issue by running the Playwright agents in sequence (planner → generator → healer)"
---

# Generate e2e tests for issue ${input:issue:GitHub issue number (Item ID), e.g. 14}

You are working in the **stanbic-demo** repository (WambuguOnesmus). Produce a
complete, green Playwright e2e suite for GitHub issue **#${input:issue}** by
running the repository's Playwright agents in sequence. If no issue number was
provided, ask for it before doing anything else.

## Pre-flight

1. Fetch the issue: `gh issue view ${input:issue} --json title,body` — extract
   the acceptance criteria and the `stb-*` test ids they reference. Derive a
   kebab-case slug from the title (e.g. `deposit-modal`) — call it `<slug>`.
2. Ensure the app is running at http://localhost:4173 (`npm run dev` if not; if
   the port is busy, a server is already up — reuse it).
3. The feature itself must already be implemented; if the acceptance criteria's
   test ids are missing from the running app, stop and report that the feature
   branch needs to be implemented first (via `/implement-issue`).

## Stage 1 — Plan (playwright-test-planner subagent)

Run the **playwright-test-planner** subagent with this task:

> Fetch GitHub issue #${input:issue} (`gh issue view ${input:issue}`), explore
> the running app at http://localhost:4173, inventory the relevant `stb-*`
> data-testids, and write a test plan to `e2e/plans/<slug>.plan.md` covering
> EVERY acceptance criterion: scenario names, seed state, numbered steps
> referencing exact data-testids, and concrete expected results (exact money
> arithmetic where applicable). Cover the happy path, every validation failure,
> and boundary values.

**Pause after this stage**: show me the plan and wait for my approval before
generating any code. If I request changes, re-run the planner with them.

## Stage 2 — Generate (playwright-test-generator subagent)

Run the **playwright-test-generator** subagent with this task:

> Convert `e2e/plans/<slug>.plan.md` into executable Playwright specs. Extend
> the existing POMs in `e2e/pages/` (e.g. `PortalPage`) rather than duplicating
> locators; create a new POM class only for genuinely new surface area. Select
> exclusively via `page.getByTestId("stb-…")` — never CSS, XPath, or text.
> Web-first assertions only; no `waitForTimeout`, no `.only`/`.skip`; TypeScript
> strict. Test titles must match the plan's scenario names verbatim. Verify
> each step live in the browser while generating, then run `npm run test:e2e`
> and iterate until the full suite is green.

## Stage 3 — Heal (playwright-test-healer subagent, only if needed)

If `npm run test:e2e` still has failures after Stage 2, run the
**playwright-test-healer** subagent:

> Diagnose each failing test (selector drift vs intended behaviour change vs
> real app regression vs flakiness) and repair WITHOUT weakening or deleting
> any assertion. Selector fixes belong in the POM, never inline in specs. If
> the failure is a real app regression, do not alter the test — report the
> defect with reproduction steps instead.

## Finish

1. Run `npm run typecheck` and `npm run test:e2e` one final time — both must be
   clean; paste the result summary as evidence.
2. Commit on the current feature branch (never `main`):
   `test(portal): #${input:issue} add e2e coverage for <slug>`.
3. Report back: the plan file path, every spec/POM file created or changed, the
   final test results, and any defects found and deferred.
