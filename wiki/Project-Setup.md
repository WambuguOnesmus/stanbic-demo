# Project Setup

How to get the Stanbic Banking Portal running locally from a clean machine.

## 1. Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20 LTS | `node -v` |
| npm | 10+ | `npm -v` |
| Git | 2.40+ | `git --version` |
| GitHub CLI | 2.40+ | `gh --version` |

## 2. Clone and install

```bash
git clone https://github.com/WambuguOnesmus/stanbic-demo.git
cd stanbic-demo
npm ci          # deterministic install — never plain `npm install` on shared branches
```

## 3. Run the app

```bash
npm run dev
```

- React app: http://localhost:4173
- HTML prototype (visual spec): http://localhost:4173/prototype/index.html

## 4. Run the tests

```bash
npx playwright install chromium   # first time only
npm run test:e2e                  # headless run (starts the dev server itself)
npm run test:e2e:ui               # interactive debugging
npm run typecheck                 # TypeScript strict gate
```

## 5. Configure commit signing (required — main rejects unsigned commits)

```bash
git config commit.gpgsign true
git config user.signingkey <YOUR_KEY_ID>
```

## 6. Verify your setup

1. `npm run dev` → the portal renders with accounts, quick actions, transfer and transactions.
2. `npm run test:e2e` → all specs pass.
3. Open the [project board](https://github.com/orgs/WambuguOnesmus/projects/1) and pick an issue.
4. Branch per the [Branching Strategy](Branching-Strategy.md) — `feature/<id>-<description>`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npm ci` fails on lockfile | Pull latest `main`; never edit `package-lock.json` by hand |
| Port 4173 in use | Stop the other process — the port is fixed (`strictPort`) for Playwright |
| Playwright browser missing | `npx playwright install chromium` |
| Push rejected: secret detected | Remove the secret and recommit — do not bypass push protection |
