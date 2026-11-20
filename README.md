# Muesli UI kit: the real 0.8.6 app, rebuilt for video

A faithful React/TypeScript recreation of Muesli's SwiftUI interface at **v0.8.6**, in Nunito Sans. Every launch video builds its screens from this kit. Nothing is drawn by hand.

- Pure React components, driven by props. No Remotion dependency in `src/`, so they also render in plain web pages or HyperFrames.
- Every value is traced to a Swift file at the `v0.8.6` tag. Colours and type are **generated** from `MuesliTheme.swift`.
- Interaction state (hover, pressed, selected, focused) is a prop, so a video can choreograph a cursor frame by frame.

## Using it in a video

```tsx
import {MuesliThemeProvider, DashboardWindow, loadMuesliFonts} from '../../ui-kit/src';

// Await loadMuesliFonts() before capturing frames (see gallery/src/KitFrame.tsx for Remotion).
<MuesliThemeProvider appearance="dark">   {/* dark | light | ultraDark; optional accent="#hex" */}
  <DashboardWindow sidebar={{selected: 'timeTurner', userName: 'Maya'}}>
    {/* a page from src/screens */}
  </DashboardWindow>
</MuesliThemeProvider>
```

Sizes are in points at 1×, matching SwiftUI. Render at `--scale=2` for Retina-sharp output, or scale the window up inside a composition.

- **Window:** the 1120×790 frame includes a 32pt titlebar, so page content is 1120×758 (`layout.contentHeight`). This, the 16pt corners, the 14pt traffic lights (centres x 16/39/62, y 16) and the 1pt black divider are all measured from a real capture.
- **Text rendering:** never set `-webkit-font-smoothing: antialiased`. With default smoothing, Chrome on macOS matches CoreText's text weight (measured: mean ink 23.3 vs the app's 23.6). Antialiased renders visibly thinner.

## Layout

| Path | What | Source of truth (v0.8.6) |
|---|---|---|
| `src/tokens/generated.ts` | Raw colours, opacities, spacing, radii, type scale. **Generated; don't edit.** | `MuesliTheme.swift` |
| `src/tokens/theme.ts` | `resolveTheme(appearance, accent?)`: Dark / Light / Ultra Dark, plus the WCAG accent derivation | `MuesliTheme.swift`, `MuesliAccentPalette.swift` |
| `src/fonts/` | Nunito Sans (7 faces, OFL) + `loadMuesliFonts()` | `Resources/Fonts`, `AppFonts.swift` |
| `src/typography.ts` | `font(size, weight)` and named roles (`type.title1` … `type.metadata`) | `MuesliTheme.font` |
| `src/icons/` | `Symbol` (real SF Symbols exported from macOS), `TimeTurnerIcon`, `VidshotIcon`, `MuesliMark` | `TimeTurnerIcon.swift`, `VidshotIcon.swift`, `MenuBarIconRenderer.swift` |
| `src/primitives/` | `Button` (all 9 `MuesliButtonStyle` kinds × 4 states), `GlassCircleButton`, `NewBadge`, `PageTitle`, `RowFeedback` | `MuesliControlStyles.swift`, `NewFeatureBadge.swift` |
| `src/chrome/MacWindow.tsx` | macOS 26 window frame and traffic lights | `RecentHistoryWindowController.swift` + reference capture |
| `src/dashboard/` | `Sidebar` (expanded 240 / collapsed 68, 12 tabs, Meetings folders, appearance switch), `DashboardWindow` | `SidebarView.swift`, `SidebarOrder.swift`, `DashboardRootView.swift` |
| `src/screens/<feature>/` | Pages and overlays (Timeline, Time Turner, Vidshots, Meetings, Chat, notch indicator, Cotypist…) | the matching Swift views |
| `src/fixtures/` | Shared fictional demo data | — |
| `gallery/` | Remotion previews of every component: `gallery/src/index.ts` (all), `gallery/src/entries/<group>.ts` (per group) | — |
| `scripts/` | `extract-tokens.mjs`, `export-icons.sh` (+ `symbols.json`, `symbols.d/*.json`), `capture-reference.sh` | — |
| `references/` | Screenshots of the real app for comparison. **Git-ignored: contains real user data.** | MuesliDev / preprod build |

## Updating for a new release

```sh
node ui-kit/scripts/extract-tokens.mjs v0.8.7        # regenerate tokens; fails loudly if a role disappeared
MUESLI_REF=v0.8.7 ui-kit/scripts/export-icons.sh     # re-export glyphs
ui-kit/scripts/capture-reference.sh                 # fresh reference screenshots (needs Screen Recording)
```
Then diff the changed Swift views (`git -C ../muesli diff v0.8.6 v0.8.7 -- native/MuesliNative/Sources/MuesliNativeApp`) and update the matching components.

## Porting rules (for anyone adding a screen)

