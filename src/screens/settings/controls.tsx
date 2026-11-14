// macOS 26 native-control lookalikes used by SettingsView.swift / ModelsView.swift / the indicators @ v0.8.6.
// None of these are defined in the app source: they are AppKit/SwiftUI system controls
// (Toggle .switch, NSPopUpButton via FixedWidthPopUp, Slider, Picker .segmented, ProgressView,
// Button default style, TextField .roundedBorder, Stepper). Switch, pop-up and segmented picker are measured
// from the v0.8.6 dark reference captures; the rest remain best guesses marked VERIFY.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';

/** System controls draw in SF Pro, not Nunito Sans (AppKit's own font). VERIFY: headless Chrome on macOS resolves system-ui to SF Pro. */
export const systemFont = (size: number, weight: number = 400): React.CSSProperties => ({
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
  fontSize: size,
  fontWeight: weight,
  lineHeight: 'normal',
  letterSpacing: 0,
});

/**
 * Toggle(.switch).tint(MuesliTheme.toggleAccent) — MuesliSettingControl.swift.
 * Measured from reference (dark, 10-settings.png @2×): track 54×22pt, capsule, #3F4144 (white ≈0.14 over
 * backgroundRaised); knob 32×20pt capsule #E2E3E3, inset 1pt top / 2pt sides, soft shadow.
 * The reference window was not key, so its "on" switches drew the grey track; `inactiveWindow` reproduces that.
 * VERIFY: the accent "on" track in a key window, and the light-appearance track.
 */
export const MacSwitch: React.FC<{on: boolean; disabled?: boolean; pressed?: boolean; inactiveWindow?: boolean}> = ({on, disabled = false, pressed = false, inactiveWindow = false}) => {
  const t = useMuesliTheme();
  const W = 54;
  const H = 22;
  const knobW = pressed ? 36 : 32;
  const offTrack = t.isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)';
  const track = on && !inactiveWindow ? t.colors.toggleAccent : offTrack;
  return (
    <div style={{width: W, height: H, borderRadius: H / 2, background: track, position: 'relative', flex: 'none', opacity: disabled ? 0.45 : 1}}>
      <div
        style={{
          position: 'absolute',
          top: 1,
          left: on ? W - knobW - 2 : 2,
          width: knobW,
          height: 20,
          borderRadius: 10,
          background: t.isDark ? '#E2E3E3' : '#FFFFFF',
          boxShadow: '0 0.5px 1.5px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.12)',
        }}
      />
    </div>
  );
};

