#!/bin/bash
# Captures reference screenshots of the real dashboard, one per sidebar tab, window-only and shadowless.
#   ui-kit/scripts/capture-reference.sh [bundle-id=com.muesli.dev] [out=ui-kit/references/<bundle>-<date>]
# Needs Screen Recording + Accessibility for the terminal app (restart it after granting).
# Output contains real user data: ui-kit/references/ is git-ignored.
set -euo pipefail
cd "$(dirname "$0")/../.."
BUNDLE=${1:-com.muesli.dev}
OUT=${2:-ui-kit/references/${BUNDLE##*.}-$(date +%Y-%m-%d)}
mkdir -p "$OUT"
TOOLS=$(mktemp -d)

cat > "$TOOLS/winid.swift" <<'EOF'
import CoreGraphics
let pid = Int(CommandLine.arguments[1])!
let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly], kCGNullWindowID) as! [[String: Any]]
// The dashboard is the largest normal-layer window of the app.
let best = list.filter { ($0[kCGWindowOwnerPID as String] as? Int) == pid && ($0[kCGWindowLayer as String] as? Int) == 0 }
  .max { a, b in
    let ba = a[kCGWindowBounds as String] as! [String: Double], bb = b[kCGWindowBounds as String] as! [String: Double]
    return ba["Width"]! * ba["Height"]! < bb["Width"]! * bb["Height"]!
  }
if let w = best { print(w[kCGWindowNumber as String]!) }
EOF
swiftc -O "$TOOLS/winid.swift" -o "$TOOLS/winid" 2>/dev/null

# Presses sidebar buttons through the Accessibility API (no mouse movement, no focus steal).
cat > "$TOOLS/axpress.swift" <<'EOF2'
import ApplicationServices
import Foundation
let a = CommandLine.arguments
let app = AXUIElementCreateApplication(pid_t(Int32(a[1])!))
func attr(_ e: AXUIElement, _ k: String) -> AnyObject? { var v: AnyObject?; AXUIElementCopyAttributeValue(e, k as CFString, &v); return v }
var found: AXUIElement?; var seen = 0
func walk(_ e: AXUIElement, _ d: Int) {
  if found != nil || d > 40 || seen > 20000 { return }; seen += 1
  if (attr(e, kAXRoleAttribute) as? String) == "AXButton",
     (attr(e, kAXDescriptionAttribute) as? String) == a[2] || (attr(e, kAXTitleAttribute) as? String) == a[2] { found = e; return }
  for c in (attr(e, kAXChildrenAttribute) as? [AXUIElement] ?? []) { walk(c, d + 1) }
}
for w in (attr(app, kAXWindowsAttribute) as? [AXUIElement] ?? []) { walk(w, 0) }
guard let t = found else { exit(2) }
exit(AXUIElementPerformAction(t, kAXPressAction as CFString) == .success ? 0 : 3)
EOF2
swiftc -O "$TOOLS/axpress.swift" -o "$TOOLS/axpress" 2>/dev/null

APP=$(osascript -e "POSIX path of (path to application id \"$BUNDLE\")")
open -a "$APP"        # reopens the dashboard window if it was closed
sleep 3
PID=$(osascript -e "tell application \"System Events\" to get unix id of first process whose bundle identifier is \"$BUNDLE\"")

i=0
for tab in "Timeline" "Time Turner" "Dictations" "Vidshots" "Meetings" "Chat" "Dictionary" "Insights" "Models" "Shortcuts" "Settings" "About"; do
  i=$((i + 1))
  if ! "$TOOLS/axpress" "$PID" "$tab"; then echo "skip $tab (not in sidebar)"; continue; fi
  sleep 1.5
  id=$("$TOOLS/winid" "$PID")
  [ -n "$id" ] || { echo "dashboard window closed" >&2; exit 1; }
  screencapture -x -o -l"$id" "$OUT/$(printf '%02d' $i)-$(echo "$tab" | tr 'A-Z ' 'a-z-').png" && echo "captured $tab"
done
rm -rf "$TOOLS"
echo "Done → $OUT (git-ignored; contains real data)"