1. **Read the Swift, don't eyeball.** Find the view in `native/MuesliNative/Sources/MuesliNativeApp` at the tag (`git -C "$MUESLI_REPO" show v0.8.6:<path>`, where `MUESLI_REPO` is a checkout of github.com/Muesli-HQ/muesli). Port its structure: stacks become flex, `spacing:` becomes `gap`, `.padding` becomes padding, `.frame` becomes width/height.
2. **Only tokens.** Colours come from `useMuesliTheme().colors`. Type uses `type.*` or `font(size, weight)` with the Swift's exact size and weight. Spacing and radii use `spacing` / `radius`. A literal number is fine only when the Swift has the same literal; cite the file in a comment.
3. **Real copy.** Use the exact strings from the Swift source (labels, placeholders, empty states). Never invent feature names.
4. **SF Symbols** go through `<Symbol name size weight color>`, matching `.font(.system(size:, weight:))`. For a new name/weight pair, add it to `scripts/symbols.d/<group>.json` and run `scripts/export-icons.sh`. Never substitute a lookalike icon.
5. **Props, not internal state.** Everything a video may animate is a prop: selection, hover/pressed, progress, text typed so far, timestamps. No `useEffect` timers and no `Date.now()`.
6. **Fictional fixtures only.** Plausible people and companies. Never real user data from `references/`.
7. **Header comment** in every file naming the Swift file(s) it ports, and a `VERIFY` comment wherever the source doesn't fully determine the look (system materials, Liquid Glass, native controls).
8. **Self-check.** Render your gallery entry at `--scale=2`, look at the PNG, and fix anything that doesn't match the Swift layout. `npx tsc -p ui-kit/tsconfig.json` must pass.

## Status

- **Done (from source):** tokens, fonts, type, icons, buttons, badges, sidebar (both modes), window.
- **Added 2026-11-15 (from source, not yet compared with captures):** first-run onboarding (`screens/onboarding`, all 7 steps), Settings › Dictations and Settings › Meetings panes (`settings/DictationMeetingsPanes.tsx`), the floating meeting live-transcript panel (`meetings/FloatingMeetingTranscript.tsx`), the System Settings permission drag guide (`onboarding/PermissionGuide.tsx`), floating-pill state transitions (`indicator/FloatingIndicatorTransition.tsx`, timing checked against a capture), muesli's notification panel (`indicator/MuesliNotification.tsx`), Time Turner recap/to-do popovers and menus.
- **Screens (from source, 2026-11-09):** Timeline, Dictations, Time Turner (setup, history/scrub, search, recap, to-dos, focus), Vidshots (page, detail, recording pill in all states, picker, ink), Meetings (browser, detail, notes, transcript), Chat (index, conversation with citations, composer, docked bar, pickers), dictation indicator (notch, all 11 phases, plus floating pill), Cotypist (ghost suggestion, setup guide), Settings (General, Appearance, Experimental), Models (Dictation, Cotypist). Exported as namespaces: `Timeline`, `Dictations`, `TimeTurner`, `Vidshots`, `Meetings`, `Chat`, `Indicator`, `Cotypist`, `Settings`, `Models`.
- **Gallery:** 85 compositions. `cd ui-kit/gallery && npx remotion studio src/index.ts` opens them all; render one with `npx remotion still src/index.ts <id> out.png --scale=2 --bundle-cache=false`.
- **Not yet ported:** Insights, Dictionary, Shortcuts, About; Quill assistant; Computer Use panels; feature tour; global search results; failed dictations; upcoming meetings window; Granola import; menu bar menu; the Live Meetings/Cleanup/Quill model categories.
- **Behaviour notes from the source:** chat answers appear whole in 0.8.6 (no token streaming); the notch is hidden when idle; Cotypist shows grey ghost text only, with no badge or hint.
- **Compared with the real app (2026-11-10, dark):** captures of MuesliDev (v0.8.6 code) are in `references/muesli-dev-2026-11-09/dark/` (git-ignored, real data). The window chrome, divider, glass toggle, text weight, CoreText line height and the sidebar were calibrated here. Timeline, Dictations, Time Turner (History), Meetings browser, Chat, Settings › General and Models › Dictation each match their capture within ~1pt. Vidshots matches its empty state only, which is all the capture shows.
- **Measured system values worth reusing:** label colours on the page are white at 85% (primary) and 55% (secondary). Native pop-ups and segmented controls are 24pt tall with SF Pro 13 labels and fills of white at about 7–8% over their surface. The scrubber playhead uses the *system* accent (#3478F6), not Muesli's. Exact values are commented at each control.
- **Tidy-up needed:** native-control look-alikes now exist in several screen folders (`settings/controls.tsx`, `timeline/pageParts.tsx`, `time-turner/native.tsx`, `vidshots/native.tsx`, `meetings/parts.tsx`). Each is calibrated for its own context; merge them into `primitives/native/` before adding more screens.
- **Still unverified:** light appearance (no light captures yet); the focused-window accent switch; the notch and floating indicator (only visible while dictating); Vidshots list, detail and overlays; popovers, menus and sheets; Insights/Dictionary/Shortcuts/About (not ported). Re-run `scripts/capture-reference.sh` with the system in Light mode to cover light.

## Hosted backup

Public mirror: [Muesli-HQ/muesli-ui-kit](https://github.com/Muesli-HQ/muesli-ui-kit), refreshed with `scripts/publish-backup.sh`.
It leaves out what can't be redistributed (`.backup-ignore`): the SF Symbols glyph PNGs in `src/icons/generated/`
(regenerate on a Mac with `MUESLI_REPO=<muesli checkout> scripts/export-icons.sh`), the third-party app icons in
`src/screens/timeline/app-icons/` (add your own PNGs with the same names) and `references/` (private captures).
Code is MIT (see `LICENSE`); Nunito Sans is under the SIL Open Font License (`src/fonts/OFL.txt`).

