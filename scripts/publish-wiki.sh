#!/usr/bin/env bash
# =============================================================================
# Publish the wiki pages to the GitHub wiki (WambuguOnesmus/stanbic-demo).
#
# PREREQUISITE (one-time, manual — GitHub has no API for this):
#   Open https://github.com/WambuguOnesmus/stanbic-demo/wiki and click
#   "Create the first page", then "Save page". Any content is fine.
#
# The wiki page sources live in git history (last present at the commit before
# they were removed); this script recovers them and pushes to the wiki repo.
#
# Usage: ./scripts/publish-wiki.sh
# =============================================================================
set -euo pipefail

REPO="WambuguOnesmus/stanbic-demo"
WIKI_REMOTE="https://github.com/${REPO}.wiki.git"
TMP="$(mktemp -d)"

# Recover wiki pages from the last commit that contained them
LAST_WIKI_COMMIT="$(git log -1 --format=%H -- wiki/)"
git --work-tree="${TMP}" checkout "${LAST_WIKI_COMMIT}" -- wiki/
mv "${TMP}/wiki/"*.md "${TMP}/"
rmdir "${TMP}/wiki"

cat > "${TMP}/Home.md" <<'EOF'
# Stanbic Banking Portal Wiki

- [[Project-Setup]] - how to set up the project locally
- [[Branching-Strategy]] - feature/<id>-<description>, issue number = Item ID
- [[Developer-Guide]] - onboarding, conventions, test standards
- [[Demo-Talk-Track]] - step-by-step pitch walkthrough
EOF

cd "${TMP}"
git init -b master
git add -A
git commit -m "docs: publish wiki"
git push --force "${WIKI_REMOTE}" master
echo "Wiki published: https://github.com/${REPO}/wiki"
