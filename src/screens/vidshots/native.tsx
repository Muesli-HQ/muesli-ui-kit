// Approximations of the native AppKit/SwiftUI controls the Vidshot views use without a Muesli
// style: bordered push Button, ProgressView (small spinner), segmented Picker, DisclosureGroup,
// ContentUnavailableView, AVPlayerView (.inline controls), and SwiftUI system colours
// (.secondary / .red / .orange). None of these are determined by Muesli's Swift source.
// ContentUnavailableView and the system label colours are measured from the dark reference
// (references/muesli-dev-2026-11-09/dark/04-vidshots.png). Everything else here (push button,
// spinner, segmented picker, disclosure, AVPlayerView bar) is still VERIFY: no reference shows it.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {Symbol} from '../../icons/Icon';
import {font} from '../../typography';
import {systemFontStack} from '../../fonts';

/** SwiftUI system colours (NSColor dynamic values, macOS). VERIFY exact alpha on macOS 26. */
export function useSystemColors() {
  const {isDark} = useMuesliTheme();
  return {
    /** `.foregroundStyle(.secondary)` = secondaryLabelColor. Measured from reference (dark): white @ 55%
     *  (rgb 150 on #161719). Light value VERIFY. */
    secondary: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
    /** `.red` / systemRed */
    red: isDark ? '#FF453A' : '#FF3B30',
    /** `.orange` / systemOrange */
    orange: isDark ? '#FF9F0A' : '#FF9500',
    /** quaternaryLabelColor — measured from reference: white @ 25% (rgb 80 on #161719). */
    quaternary: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
    /** primary labelColor */
    label: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
  };
}

/**
 * Default bordered macOS push button (`Button(...)` with no style). The Vidshot detail view
 * sets `.font(MuesliTheme.font(size: 14))`, which the label inherits. VERIFY shape/fill on macOS 26.
 */
export const NativeButton: React.FC<{
  children: React.ReactNode;
  color?: string;
  disabled?: boolean;
  pressed?: boolean;
  style?: React.CSSProperties;
}> = ({children, color, disabled, pressed, style}) => {
  const {isDark, colors} = useMuesliTheme();
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        flex: 'none',
        whiteSpace: 'nowrap',
        ...font(14),
        color: color ?? colors.textPrimary,
        opacity: disabled ? 0.4 : 1,
        background: isDark
          ? `rgba(255,255,255,${pressed ? 0.2 : 0.11})`
          : pressed ? 'rgba(0,0,0,0.08)' : '#FFFFFF',
        boxShadow: isDark
          ? 'inset 0 0.5px 0 rgba(255,255,255,0.12), 0 0.5px 1px rgba(0,0,0,0.3)'
          : '0 0 0 0.5px rgba(0,0,0,0.12), 0 0.5px 1.5px rgba(0,0,0,0.12)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** SwiftUI `Label(title, systemImage:)` inside a button. Icon scales with the label font. */
export const NativeLabel: React.FC<{symbol: string; size?: number; color: string; children: React.ReactNode}> = ({symbol, size = 14, color, children}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 5}}>
    <Symbol name={symbol} size={size} weight="regular" color={color} />
    <span>{children}</span>
  </span>
);

/**
 * `ProgressView().controlSize(.small)`: indeterminate spinner, 16pt. `phase` (0..1) rotates it,
 * so a video can animate. VERIFY spoke count/colour (AppKit uses the panel's appearance).
 */
export const NativeSpinner: React.FC<{size?: number; phase?: number; color?: string}> = ({size = 16, phase = 0, color}) => {
  const {isDark} = useMuesliTheme();
  const c = color ?? (isDark ? '#FFFFFF' : '#000000');
  const spokes = 12;
  const head = Math.floor(((phase % 1) + 1) % 1 * spokes);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{flex: 'none', display: 'block'}} aria-hidden>
      {Array.from({length: spokes}, (_, i) => {
        const age = (head - i + spokes) % spokes;
        const opacity = 0.9 - (age / spokes) * 0.75;
        return (
          <line
            key={i}
            x1={8}
            y1={2}
            x2={8}
            y2={5.2}
            stroke={c}
            strokeOpacity={opacity}
            strokeWidth={1.6}
            strokeLinecap="round"
            transform={`rotate(${(i * 360) / spokes} 8 8)`}
          />
        );
      })}
    </svg>
  );
};

