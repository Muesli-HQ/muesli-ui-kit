// MeetingScreenSourcePicker + MeetingScreenThumbnail (MeetingScreenSourcePicker.swift @ v0.8.6), and the
// sheet window VisualMemoryController.requestRecording presents it in: an NSWindow 748×588
// (.titled, .fullSizeContentView, title "Record meeting screen") begun as a sheet on the dashboard window.
// Picker: VStack(alignment: .leading, spacing: 16) › padding(24) › frame(700 × 540), font MuesliTheme.body().
// The sheet's NSHostingController has no `.tint`, so `Color.accentColor` and `.borderedProminent` use the
// *system* accent (measured #3478F6 elsewhere in the app), not MuesliTheme.accent.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {NativeSegmented} from './parts';
import {Checkbox, NativeButton, NativeDivider, usePrimary, type NativeState} from '../time-turner/native';
import {SYSTEM_ACCENT} from '../time-turner/MemoryExplorer';
import {NativeSpinner, useSystemColors} from '../vidshots/native';

export interface ScreenSourceOption {
  /** "window-<id>" / "display-<id>" */
  id: string;
  /** Window: owning app name. Display: "Display N". */
  title: string;
  /** Window title (or "Untitled window"); display: "W × H". */
  subtitle: string;
  isDisplay: boolean;
  /** App icon (18×18). Displays use NSImage(systemSymbolName: "display"). */
  icon?: React.ReactNode;
  /** The transient SCScreenshotManager preview, or 'loading' (ProgressView) / 'failed'. */
  thumbnail?: React.ReactNode | 'loading' | 'failed';
}

export interface ScreenSourcePickerProps {
  sources: ScreenSourceOption[];
  /** Segmented Source picker: false = "Windows", true = "Entire displays". */
  displays?: boolean;
  selectedId?: string | null;
  /** Toggle "Play ‘This meeting is being recorded’" (off by default). */
  announce?: boolean;
  /** Tile under the pointer (`.buttonStyle(.plain)` has no hover look; kept for cursor choreography). */
  cancelState?: NativeState;
  recordState?: NativeState;
  /** Rotation phase for 'loading' thumbnails. */
  spinnerPhase?: number;
  /** Scroll offset of the source grid. */
  gridScrollY?: number;
  /** Wrap in the 748×588 sheet window (default). `false` renders the 700×540 SwiftUI content only. */
  sheet?: boolean;
}

/** Sheet window surface. VERIFY: macOS 26 sheet material/colour and corner radius (no capture of this sheet). */
const SHEET_BG_DARK = '#262628';
const SHEET_BG_LIGHT = '#ECECEC';

const Thumbnail: React.FC<{source: ScreenSourceOption; spinnerPhase: number}> = ({source, spinnerPhase}) => {
  const sys = useSystemColors();
  const t = source.thumbnail;
  return (
    // .frame(height: 120).frame(maxWidth: .infinity).background(.black.opacity(0.25)).clipShape(RoundedRectangle(8))
    <div style={{height: 120, alignSelf: 'stretch', background: 'rgba(0,0,0,0.25)', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {t === 'loading' || t === undefined ? (
        // ProgressView().controlSize(.small)
        <NativeSpinner size={16} phase={spinnerPhase} />
      ) : t === 'failed' ? (
        // Label("Preview unavailable", systemImage: "rectangle.on.rectangle").font(caption).foregroundStyle(.secondary)
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, ...type.caption, color: sys.secondary}}>
          <Symbol name="rectangle.on.rectangle" size={12} weight="regular" color={sys.secondary} />
          Preview unavailable
        </span>
      ) : (
        // Image(nsImage:).resizable().scaledToFit() — 440pt-wide capture fitted in the 120pt box
        <div style={{height: '100%', aspectRatio: '1.6', maxWidth: '100%', display: 'flex'}}>{t}</div>
      )}
    </div>
  );
};

