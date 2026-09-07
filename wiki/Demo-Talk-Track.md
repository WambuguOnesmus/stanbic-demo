# Stanbic Bank — GitHub Enterprise Live Demo Talk Track

**Audience:** Stanbic engineering leadership, CISO office, transformation programme leads
**Duration:** ~45 minutes
**Narrative:** "From regulated-bank risk to regulated-bank velocity — one platform, auditable end to end."

---

## Act 0 — Setup (before the meeting)

- [ ] Run `scripts/setup-gh-enterprise.sh enterprise-org stanbic-fx-portal`
- [ ] Publish `public/prototype/index.html` to GitHub Pages; capture 2 clean screenshots
      (quote panel + success confirmation)
- [ ] Create issue **FX-101** from the feature template with a screenshot attached
- [ ] Pre-stage a branch with `src/utils/auditLogger.ts` changes so CodeQL alerts exist
- [ ] Have a terminal ready with a fake `STB_LIVE_<32 chars>` token in an uncommitted file

---

## Act 1 — Governed Intake (5 min)

**Show:** Issue templates → project board.

1. Open **New Issue → Feature Request**. Point out the enforced fields: *Item ID,
   Business Value, Acceptance Criteria, prototype screenshot upload, Definition of Ready.*
2. Show the **Stanbic FX Modernization** project board with custom fields
   (Sprint, Item ID, Risk Tier).

> **ROI line:** "Nothing enters your delivery pipeline without a risk tier and
> testable acceptance criteria. Governance starts at intake, not at audit time."

## Act 2 — Copilot With Guardrails (10 min)

**Show:** Content exclusion → custom instructions → screenshot-to-code.

1. In VS Code, open a file under `src/core-ledger/` and show Copilot is **inactive**
   (content exclusion). Then open `src/components/` — Copilot is active.
   > "Your core banking IP never leaves the boundary. This is a policy control,
   > set org-wide by your security team — not developer discipline."
2. Open `.github/copilot-instructions.md` and the `react-component` skill:
   commit convention, strict TypeScript, mandatory `data-testid` — every
   suggestion Copilot makes is pre-shaped to your standards.
3. **The showpiece:** open Copilot Chat, run the `implement-from-screenshot`
   prompt against issue FX-101 with the prototype screenshot attached. Watch it
   scaffold the component **and** the Playwright spec, following house rules.

> **ROI line:** "Copilot isn't a junior dev pasting from the internet — it's your
> best senior engineer's standards, applied to every keystroke, with your IP excluded."

## Act 3 — Push Protection Stops a Breach (5 min)

**Show:** Custom secret pattern blocking a push.

1. Add the fake `STB_LIVE_...` token to a file, commit, and `git push`.
2. The push is **rejected at the client** by secret scanning push protection with
   the custom Stanbic pattern (`src/config/stanbic-custom-patterns.json`).

> **ROI line:** "The average cost of a leaked credential incident in banking runs
> into millions plus regulator scrutiny. This control costs a developer four
> seconds and stops the leak *before* it exists in history."

## Act 4 — The Governed Pull Request (10 min)

**Show:** PR template, CODEOWNERS, required checks, Copilot PR summary.

1. Open the staged PR. Walk the **banking compliance checklist** — architecture,
   GHAS green, Playwright pass, data privacy sign-off.
2. Show required reviewers auto-assigned via CODEOWNERS
   (`@enterprise-org/core-banking-leads`), stale-review dismissal, signed commits,
   linear history — all enforced, not requested.
3. Click **Copilot → Generate summary** on the PR; show the checks panel:
   *Playwright E2E Tests*, *CodeQL*, *Dependency Review* — merge button disabled
   until all are green.

> **ROI line:** "Your four-eyes principle, change traceability, and segregation of
> duties are encoded in the platform. Audit evidence is generated as a by-product
> of working, not as a quarterly scramble."

## Act 5 — CodeQL Finds It, Copilot Autofix Fixes It (8 min)

**Show:** The `auditLogger.ts` alerts.

1. Open the **Security → Code scanning** tab: two findings on the PR —
   *DOM XSS (js/xss-through-dom)* and *Command injection (js/command-line-injection)*.
2. Open the XSS alert → click **Generate fix** (Copilot Autofix). Show the
   suggested patch (textContent instead of innerHTML) and commit it from the UI.
3. Re-run checks; alert closes; merge unblocks.

> **ROI line:** "Mean-time-to-remediate for code vulnerabilities drops from weeks
> in a backlog to minutes in the PR — with the fix reviewed by the same governed
> process as any other change."

## Act 6 — Supply Chain & Audit (5 min)

**Show:** Dependabot, Dependency Review, SBOM + attestation.

1. Show a Dependabot PR (weekly, grouped, conventional-commit prefixed).
2. Show a Dependency Review check blocking a vulnerable package at the PR gate.
3. Open a release run of `release-attestation.yml`: SPDX SBOM artifact + signed
   provenance. Run live:
   ```bash
   gh attestation verify stanbic-fx-portal-v1.0.0.tar.gz --owner enterprise-org
   ```

> **ROI line:** "When the regulator asks *'prove exactly what shipped and who
> built it'*, the answer is one CLI command backed by Sigstore cryptography —
> not a three-week evidence hunt."

## Act 7 — Close (2 min)

Recap the chain: **governed intake → guarded AI → protected secrets → gated PR →
auto-remediated vulnerabilities → attested releases.**

> "Every control you saw is the *paved road* — the fastest path for your
> developers is also the compliant one. That is how Stanbic ships faster while
> reducing regulatory risk."

### Objection Cheat Sheet

| Objection | Response |
|-----------|----------|
| "Copilot will leak our code" | Content exclusions + enterprise no-training guarantees; showed core-ledger exclusion live. |
| "AI writes insecure code" | Every AI suggestion passes the same CodeQL + review gates as human code — and Autofix *reduces* existing vuln debt. |
| "We already have SAST" | CodeQL runs in the PR with fix suggestions, not a monthly report; remediation happens where developers work. |
| "Audit burden" | Branch protection + attestations generate immutable evidence automatically. |
