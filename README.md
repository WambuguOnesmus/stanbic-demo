# Stanbic Bank — FX & Cross-Border Transfer Portal

GitHub Enterprise, GitHub Advanced Security (GHAS) and GitHub Copilot
demonstration for Stanbic Bank: a regulated retail banking use case
(KES → USD/GBP/EUR cross-border transfers) built end-to-end on the GitHub platform.

**Live prototype (visual spec):** https://wambuguonesmus.github.io/stanbic-demo/public/prototype/index.html

## Quick start

```bash
npm ci
npm run dev        # React app on http://localhost:4173 (prototype at /prototype/index.html)
npm run test:e2e   # Playwright E2E suite
```

## What's in this repo

| Pillar | Where |
|---|---|
| HTML prototype (GitHub Pages) | `public/prototype/index.html` |
| Issue/PR templates, CODEOWNERS | `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/CODEOWNERS` |
| Enterprise setup script (project board, branch protection) | `scripts/setup-gh-enterprise.sh` |
| Copilot instructions / skills / prompts / content exclusions | `.github/copilot-instructions.md`, `.github/skills/`, `.github/prompts/`, `.github/copilot-content-exclusion.json` |
| Playwright agents (plan → generate → heal) | `.github/agents/playwright-test-*.agent.md` |
| React app (Vite + TS strict + Tailwind) | `src/`, entry `index.html` |
| E2E suite (POM, `data-testid` only) + config | `e2e/` |
| CI: E2E, CodeQL, Dependency Review, SBOM + attestations | `.github/workflows/` |
| GHAS demo assets (deliberate vulns, custom secret patterns) | `src/utils/auditLogger.ts`, `src/config/stanbic-custom-patterns.json` |
| Wiki source (Developer Guide, Demo Talk Track) | `wiki/` |

## Delivery conventions

- Branch: `feature/FX-<id>-<kebab-slug>` · Commit: `feat(fx): #<id> <description>`
- Merges to `main` require a PR, CODEOWNERS approval, and green
  **Playwright E2E**, **CodeQL**, and **Dependency Review** checks.
- Every interactive element carries a kebab-case `data-testid="fx-*"` selector.

> ⚠️ `src/utils/auditLogger.ts` contains **deliberate vulnerabilities** to
> showcase CodeQL and Copilot Autofix. Do not reuse its patterns.