/** NSPopUpButton's up/down indicator. Measured from reference: 7×10pt, same colour as the title. */
const PopUpChevrons: React.FC<{color: string}> = ({color}) => (
  <svg width={7} height={10} viewBox="0 0 7 10" style={{flex: 'none', display: 'block'}} aria-hidden>
    <path d="M0.9 3.6 L3.5 1 L6.1 3.6 M0.9 6.4 L3.5 9 L6.1 6.4" fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * NSPopUpButton (FixedWidthPopUp in SettingsView.swift; fills its column) and Picker(.menu) (`hug`: sizes to its title).
 * Measured from reference (dark, 08-models.png @2×): 24pt tall, flat fill white ≈0.072 over backgroundRaised
 * (#303236 on #202226), no border, radius 6pt; title SF 13pt regular, white 0.85 (#E0E0E0); left padding 12pt,
 * chevrons 7×10pt with 10pt right padding; a hugging picker leaves 18pt between title and chevrons.
 * VERIFY: light appearance.
 */
export const MacPopUp: React.FC<{value: string; width?: number | string; hug?: boolean; disabled?: boolean; height?: number; style?: React.CSSProperties}> = ({
  value,
  width = '100%',
  hug = false,
  disabled = false,
  height = 24,
  style,
}) => {
  const t = useMuesliTheme();
  const fg = t.isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
  return (
    <div
      style={{
        width: hug ? 'auto' : width,
        height,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: hug ? 18 : 6,
        padding: '0 10px 0 12px',
        borderRadius: 6,
        background: t.isDark ? 'rgba(255,255,255,0.072)' : 'rgba(0,0,0,0.05)',
        color: fg,
        opacity: disabled ? 0.45 : 1,
        flex: 'none',
        minWidth: 0,
        ...style,
      }}
    >
      <span style={{...systemFont(13), position: 'relative', top: -1, flex: hug ? 'none' : 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{value}</span>
      <PopUpChevrons color={fg} />
    </div>
  );
};

/**
 * Picker(.segmented). Measured from reference (dark, 10-settings / 08-models @2×): 24pt tall, radius 6pt,
 * track #28292B (white 0.077 over backgroundBase); equal-width segments sized to the widest title + 10.75pt
 * each side (Settings: 5 × 99.8pt); selected segment fills the full height in #434446 (white 0.126 over the track); 0.5pt separators
 * (#38393B, 14pt tall) only between two unselected segments; titles SF 13pt regular, white 0.85.
 * VERIFY: light appearance.
 */
export const MacSegmented: React.FC<{options: string[]; selected: number; style?: React.CSSProperties}> = ({options, selected, style}) => {
  const t = useMuesliTheme();
  const sep = t.isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.12)';
  return (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        height: 24,
        borderRadius: 6,
        background: t.isDark ? 'rgba(255,255,255,0.077)' : 'rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {options.map((o, i) => {
        const on = i === selected;
        const showSep = i > 0 && i !== selected && i - 1 !== selected;
        return (
          <div
            key={o}
            style={{
              ...systemFont(13),
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 10.75px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              color: t.isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
              background: on ? (t.isDark ? 'rgba(255,255,255,0.126)' : '#FFFFFF') : 'transparent',
              boxShadow: on && !t.isDark ? '0 0.5px 1.5px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            {showSep ? <span style={{position: 'absolute', left: -0.25, top: 5, width: 0.5, height: 14, background: sep}} /> : null}
            {o}
          </div>
        );
      })}
    </div>
  );
};

/** Slider(step: 1).tint(MuesliTheme.accent) (discreteSlider presentation). VERIFY macOS 26 knob. */
export const MacSlider: React.FC<{steps: number; index: number; width?: number | string}> = ({steps, index, width = '100%'}) => {
  const t = useMuesliTheme();
  const f = steps > 1 ? index / (steps - 1) : 0;
  const knobW = 22;
  return (
    <div style={{position: 'relative', width, height: 24, flex: 1, minWidth: 0}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 10, height: 4, borderRadius: 2, background: t.isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'}} />
      <div style={{position: 'absolute', left: 0, width: `calc(${f} * (100% - ${knobW}px) + ${knobW / 2}px)`, top: 10, height: 4, borderRadius: 2, background: t.colors.accent}} />
      <div
        style={{
          position: 'absolute',
          left: `calc(${f} * (100% - ${knobW}px))`,
          top: 5,
          width: knobW,
          height: 14,
          borderRadius: 7,
          background: '#FFFFFF',
          boxShadow: '0 0.5px 1px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
};

/** Button with the default (bordered push) style, e.g. Button("Set up…"). VERIFY macOS 26 bezel. */
export const MacPushButton: React.FC<{children: React.ReactNode; prominent?: boolean; tint?: string; small?: boolean; labelStyle?: React.CSSProperties}> = ({
  children,
  prominent = false,
  tint,
  small = false,
  labelStyle,
}) => {
  const t = useMuesliTheme();
  return (
    <div
      style={{
        ...systemFont(small ? 11 : 13),
        ...labelStyle,
        height: small ? 20 : 24,
        display: 'inline-flex',
        alignItems: 'center',
        padding: small ? '0 9px' : '0 12px',
        borderRadius: small ? 10 : 12,
        whiteSpace: 'nowrap',
        flex: 'none',
        color: prominent ? '#FFFFFF' : t.isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)',
        background: prominent ? (tint ?? t.colors.toggleAccent) : t.isDark ? 'rgba(255,255,255,0.12)' : '#FFFFFF',
        boxShadow: prominent ? 'none' : t.isDark ? 'inset 0 0.5px 0 rgba(255,255,255,0.10), 0 0.5px 1px rgba(0,0,0,0.3)' : '0 0 0 0.5px rgba(0,0,0,0.12), 0 0.5px 1.5px rgba(0,0,0,0.12)',
      }}
    >
      {children}
    </div>
  );
};

/** ProgressView() circular indeterminate. `phase` 0…1 rotates the highlighted spoke (one turn ≈ 1 s). VERIFY spoke count/tint on macOS 26. */
export const MacSpinner: React.FC<{size?: number; color?: string; phase?: number}> = ({size = 16, color, phase = 0}) => {
  const t = useMuesliTheme();
  const c = color ?? (t.isDark ? '#FFFFFF' : '#000000');
  const n = 12;
  const head = Math.floor(((phase % 1) + 1) % 1 * n);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{flex: 'none', display: 'block'}} aria-hidden>
      {Array.from({length: n}, (_, i) => {
        const age = (head - i + n) % n;
        const opacity = age === 0 ? 0.9 : Math.max(0.18, 0.9 - age * 0.08);
        return <rect key={i} x={14.5} y={2} width={3} height={8.5} rx={1.5} fill={c} opacity={opacity} transform={`rotate(${i * 30} 16 16)`} />;
      })}
    </svg>
  );
};

/** ProgressView(value:).tint(MuesliTheme.accent) (linear). VERIFY macOS 26 thickness. */
export const MacProgressBar: React.FC<{value: number; style?: React.CSSProperties}> = ({value, style}) => {
  const t = useMuesliTheme();
  return (
    <div style={{height: 6, borderRadius: 3, background: t.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%', ...style}}>
      <div style={{width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', borderRadius: 3, background: t.colors.accent}} />
    </div>
  );
};

/** TextField(.roundedBorder) + Stepper, as SettingsView.integerInput lays them out. VERIFY. */
export const MacNumberField: React.FC<{value: string; width?: number}> = ({value, width = 72}) => {
  const t = useMuesliTheme();
  return (
    <div
      style={{
        ...systemFont(13),
        width,
        height: 22,
        boxSizing: 'border-box',
        padding: '0 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontVariantNumeric: 'tabular-nums',
        borderRadius: 6,
        color: t.isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)',
        background: t.isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
        boxShadow: t.isDark ? 'inset 0 0 0 0.5px rgba(255,255,255,0.18)' : 'inset 0 0 0 0.5px rgba(0,0,0,0.2)',
      }}
    >
      {value}
    </div>
  );
};

export const MacStepper: React.FC = () => {
  const t = useMuesliTheme();
  const c = t.isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)';
  return (
    <div
      style={{
        width: 15,
        height: 22,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        background: t.isDark ? 'rgba(255,255,255,0.10)' : '#FFFFFF',
        boxShadow: t.isDark ? 'inset 0 0.5px 0 rgba(255,255,255,0.10), 0 0.5px 1px rgba(0,0,0,0.3)' : '0 0 0 0.5px rgba(0,0,0,0.14), 0 0.5px 1.5px rgba(0,0,0,0.12)',
        flex: 'none',
      }}
    >
      <svg width={7} height={4} viewBox="0 0 7 4"><path d="M0.5 3.5 L3.5 0.5 L6.5 3.5" fill="none" stroke={c} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
      <svg width={7} height={4} viewBox="0 0 7 4"><path d="M0.5 0.5 L3.5 3.5 L6.5 0.5" fill="none" stroke={c} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
};

/** SwiftUI Divider() with .background(MuesliTheme.surfaceBorder). VERIFY separator colour. */
export const SettingsDivider: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const t = useMuesliTheme();
  const sep = t.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  return <div style={{height: 1, flex: 'none', background: `linear-gradient(${sep}, ${sep}), ${t.colors.surfaceBorder}`, ...style}} />;
};

/** NSColor.labelColor / secondaryLabelColor, for Text with no explicit MuesliTheme colour (Color.primary / .secondary). */
export const systemLabel = (isDark: boolean) => (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)');
export const systemSecondaryLabel = (isDark: boolean) => (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)');
