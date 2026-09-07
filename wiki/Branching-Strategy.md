# Branching Strategy

All work on the Stanbic Banking Portal traces back to a GitHub Issue. The
**issue number is the Item ID** — it appears in the branch name, every commit,
and the PR link.

## Branch naming

```
feature/<id>-<description>
fix/<id>-<description>
```

- `<id>` — the GitHub issue number (Item ID), e.g. `9`
- `<description>` — short kebab-case summary, e.g. `recent-transfers-history`

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<id>-<description>` | `feature/9-recent-transfers-history` |
| Defect fix | `fix/<id>-<description>` | `fix/14-quote-rounding` |
| CI / tooling | `chore/<id>-<description>` | `chore/12-node-20-upgrade` |

Create the branch from a fresh `main`:

```bash
git switch main && git pull
git switch -c feature/9-recent-transfers-history
```

## Commit convention (Conventional Commits)

```
feat(portal): #<id> <imperative description>
fix(portal): #<id> <imperative description>
test(portal): #<id> <imperative description>
chore(ci): <description>
```

Example: `feat(portal): #9 add recent transfers history panel`

## Pull request flow

1. Push the branch and open a PR into `main` — the
   [PR template](../.github/PULL_REQUEST_TEMPLATE.md) loads automatically;
   complete **every** section of the banking compliance checklist.
2. Link the issue with `Closes #<id>` so the Item ID travels with the change
   and the issue auto-closes on merge.
3. Merging requires:
   - 1+ approval from CODEOWNERS (stale approvals are dismissed on new pushes)
   - Green required checks: **Playwright E2E Tests**, **CodeQL**, **Dependency Review**
   - Linear history — squash or rebase only, no merge commits
4. The branch is deleted automatically on merge.

## Rules

- Never commit directly to `main` — it is protected.
- One issue per branch; one branch per issue.
- Rebase on `main` to update a stale branch; never merge `main` into it.
