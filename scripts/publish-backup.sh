#!/bin/bash
# Refresh the public mirror github.com/Muesli-HQ/muesli-ui-kit from this folder (working tree, incl. uncommitted
# changes), leaving out everything in .backup-ignore. Usage: scripts/publish-backup.sh ["commit message"]
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=Muesli-HQ/muesli-ui-kit
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q "https://github.com/$REPO.git" "$TMP/repo" 2>/dev/null
git -C "$TMP/repo" checkout -q -B main
rsync -a --delete --exclude .git --exclude-from=.backup-ignore ./ "$TMP/repo/"
cp .backup-ignore "$TMP/repo/.gitignore"
cd "$TMP/repo"
# Refuse to publish anything that looks like a secret or a local home path.
if grep -rnIE "(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|BEGIN [A-Z ]*PRIVATE KEY|/Users/[a-z])" --exclude-dir=.git .; then
  echo "publish-backup: refusing to push, review the matches above" >&2; exit 1
fi
git add -A
if git diff --cached --quiet; then echo "publish-backup: already up to date"; exit 0; fi
git commit -q -m "${1:-Sync ui-kit $(date +%Y-%m-%d)}"
git push -q origin main
echo "publish-backup: pushed $(git rev-parse --short HEAD) to $REPO"
