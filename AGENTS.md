# AGENTS.md: working on the muesli UI kit

A React/TypeScript port of the muesli macOS app's SwiftUI interface at **v0.8.6**, used to build launch videos and
feature walkthroughs. Read `README.md` first: its **Porting rules** are mandatory. This file adds what agents tend to
get wrong.

## Where it lives

- The real folder is `Muesli-Launch/ui-kit` (git-tracked there). `guides-muesli/ui-kit` is a symlink to it, so an edit
  from either path is the same file. Commit in Muesli-Launch, and only when the owner asks.
- Public mirror: github.com/Muesli-HQ/muesli-ui-kit, refreshed by `scripts/publish-backup.sh`. That script must keep
  leaving out everything in `.backup-ignore`:
  - SF Symbols PNGs in `src/icons/generated/*@*.png` (Apple's licence forbids redistributing them);
  - the third-party app icons in `src/screens/timeline/app-icons/`;
  - `references/` (real user data).
  Never move those patterns out of the ignore list, and never put a home-directory path or a secret in a tracked file
  (the script refuses to push if it finds one). Only publish when the owner asks.

## Non-negotiables

1. **Port from the Swift at the tag.** `git -C "$MUESLI_REPO" show v0.8.6:native/MuesliNative/Sources/MuesliNativeApp/<File>.swift`
   (`MUESLI_REPO` = a checkout of github.com/Muesli-HQ/muesli; locally `../../muesli`). Copy strings verbatim. Cite the
   Swift file in the component's header comment, and mark anything the source doesn't determine with `VERIFY`.
2. **Never hand-draw or invent UI.** If a video needs a state that doesn't exist, add it here as a prop (hover,
   pressed, open menu, popover, countdown…), with a gallery entry.
3. **Everything animatable is a prop.** No timers, `Date.now()` or internal state: videos set state per frame.
4. **Real captures beat estimates.** When the owner shares a screenshot, sample its pixels and correct the kit, and
   note "measured from the owner's <date> capture" next to the value.
5. **Self-check:** `npx tsc --noEmit -p .` passes, and you've rendered and looked at the gallery entry
   (`npx remotion still gallery/src/index.ts <id> /tmp/x.png --scale=2`).

## Behaviour that's easy to get wrong (measured or traced in the source)

- **Accent tint follows window focus.** `DashboardRootView` sets `.tint(MuesliTheme.accent)`, so default bordered
  buttons draw the accent label on an accent @ 5% fill **in the key window**. In an inactive window they fall back to
  a grey fill (white ≈ 7.7%) with a label-colour title. `DashboardWindow focused` controls this through
  `ButtonTint` (`screens/time-turner/native.tsx`). Sheets presented from the window get the tint too. Wrap anything
  rendered outside `DashboardWindow` in `<ButtonTint>` yourself, and pass `focused={false}` when another app is in front.
- **Menus aren't tinted buttons.** A default-style `Menu` (to-do bell) keeps the grey fill, with an accent glyph and a
  label-colour chevron (`MenuButton`). A `.borderlessButton` menu (recap "…") draws glyph and chevron in the accent,
  even in an inactive window (`BorderlessMenu`).
- **Dates are formatted by locale.** The owner's locale is day-first: "6 Nov 2026", "Generated 6 Nov 2026 at 6:02 PM",
  numeric "6/11/2026". Keep fixtures that way.
- **The History panel glass** (inline `useGlass`) is near-clear (white @ 1%) with a 1pt rim (white @ 13%), not a solid grey.
- **Notifications** ("To-do reminder", "Daily recap ready", meeting detection) are muesli's own `NSPanel`
  (`MeetingNotificationController.swift`), not Notification Center. Use `MuesliNotification` and its wrappers in
  `screens/indicator/`. Card width comes from the text (344–420pt). Place it with `notificationOrigin` (top-right, 16pt margin).
- **Recap and to-dos:** `RecapSourcesPopover` ("Skill sources"), `RecapSettingsPopover` ("Recap settings",
  Automatic recap Off / Previous day / Current day, Generate at HH:00), `NativeMenuList` for NSMenus. Recap and
  to-do views take `actionStates`, `popover`, `pressedSource`, `controlStates` and `reminderMenu` for choreography.
- Native-control look-alikes are duplicated per screen folder (see README "Tidy-up needed"). Before adding another,
  reuse the closest one.

## Icons

SF Symbols go through `<Symbol name size weight color>`. For a new name/weight pair, add it to
`scripts/symbols.d/<group>.json` and run `MUESLI_REPO=<muesli checkout> scripts/export-icons.sh` (macOS only). In the
public mirror the PNGs are missing until someone runs that script. Never substitute a lookalike glyph.
