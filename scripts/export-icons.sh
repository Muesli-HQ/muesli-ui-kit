#!/bin/bash
# Re-export all glyphs (SF Symbols + custom) from scripts/symbols.json and scripts/symbols.d/*.json.
set -euo pipefail
cd "$(dirname "$0")/.."
ICON=$(mktemp -t muesli_app_icon).png
git -C "${MUESLI_REPO:-../../muesli}" show "${MUESLI_REF:-v0.8.6}:assets/muesli_app_icon.png" > "$ICON"
swift scripts/export-icons.swift "$ICON"