/** `Picker(...).pickerStyle(.segmented)`. VERIFY macOS 26 segmented control look. */
export const NativeSegmented: React.FC<{options: string[]; selected: number; width?: number}> = ({options, selected, width = 180}) => {
  const {isDark, colors} = useMuesliTheme();
  return (
    <div
      style={{
        width,
        height: 24,
        flex: 'none',
        display: 'flex',
        padding: 2,
        boxSizing: 'border-box',
        borderRadius: 9999,
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      }}
    >
      {options.map((o, i) => (
        <div
          key={o}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9999,
            ...font(13, i === selected ? 'medium' : 'regular'),
            color: colors.textPrimary,
            background: i === selected ? (isDark ? 'rgba(255,255,255,0.2)' : '#FFFFFF') : 'transparent',
            boxShadow: i === selected && !isDark ? '0 0.5px 1.5px rgba(0,0,0,0.18)' : undefined,
          }}
        >
          {o}
        </div>
      ))}
    </div>
  );
};

/** `DisclosureGroup(title)` header: a chevron that rotates 90° when expanded. VERIFY glyph size. */
export const NativeDisclosure: React.FC<{title: string; expanded: boolean; children?: React.ReactNode}> = ({title, expanded, children}) => {
  const {colors} = useMuesliTheme();
  const sys = useSystemColors();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'stretch'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 6, ...font(14), color: colors.textPrimary}}>
        <span style={{width: 12, display: 'inline-flex', justifyContent: 'center', transform: expanded ? 'rotate(90deg)' : undefined}}>
          <Symbol name="chevron.right" size={10} weight="semibold" color={sys.secondary} />
        </span>
        {title}
      </div>
      {expanded ? <div style={{paddingLeft: 18}}>{children}</div> : null}
    </div>
  );
};

/**
 * `ContentUnavailableView { Label { Text } icon: {...} } description: {...}`.
 * Measured from reference (04-vidshots.png, dark): title SF Pro 26pt bold in secondary label colour
 * (rgb 150 on #161719), description SF Pro 13pt secondary, icon quaternary (white @ 25%, rgb 80).
 * Vertical gaps tuned to the reference glyph positions. Light-mode colours VERIFY (no light reference).
 */
export const NativeContentUnavailable: React.FC<{icon: React.ReactNode; title: string; description: string}> = ({icon, title, description}) => {
  const sys = useSystemColors();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
      <div style={{color: sys.quaternary, display: 'flex'}}>{icon}</div>
      <div style={{fontFamily: systemFontStack, fontSize: 26, lineHeight: '31px', fontWeight: 700, color: sys.secondary, marginTop: CU_ICON_TITLE_GAP}}>{title}</div>
      <div style={{fontFamily: systemFontStack, fontSize: 13, lineHeight: '16px', color: sys.secondary, marginTop: CU_TITLE_DESC_GAP}}>{description}</div>
    </div>
  );
};
const CU_ICON_TITLE_GAP = 22;
const CU_TITLE_DESC_GAP = 12;

/**
 * MeetingVideoPlayerView = AVPlayerView(controlsStyle: .inline, videoGravity: .resizeAspect).
 * Black letterbox with the poster frame; the inline control bar appears on hover.
 * VERIFY the AVKit inline control bar on macOS 26.
 */
export const NativeVideoPlayer: React.FC<{
  posterSrc?: string;
  poster?: React.ReactNode;
  height: number;
  maxWidth?: number;
  radius?: number;
  controlsVisible?: boolean;
  /** 0..1 playhead */
  progress?: number;
  elapsed?: string;
  remaining?: string;
}> = ({posterSrc, poster, height, maxWidth, radius = 0, controlsVisible = false, progress = 0, elapsed = '0:00', remaining = '-0:00'}) => (
  <div style={{position: 'relative', height, width: '100%', maxWidth, background: '#000', borderRadius: radius, overflow: 'hidden', flex: 'none'}}>
    {poster ?? (posterSrc ? <img src={posterSrc} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block'}} /> : null)}
    {controlsVisible ? (
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 10,
          height: 30,
          borderRadius: 9999,
          background: 'rgba(40,40,40,0.72)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 12px',
          color: '#fff',
          fontFamily: systemFontStack,
          fontSize: 11,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <Symbol name="play.fill" size={13} weight="regular" color="#fff" />
        <span>{elapsed}</span>
        <div style={{flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)', position: 'relative'}}>
          <div style={{position: 'absolute', inset: 0, width: `${Math.max(0, Math.min(1, progress)) * 100}%`, borderRadius: 2, background: '#fff'}} />
        </div>
        <span>{remaining}</span>
        <Symbol name="speaker.wave.2.fill" size={12} weight="regular" color="#fff" />
        <Symbol name="arrow.up.left.and.arrow.down.right" size={11} weight="regular" color="#fff" />
      </div>
    ) : null}
  </div>
);