const SourceTile: React.FC<{source: ScreenSourceOption; selected: boolean; spinnerPhase: number}> = ({source, selected, spinnerPhase}) => {
  const {colors} = useMuesliTheme();
  const primary = usePrimary();
  const sys = useSystemColors();
  return (
    <div
      style={{
        // VStack(alignment: .leading, spacing: 8).padding(10)
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
        padding: 10,
        minWidth: 0,
        borderRadius: 12,
        background: selected ? `color-mix(in srgb, ${SYSTEM_ACCENT} 15%, transparent)` : primary(0.04),
        // strokeBorder: selected → accentColor 2pt, else primary @ 0.12 1pt
        boxShadow: `inset 0 0 0 ${selected ? 2 : 1}px ${selected ? SYSTEM_ACCENT : primary(0.12)}`,
      }}
    >
      <Thumbnail source={source} spinnerPhase={spinnerPhase} />
      <div style={{display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, alignSelf: 'stretch'}}>
        {source.isDisplay ? (
          <span style={{width: 18, height: 18, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
            <Symbol name="display" size={15} weight="regular" color={colors.textPrimary} />
          </span>
        ) : source.icon ? (
          <span style={{width: 18, height: 18, flex: 'none', display: 'inline-flex'}}>{source.icon}</span>
        ) : null}
        <span style={{...type.headline, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0}}>{source.title}</span>
      </div>
      <span style={{...type.caption, color: sys.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>{source.subtitle}</span>
    </div>
  );
};

export const ScreenSourcePicker: React.FC<ScreenSourcePickerProps> = ({
  sources,
  displays = false,
  selectedId = null,
  announce = false,
  cancelState = 'rest',
  recordState,
  spinnerPhase = 0,
  gridScrollY = 0,
  sheet = true,
}) => {
  const {colors, isDark} = useMuesliTheme();
  const sys = useSystemColors();
  const visible = sources.filter((s) => s.isDisplay === displays);
  const canRecord = selectedId !== null && visible.some((s) => s.id === selectedId);

  const content = (
    <div
      style={{
        width: 700,
        height: 540,
        boxSizing: 'border-box',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
        ...type.body,
        color: colors.textPrimary,
      }}
    >
      {/* Text(...).font(MuesliTheme.font(.title2).bold()) — title2 is 20 semibold; .bold() makes it bold */}
      <span style={{...font(20, 'bold'), color: colors.textPrimary}}>Choose what to record</span>
      <span style={{color: sys.secondary}}>Screen and meeting audio are saved on this Mac.</span>
      <NativeSegmented options={['Windows', 'Entire displays']} selected={displays ? 1 : 0} width={280} />
      {/* ScrollView { LazyVGrid(.adaptive(minimum: 200), spacing 12).padding(2) } — 648pt → 3 columns of 208 */}
      <div style={{flex: 1, minHeight: 0, alignSelf: 'stretch', overflow: 'hidden'}}>
        <div style={{transform: `translateY(${-gridScrollY}px)`, padding: 2}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12}}>
            {visible.map((s) => (
              <SourceTile key={s.id} source={s} selected={s.id === selectedId} spinnerPhase={spinnerPhase} />
            ))}
          </div>
          {visible.length === 0 ? <div style={{color: sys.secondary, padding: 16}}>No available windows. Choose an entire display instead.</div> : null}
        </div>
      </div>
      <NativeDivider />
      <Checkbox label="Play ‘This meeting is being recorded’" checked={announce} />
      <span style={{...type.caption, color: sys.secondary, marginTop: 0}}>
        Let participants know before recording. Playback on this Mac may not reach remote participants.
      </span>
      <div style={{display: 'flex', alignItems: 'center', alignSelf: 'stretch'}}>
        <NativeButton state={cancelState}>Cancel</NativeButton>
        <div style={{flex: 1}} />
        {/* .keyboardShortcut(.defaultAction).buttonStyle(.borderedProminent), disabled until a source is selected */}
        <NativeButton
          state={canRecord ? recordState ?? 'rest' : 'disabled'}
          style={canRecord ? {background: recordState === 'pressed' ? `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.12)), ${SYSTEM_ACCENT}` : SYSTEM_ACCENT, color: '#FFFFFF'} : undefined}
        >
          Record Screen
        </NativeButton>
      </div>
    </div>
  );

  if (!sheet) return content;
  return (
    <div
      style={{
        width: 748,
        height: 588,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        background: isDark ? SHEET_BG_DARK : SHEET_BG_LIGHT,
        // VERIFY: sheet shadow / rim on macOS 26.
        boxShadow: isDark
          ? '0 0 0 0.5px rgba(255,255,255,0.16), 0 0 0 1px rgba(0,0,0,0.6), 0 22px 60px rgba(0,0,0,0.55)'
          : '0 0 0 0.5px rgba(0,0,0,0.18), 0 22px 60px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}
    >
      {content}
    </div>
  );
};
