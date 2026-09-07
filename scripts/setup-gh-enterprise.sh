#!/usr/bin/env bash
# =============================================================================
# Stanbic Portal Modernization — GitHub Enterprise Repository Bootstrap
# =============================================================================
# Configures:
#   1. GitHub Project board "Stanbic Portal Modernization" with custom fields
#      (Sprint, Item ID, Risk Tier)
#   2. Enterprise branch protection on 'main':
#      - PR required with 1+ CODEOWNERS approval
#      - Dismiss stale reviews on new pushes
#      - Signed commits, linear history
#      - Required status checks: Playwright E2E, CodeQL, Dependency Review
#
# Prerequisites:
#   - GitHub CLI >= 2.40 authenticated with admin + project scopes:
#       gh auth login
#       gh auth refresh -s project,repo,admin:org
#   - jq installed
#
# Usage:
#   ./scripts/setup-gh-enterprise.sh <org> <repo>
#   e.g. ./scripts/setup-gh-enterprise.sh enterprise-org stanbic-banking-portal
# =============================================================================
set -euo pipefail

ORG="${1:?Usage: $0 <org> <repo>}"
REPO="${2:?Usage: $0 <org> <repo>}"
FULL_REPO="${ORG}/${REPO}"
PROJECT_TITLE="Stanbic Portal Modernization"

log()  { printf '\033[1;34m[setup]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m[ ok ]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }

command -v gh >/dev/null || fail "GitHub CLI (gh) is required."
command -v jq >/dev/null || fail "jq is required."
gh auth status >/dev/null || fail "Not authenticated. Run: gh auth login"

# -----------------------------------------------------------------------------
# 1. GitHub Project board with custom fields
# -----------------------------------------------------------------------------
log "Creating GitHub Project: '${PROJECT_TITLE}' under ${ORG}…"

PROJECT_NUMBER=$(gh project list --owner "${ORG}" --format json \
  | jq -r --arg t "${PROJECT_TITLE}" '.projects[] | select(.title == $t) | .number' | head -n1)

if [[ -z "${PROJECT_NUMBER}" ]]; then
  PROJECT_NUMBER=$(gh project create --owner "${ORG}" --title "${PROJECT_TITLE}" --format json | jq -r '.number')
  ok "Project #${PROJECT_NUMBER} created."
else
  ok "Project #${PROJECT_NUMBER} already exists — reusing."
fi

create_field() {
  local name="$1" data_type="$2" options="${3:-}"
  if gh project field-list "${PROJECT_NUMBER}" --owner "${ORG}" --format json \
    | jq -e --arg n "${name}" '.fields[] | select(.name == $n)' >/dev/null; then
    ok "Field '${name}' already exists — skipping."
    return
  fi
  if [[ "${data_type}" == "SINGLE_SELECT" ]]; then
    gh project field-create "${PROJECT_NUMBER}" --owner "${ORG}" \
      --name "${name}" --data-type "${data_type}" \
      --single-select-options "${options}" >/dev/null
  else
    gh project field-create "${PROJECT_NUMBER}" --owner "${ORG}" \
      --name "${name}" --data-type "${data_type}" >/dev/null
  fi
  ok "Field '${name}' (${data_type}) created."
}

log "Creating custom project fields…"
create_field "Sprint"    "ITERATION" || create_field "Sprint" "TEXT"
create_field "Item ID"   "TEXT"
create_field "Risk Tier" "SINGLE_SELECT" "Tier 1 - Money Movement,Tier 2 - Customer Facing,Tier 3 - Internal"

# Link project to the repository
gh project link "${PROJECT_NUMBER}" --owner "${ORG}" --repo "${FULL_REPO}" >/dev/null 2>&1 \
  && ok "Project linked to ${FULL_REPO}." \
  || log "Project link skipped (may already be linked)."

# -----------------------------------------------------------------------------
# 2. Enterprise branch protection on 'main'
# -----------------------------------------------------------------------------
log "Applying branch protection to '${FULL_REPO}:main'…"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${FULL_REPO}/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "Playwright E2E Tests" },
      { "context": "CodeQL" },
      { "context": "Dependency Review" }
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "lock_branch": false
}
JSON
ok "Branch protection applied."

log "Requiring signed commits on 'main'…"
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/${FULL_REPO}/branches/main/protection/required_signatures" >/dev/null
ok "Signed commits required."

# -----------------------------------------------------------------------------
# 3. Repository security features (GHAS)
# -----------------------------------------------------------------------------
log "Enabling GHAS features (Advanced Security, secret scanning, push protection)…"
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  "/repos/${FULL_REPO}" \
  --input - <<'JSON'
{
  "security_and_analysis": {
    "advanced_security": { "status": "enabled" },
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" }
  },
  "allow_merge_commit": false,
  "allow_squash_merge": true,
  "allow_rebase_merge": true,
  "delete_branch_on_merge": true
}
JSON
ok "GHAS + merge hygiene configured."

echo
ok "Setup complete for ${FULL_REPO}."
echo "  Project board : https://github.com/orgs/${ORG}/projects/${PROJECT_NUMBER}"
echo "  Branch rules  : https://github.com/${FULL_REPO}/settings/branches"
echo "  Security      : https://github.com/${FULL_REPO}/settings/security_analysis"
