// MemoryExplorerView + dayScrubber + TimeTurnerEmptyState (TimeTurnerView.swift @ v0.8.6).
// `mode="inline"` is the History tab (520pt tall, glass radius 18, plain header);
// `mode="focus"` is the window TimeTurnerFocusPresenter hosts (glass radius 24, day picker,
// glass buttons, info bar over the screenshot, optional captured-text column).
// Everything a video animates is a prop: playhead, selected capture, search popover, text panel.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {AppIcon, CaptureImage} from './CaptureImage';
import {CONTROL_SYMBOL_SIZE, NativeButton, NativeSymbol, BorderlessMenu, useGlass, useLabelColors, envFont, type NativeState} from './native';
import {TimeTurnerEmptyState} from './EmptyState';
import {
  captureSource,
  createScrubScale,
  formatDateTimeStandard,
  formatTimeShort,
  formatTimeStandard,
  iconMarkers,
  nearestIndex,
  type TimeTurnerCapture,
} from './model';
import {TimeTurnerSearchPopover, type TimeTurnerSearchProps} from './SearchPopover';

/** `.buttonStyle(.glass).buttonBorderShape(.capsule)` (macOS 26). VERIFY. */
const GlassButton: React.FC<{state?: NativeState; size?: number; children: React.ReactNode}> = ({state = 'rest', size = 28, children}) => {
  const glass = useGlass(size / 2, true);
  return (
    <div
      style={{
        ...glass,
        minWidth: size,
        height: size,
        padding: '0 2px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        opacity: state === 'disabled' ? 0.45 : 1,
        filter: state === 'pressed' ? 'brightness(1.15)' : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Track y within the 34pt scrubber: Swift offsets 14, measured 11 in the reference. */
const TRACK_TOP = 11;

/** NSColor.controlAccentColor (Blue), measured from the dark reference. */
export const SYSTEM_ACCENT = '#3478F6';

export interface TimeTurnerScrubberProps {
  captures: TimeTurnerCapture[];
  /** Playhead time (seconds since midnight). */
  playhead: number;
  /** Index of the selected capture (exact selection or nearest to playhead). */
  index: number;
  /** Track width in pt (GeometryReader width). */
  trackWidth: number;
}

/** MemoryExplorerView.dayScrubber */
export const TimeTurnerScrubber: React.FC<TimeTurnerScrubberProps> = ({captures, playhead, index, trackWidth}) => {
  const {colors} = useMuesliTheme();
  const label = useLabelColors(true);
  const {isDark} = useMuesliTheme();
  const primary = (a: number) => (isDark ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`);
  const times = captures.map((c) => c.time);
  const scale = createScrubScale(times);
  const selected = captures[index];
  const first = times.length ? times[0] : 0;
  const last = times.length ? times[times.length - 1] : 0;
  // VisualMemoryDayTimeline.captureInterval: start = min(first, last − 1)
  const intervalStart = Math.min(first, last - 1);
  const intervalDuration = last - intervalStart;
  const trackHeight = 34;
  const segments = captures.map((item, offset) => {
    const x = Math.min(Math.max(0, trackWidth - 2), scale.fraction(item.time) * trackWidth);
    const next = offset + 1 < captures.length ? captures[offset + 1].time : item.time + 1;
    const duration = Math.min(120, Math.max(1, next - item.time));
    const width = Math.max(2, (scale.fraction(item.time + duration) - scale.fraction(item.time)) * trackWidth);
    return {x, width: Math.min(width, trackWidth - x)};
  });
  const markers = iconMarkers(captures, scale, trackWidth);
  const playheadX = Math.max(0, Math.min(trackWidth - 3, scale.fraction(playhead) * trackWidth));
  const chevron = (name: string, disabled: boolean) => (
    <span style={{opacity: disabled ? 0.35 : 1, display: 'inline-flex'}}>
      <Symbol name={name} size={12} weight="regular" color={label.primary} />
    </span>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <div style={{...type.caption, color: label.primary, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'}}>
        <span style={{fontVariantNumeric: 'tabular-nums'}}>{formatTimeStandard(playhead)}</span>
        {selected && Math.abs(selected.time - playhead) > 120 ? (
          <span style={{color: label.secondary}}>Gap · showing nearest capture at {formatTimeStandard(selected.time)}</span>
        ) : null}
        {scale.compressesGaps ? <span style={{color: label.secondary}}>Gaps compressed</span> : null}
        <span style={{flex: 1}} />
        {chevron('chevron.left', index === 0)}
        <span style={{fontVariantNumeric: 'tabular-nums', color: label.secondary}}>
          {index + 1} / {captures.length}
        </span>
        {chevron('chevron.right', index === captures.length - 1)}
      </div>
      <div style={{position: 'relative', width: trackWidth, height: trackHeight}}>
        {/* Swift: Capsule .primary @ 7%, offset y 14; Canvas segments .primary @ 25%. Measured from reference (dark):
            the 4pt track sits 11pt below the scrubber top and reads #575757 where segments cover it,
            white @ 6% under white @ 17% (#575757 = 87). Light: VERIFY. */}
        <div style={{position: 'absolute', left: 0, right: 0, top: TRACK_TOP, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.06)' : primary(0.07)}} />
        {segments.map((s, i) => (
          <div key={i} style={{position: 'absolute', left: s.x, top: TRACK_TOP, width: s.width, height: 4, borderRadius: Math.min(3, s.width / 2, 2), background: isDark ? 'rgba(255,255,255,0.17)' : primary(0.25)}} />
        ))}
        {markers.map((m) => (
          <div key={m.capture.id} style={{position: 'absolute', left: m.x - 14, top: 0, padding: 3, borderRadius: 7, background: colors.backgroundRaised, display: 'flex'}}>
            <AppIcon app={m.capture.app} size={22} />
          </div>
        ))}
        {/* Color.accentColor is the system accent, not MuesliTheme.accent: measured #3478F6 in the dark
            reference (where the Muesli accent was a custom #3662E3). Light / other system accents: VERIFY. */}
        <div style={{position: 'absolute', left: playheadX, top: 0, width: 3, height: trackHeight, borderRadius: 2, background: SYSTEM_ACCENT}} />
      </div>
      <div style={{...font(10, 'regular', {mono: true}), color: label.secondary, display: 'flex', justifyContent: 'space-between'}}>
        {[0, 1, 2, 3, 4].map((tick) => {
          const t = scale.time(tick / 4) ?? intervalStart;
          return <span key={tick}>{intervalDuration < 300 ? formatTimeStandard(t) : formatTimeShort(t)}</span>;
        })}
      </div>
    </div>
  );
};

export interface MemoryExplorerProps {
  mode?: 'inline' | 'focus';
  /** The day's captures, oldest first. Empty → "No captures on this day". */
  captures: TimeTurnerCapture[];
  /** Playhead (seconds since midnight). Defaults to the selected capture's time, else the last capture. */
  playhead?: number;
  /** Exact selection (search hit / arrow keys). Otherwise the capture nearest the playhead is shown. */
  selectedCaptureId?: string;
  /** Explorer width in pt; inline it is the page's content width. Used for the scrubber geometry. */
  width: number;
  /** Focus mode only: window height (TimeTurnerFocusPresenter: min(900, visible − 48)). */
  height?: number;
  /** "6 Nov 2026" — for the info bar date and search results. */
  dayLabel: string;
  /** Focus mode DatePicker text (stepper field). VERIFY format. */
  datePickerText?: string;
  /** Search popover anchored to the magnifying-glass button; omit when closed. */
  search?: TimeTurnerSearchProps;
  searchButtonState?: NativeState;
  /** Focus mode: the "Captured text" column. */
  showsText?: boolean;
  /** Screenshot expired (retention) — shows the OCR text instead. */
  expired?: boolean;
}

export const MemoryExplorer: React.FC<MemoryExplorerProps> = ({
  mode = 'inline',
  captures,
  playhead: playheadProp,
  selectedCaptureId,
  width,
  height,
  dayLabel,
  datePickerText = '11/6/2026',
  search,
  searchButtonState = 'rest',
  showsText = false,
  expired = false,
}) => {
  const {colors} = useMuesliTheme();
  const label = useLabelColors(true);
  const inline = mode === 'inline';
  const glass = useGlass(inline ? 18 : 24, !inline);
  const controlSurface = useGlass(14, true);
  const exact = selectedCaptureId ? captures.findIndex((c) => c.id === selectedCaptureId) : -1;
  const fallbackPlayhead = captures.length ? captures[captures.length - 1].time : 0;
  const playhead = playheadProp ?? (exact >= 0 ? captures[exact].time : fallbackPlayhead);
  const index = exact >= 0 ? exact : (nearestIndex(captures, playhead) ?? 0);
  const selected = captures[index];
  const empty = captures.length === 0;
  const outerHeight = inline ? (empty ? undefined : 520) : (height ?? 760);
  const trackWidth = width - 40;

  const source = selected ? captureSource(selected).replace(/^[ ·]+|[ ·]+$/g, '') : '';

  const header = (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', ...envFont, color: label.primary, position: 'relative'}}>
      {!inline ? (
        <>
          <Symbol name="clock.arrow.circlepath" size={14} weight="regular" color={colors.accent} />
          <span style={{...font(16, 'semibold'), color: label.primary}}>Time Turner</span>
        </>
      ) : selected ? (
        <>
          <AppIcon app={selected.app} size={20} />
          <span style={{...type.caption, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1}}>{source}</span>
        </>
      ) : null}
      <span style={{flex: 1}} />
      {!inline ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: 6, ...controlSurface}}>
          <GlassButton><NativeSymbol name="chevron.left" size={CONTROL_SYMBOL_SIZE} color={label.primary} /></GlassButton>
          {/* DatePicker(displayedComponents: .date) default stepper field. VERIFY */}
          <div style={{...envFont, color: label.primary, display: 'flex', alignItems: 'center', gap: 4, padding: '0 6px', height: 24, borderRadius: 6, background: 'rgba(127,127,127,0.12)', fontVariantNumeric: 'tabular-nums'}}>
            {datePickerText}
            <span style={{display: 'flex', flexDirection: 'column', gap: 1, marginLeft: 2}}>
              <Symbol name="chevron.up" size={7} weight="regular" color={label.secondary} />
              <Symbol name="chevron.down" size={7} weight="regular" color={label.secondary} />
            </span>
          </div>
          <GlassButton state="disabled"><NativeSymbol name="chevron.right" size={CONTROL_SYMBOL_SIZE} color={label.primary} /></GlassButton>
        </div>
      ) : null}
      <span style={{flex: 1}} />
      <div style={{position: 'relative', display: 'flex'}}>
        {inline ? (
          <NativeButton onGlass state={searchButtonState}>
            <NativeSymbol name="magnifyingglass" size={CONTROL_SYMBOL_SIZE} color={label.primary} />
          </NativeButton>
        ) : (
          <GlassButton state={searchButtonState}>
            <NativeSymbol name="magnifyingglass" size={CONTROL_SYMBOL_SIZE} color={label.primary} />
          </GlassButton>
        )}
        {search ? (
          <div style={{position: 'absolute', top: '100%', right: -150, marginTop: 10, zIndex: 20}}>
            <TimeTurnerSearchPopover {...search} arrowX={580 - 150 - 14} />
          </div>
        ) : null}
      </div>
      {/* Label("On this Mac", systemImage: "lock"): icon→title gap measured 10.5pt between glyph boxes → 7.5pt CSS gap */}
      <span style={{...type.caption, color: label.secondary, display: 'flex', alignItems: 'center', gap: 7.5, whiteSpace: 'nowrap'}}>
        <Symbol name="lock" size={12} weight="regular" color={label.secondary} />
        On this Mac
      </span>
      {inline ? (
        <span style={{width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: selected ? 1 : 0.35}}>
          <NativeSymbol name="arrow.up.left.and.arrow.down.right" color={label.primary} />
        </span>
      ) : (
        <GlassButton size={30}>
          <NativeSymbol name="xmark" size={CONTROL_SYMBOL_SIZE} color={label.primary} />
        </GlassButton>
      )}
    </div>
  );

  return (
    <div
      style={{
        ...glass,
        width,
        height: outerHeight,
        minHeight: inline && empty ? 220 : undefined,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flex: 'none',
      }}
    >
      {header}
      {selected ? (
        <>
          <div style={{flex: 1, minHeight: 0, display: 'flex', alignItems: 'stretch', padding: '0 20px'}}>
            <div style={{flex: 1, minWidth: 0, position: 'relative', borderRadius: 14, background: 'rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <div style={{position: 'absolute', inset: 12}}>
                {expired ? (
                  <div style={{...envFont, color: label.primary, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, height: '100%', boxSizing: 'border-box'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                      <Symbol name="text.page" size={14} weight="regular" color={label.primary} />
                      Screenshot expired
                    </span>
                    <span style={{display: '-webkit-box', WebkitLineClamp: 12, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                      {selected.text || 'App history is still available.'}
                    </span>
                  </div>
                ) : (
                  <CaptureImage capture={selected} />
                )}
              </div>
              {!inline ? <InfoBar capture={selected} dayLabel={dayLabel} /> : null}
            </div>
            {showsText && !inline ? (
              <div style={{width: 260, flex: 'none', padding: 18, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12, ...envFont, color: label.primary}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{...type.headline}}>Captured text</span>
                  <span style={{flex: 1}} />
                  <NativeSymbol name="xmark" color={label.primary} />
                </div>
                <div style={{flex: 1, minHeight: 0, overflow: 'hidden', whiteSpace: 'pre-wrap'}}>{selected.text || 'No readable text in this moment.'}</div>
                {selected.text ? (
                  <div>
                    <NativeButton>Copy text</NativeButton>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div style={{padding: '12px 20px'}}>
            <TimeTurnerScrubber captures={captures} playhead={playhead} index={index} trackWidth={trackWidth} />
          </div>
        </>
      ) : (
        <TimeTurnerEmptyState title="No captures on this day" symbol="calendar" detail="Choose another day to browse your screen history." />
      )}
    </div>
  );
};

/** TimeTurnerControlSurface: `.glassEffect(.regular.interactive(), in: RoundedRectangle(cornerRadius: 14))`. */
function useGlassSurface(): React.CSSProperties {
  return useGlass(14, true);
}

/** Focus mode info bar over the screenshot. */
const InfoBar: React.FC<{capture: TimeTurnerCapture; dayLabel: string}> = ({capture, dayLabel}) => {
  const label = useLabelColors(true);
  const {isDark} = useMuesliTheme();
  // Glass over the screenshot: the system tints it for legibility; approximated with a denser fill. VERIFY.
  const surface = {...useGlassSurface(), background: isDark ? 'rgba(36,38,42,0.86)' : 'rgba(248,248,250,0.88)'};
  return (
    <div style={{padding: 18, position: 'relative'}}>
      <div style={{...surface, ...envFont, color: label.primary, display: 'flex', alignItems: 'center', gap: 12, padding: 12}}>
        <Symbol name="macwindow" size={14} weight="regular" color={label.primary} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0}}>
          <span style={{...font(12, 'medium'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {captureSource(capture).replace(/^[ ·]+|[ ·]+$/g, '')}
          </span>
          <span style={{...font(11, 'regular', {mono: true}), color: label.secondary}}>{formatDateTimeStandard(dayLabel, capture.time)}</span>
        </div>
        <span style={{flex: 1, minWidth: 8}} />
        <GlassButton size={28}>
          <NativeSymbol name="text.viewfinder" size={CONTROL_SYMBOL_SIZE} color={label.primary} />
        </GlassButton>
        <BorderlessMenu symbol="ellipsis" color={label.primary} />
      </div>
    </div>
  );
};
