---
mode: agent
description: "Implement a portal feature from a GitHub Issue (issue number = Item ID) and its prototype screenshot"
---

# Implement Portal Feature From Issue Screenshot

You are implementing a feature for the Stanbic Banking Portal.

## Inputs

- Issue number (Item ID): ${input:issueNumber:GitHub issue number, e.g. 9}
- The issue contains the **Acceptance Criteria** and an attached **prototype
  screenshot**, which is the authoritative visual specification.

## Task

1. **Read the wiki first (ALWAYS — before any other step)**: fetch and read the
   repository wiki pages; they are the source of truth for how work is done here:
   - [Branching-Strategy](https://github.com/WambuguOnesmus/stanbic-demo/wiki/Branching-Strategy) — branch naming, commit convention, PR flow
   - [Developer-Guide](https://github.com/WambuguOnesmus/stanbic-demo/wiki/Developer-Guide) — coding conventions and test standards
   - [Project-Setup](https://github.com/WambuguOnesmus/stanbic-demo/wiki/Project-Setup) — how to run the app and tests

   Raw content is available via git if needed:
   `git clone https://github.com/WambuguOnesmus/stanbic-demo.wiki.git`.
   Do not proceed until these conventions are loaded; if any instruction below
   conflicts with the wiki, the wiki wins.

2. **Fetch the issue**: run `gh issue view ${input:issueNumber} --json title,body`
   and read the title, business value, acceptance criteria, and technical notes.
   **Analyze the attached prototype screenshot**: layout, palette (Stanbic navy
   `stanbic-navy`, royal blue `stanbic-royal`, white), typography hierarchy, form
   fields, panels, and dynamic states.

3. **Create the branch per the wiki Branching-Strategy** —
   `feature/<id>-<description>` where `<id>` is the issue
   number, e.g. `feature/${input:issueNumber}-<kebab-description>`, created from
   a fresh `main`.

4. **Generate or update the React component** in `src/components/` matching the
   screenshot pixel-intent-faithfully, following `.github/copilot-instructions.md`,
   the wiki Developer-Guide, and the `react-component` skill:
   - TypeScript strict mode with an exported props interface
   - Tailwind design tokens only (no hex values, no inline styles)
   - Kebab-case `data-testid="stb-<element>"` on every interactive element
   - Accessible labels, `aria-live` dynamic updates, `role="alert"` errors
   - Input sanitization at the component boundary

5. **Generate the Playwright coverage**: update `e2e/pages/` POM and add specs
   in `e2e/` asserting every acceptance criterion via `getByTestId`. Run
   `npm run test:e2e` until green.

6. **Commit and open the PR (per the wiki Branching-Strategy)**:
   - Commits: `feat(portal): #${input:issueNumber} <imperative description>`
   - Open the PR into `main` using the repository PR template
     (`.github/PULL_REQUEST_TEMPLATE.md`) — fill in the Summary, tick the
     Type of Change, complete the full banking compliance checklist, and set
     `Closes #${input:issueNumber}` in the Linked Issue section.

Do not touch `src/core-ledger/**` or any `*.pem` file — these are excluded by policy.
