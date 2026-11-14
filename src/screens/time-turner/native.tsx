// Approximations of AppKit/SwiftUI system controls and materials used by the Time Turner views
// (TimeTurnerView.swift, TimeTurnerPage.swift, TimeTurnerRecapView.swift, TimeTurnerTodosView.swift @ v0.8.6).
// None of these are drawn by Muesli's own code. Values marked "measured" come from the 2026-11-09
// MuesliDev v0.8.6 dark reference (ui-kit/references/muesli-dev-2026-11-09/dark/02-time-turner.png);
// everything else is still VERIFY.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type} from '../../typography';
import {Symbol, type SymbolWeight} from '../../icons/Icon';

export type NativeState = 'rest' | 'hover' | 'pressed' | 'disabled';

/** The DashboardRootView sets `.font(MuesliTheme.body())`, so default-styled controls draw 14pt Nunito Sans. */
export const envFont = type.body;

/** `.primary` (label colour), not MuesliTheme.textPrimary. */
export const usePrimary = () => {
  const {isDark} = useMuesliTheme();
  return (a: number) => (isDark ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`);
};

/**
 * Default SwiftUI `Button` (`.automatic` = bordered push button), regular size.
 * Measured from reference (macOS 26, dark, 2× capture of TimeTurnerPage):
 *  - rounded rect, radius 6pt; no visible border or shadow in dark
 *  - padding ≈ 4pt vertical / 12pt horizontal around the label (chevron 33×21.5, gear 40×24,
 *    magnifier 39.5×22, "9 Nov 2026"+calendar in a 160pt frame → 184×27)
 *  - text labels keep the environment's 14pt Nunito here; whether the control font also overrides bare
 *    Text labels (as it does symbols) is not visible in the reference: VERIFY
 *  - a label with no font of its own (e.g. a bare `Image(systemName:)`) takes the 13pt system control
 *    font, not the environment's 14pt Nunito: glyph boxes match the reference at 13pt (CONTROL_SYMBOL_SIZE)
 *  - fill on the page (#161719): #28292B ≈ white @ 7.7%; on the explorer glass (#272728): #3E3E3F ≈ white @ 10.6%
 * Light appearance, small size, hover/pressed and prominent: VERIFY (not in the reference).
 *
 * Tinted (inside <ButtonTint>, i.e. under DashboardRootView's `.tint(MuesliTheme.accent)`): measured from the
 * owner's 2026-11-13 MuesliDev dark capture of the Time Turner page (Off state): label and glyphs draw in the tint
 * (#77A1F1 ≈ accent), fill = tint @ 5% (#1B1E24 on #161719; same on the explorer glass), disabled ≈ 30% opacity
 * (next-day chevron #34425D). Light: VERIFY.
 */
const ButtonTintContext = React.createContext<string | null>(null);
const ButtonFgContext = React.createContext<string | null>(null);

/** `.tint(color)` for the default-styled buttons below it (DashboardRootView sets `.tint(MuesliTheme.accent)`). */
export const ButtonTint: React.FC<{color?: string; children: React.ReactNode}> = ({color, children}) => {
  const {colors} = useMuesliTheme();
  return <ButtonTintContext.Provider value={color ?? colors.accent}>{children}</ButtonTintContext.Provider>;
};

const withAlpha = (hex: string, a: number) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const NativeButton: React.FC<{
  state?: NativeState;
  prominent?: boolean;
  size?: 'regular' | 'small';
  iconOnly?: boolean;
  /** Drawn on the Time Turner glass surface (measured lighter fill). */
  onGlass?: boolean;
  /** Ignore the tint (a default-style `Menu` keeps the grey fill; see MenuButton). */
  untinted?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({state = 'rest', prominent = false, size = 'regular', onGlass = false, untinted = false, style, children}) => {
  const {colors, isDark} = useMuesliTheme();
  const tint = React.useContext(ButtonTintContext);
  const tinted = !!tint && !prominent && !untinted;
  const shade = state === 'pressed' ? 0.1 : state === 'hover' ? 0.04 : 0;
  const darkAlpha = (onGlass ? 0.106 : 0.077) + shade;
  const bg = prominent
    ? colors.accent
    : tinted && isDark
      ? withAlpha(tint!, 0.05 + shade)
      : isDark
        ? `rgba(255,255,255,${darkAlpha})`
        : '#FFFFFF';
  const overlay = (prominent || !isDark) && shade > 0 ? `linear-gradient(rgba(0,0,0,${shade}), rgba(0,0,0,${shade})), ` : '';
  const fg = prominent ? colors.onAccent : tinted ? tint! : colors.textPrimary;
  return (
    <div
      style={{
        ...envFont,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        flex: 'none',
        padding: size === 'small' ? '2px 8px' : '4px 12px',
        borderRadius: 6,
        background: overlay + bg,
        color: fg,
        boxShadow: prominent || isDark ? 'none' : 'inset 0 0 0 0.5px rgba(0,0,0,0.1), 0 0.5px 1.5px rgba(0,0,0,0.12)',
        opacity: state === 'disabled' ? (tinted ? 0.3 : 0.45) : 1,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <ButtonFgContext.Provider value={tinted ? fg : null}>{children}</ButtonFgContext.Provider>
    </div>
  );
};

/** Symbol size inside default-styled buttons with no explicit font: regular control size 13pt (measured);
 *  `.controlSize(.small)` 11pt (VERIFY). */
export const CONTROL_SYMBOL_SIZE = 13;
export const SMALL_CONTROL_SYMBOL_SIZE = 11;

/** A symbol tinted with the control's current text colour. */
export const NativeSymbol: React.FC<{name: string; size?: number; weight?: SymbolWeight; color?: string; style?: React.CSSProperties}> = ({
  name,
  size = 14,
  weight = 'regular',
  color,
  style,
}) => {
  const {colors} = useMuesliTheme();
  // Inside a tinted button the glyph takes the tint (the kit's explicit label colours stand in for `.primary`).
  const tintFg = React.useContext(ButtonFgContext);
  return <Symbol name={name} size={size} weight={weight} color={tintFg ?? color ?? colors.textPrimary} style={style} />;
};

/** `Menu { } label: { Image(...) }` with `.menuStyle(.borderlessButton)`: glyph plus a small disclosure chevron.
 *  Glyph and chevron draw in the accent, even in an inactive window (owner's 2026-11-13 Recap capture: "…⌄" #3661E4). */
export const BorderlessMenu: React.FC<{symbol: string; color?: string; state?: NativeState}> = ({symbol, color, state = 'rest'}) => {
  const {colors} = useMuesliTheme();
  const c = color ?? colors.accent;
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 3, opacity: state === 'disabled' ? 0.45 : 1, flex: 'none'}}>
      <span style={{width: 20, display: 'inline-flex', justifyContent: 'center'}}>
        <Symbol name={symbol} size={14} weight="regular" color={c} />
      </span>
      <Symbol name="chevron.down" size={8} weight="semibold" color={color ? colors.textSecondary : c} />
    </div>
  );
};

/** `Menu` with the default (bordered pop-up) style and an icon label. Owner's 2026-11-13 To-dos capture: grey fill
 *  (#303236 on the #202226 card, the untinted button fill) with the glyph in the accent and a label-colour chevron. */
export const MenuButton: React.FC<{symbol: string; state?: NativeState}> = ({symbol, state}) => {
  const {colors} = useMuesliTheme();
  return (
    <NativeButton untinted state={state} style={{gap: 5, padding: '0 8px'}}>
      <NativeSymbol name={symbol} size={CONTROL_SYMBOL_SIZE} color={colors.accent} />
      <NativeSymbol name="chevron.down" size={8} weight="semibold" />
    </NativeButton>
  );
};

/** `Picker` (pop-up button) with a leading label. VERIFY. */
export const PopUpPicker: React.FC<{label?: string; value: string; width?: number}> = ({label, value, width}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, ...envFont, color: colors.textPrimary, maxWidth: width, minWidth: 0}}>
      {label ? <span style={{flex: 'none'}}>{label}</span> : null}
      <NativeButton style={{flex: 1, justifyContent: 'space-between', gap: 8, padding: '0 6px 0 10px', minWidth: 0}}>
        <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{value}</span>
        <NativeSymbol name="chevron.up.chevron.down" size={10} />
      </NativeButton>
    </div>
  );
};

/** `Toggle(...).toggleStyle(.checkbox)`. VERIFY. */
export const Checkbox: React.FC<{label: string; checked: boolean}> = ({label, checked}) => {
  const {colors, isDark} = useMuesliTheme();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 6, ...envFont, color: colors.textPrimary, flex: 'none'}}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: checked ? colors.toggleAccent : isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
          boxShadow: checked ? 'none' : isDark ? 'inset 0 0 0 0.5px rgba(255,255,255,0.2)' : 'inset 0 0 0 0.5px rgba(0,0,0,0.25)',
        }}
      >
        {checked ? <Symbol name="checkmark" size={9} weight="regular" color="#FFFFFF" /> : null}
      </span>
      {label}
    </div>
  );
};

/** `TextField(...).textFieldStyle(.roundedBorder)`; `text` is the typed-so-far string. VERIFY. */
export const RoundedTextField: React.FC<{placeholder: string; text?: string; focused?: boolean; caret?: boolean}> = ({
  placeholder,
  text = '',
  focused = false,
  caret = false,
}) => {
  const {colors, isDark} = useMuesliTheme();
  return (
    <div
      style={{
        ...envFont,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        padding: '0 7px',
        borderRadius: 6,
        background: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
        boxShadow: focused
          ? `0 0 0 3px ${colors.accent.startsWith('#') ? colors.accent + '80' : colors.accent}, inset 0 0 0 0.5px ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
          : `inset 0 0 0 0.5px ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
        color: text ? colors.textPrimary : colors.textTertiary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {text || placeholder}
      {caret ? <span style={{width: 1, height: 16, background: colors.textPrimary, marginLeft: text ? 1 : 0, order: text ? 0 : -1}} /> : null}
    </div>
  );
};

/**
 * `Divider()` — 1pt system separator. Measured from reference (dark): Divider().overlay(surfaceBorder)
 * on backgroundBase reads #3C3D3F = separator (white @ 10%) under surfaceBorder (white @ 7%).
 * Light separator (black @ 10%): VERIFY. Pass `overlay` for the `.overlay(...)` form.
 */
export const NativeDivider: React.FC<{overlay?: string}> = ({overlay}) => {
  const {isDark} = useMuesliTheme();
  const separator = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  return (
    <div
      style={{
        height: 1,
        flex: 'none',
        alignSelf: 'stretch',
        background: overlay ? `linear-gradient(${overlay}, ${overlay}), ${separator}` : separator,
      }}
    />
  );
};

/** `ProgressView()` (indeterminate spinner). `phase` 0..1 rotates it for videos. VERIFY. */
export const Spinner: React.FC<{size?: number; phase?: number}> = ({size = 16, phase = 0}) => {
  const {isDark} = useMuesliTheme();
  const spokes = 8;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{flex: 'none', transform: `rotate(${Math.round(phase * spokes) * (360 / spokes)}deg)`}}>
      {Array.from({length: spokes}, (_, i) => {
        const a = (i * 2 * Math.PI) / spokes;
        return (
          <line
            key={i}
            x1={8 + Math.sin(a) * 3.6}
            y1={8 - Math.cos(a) * 3.6}
            x2={8 + Math.sin(a) * 6.6}
            y2={8 - Math.cos(a) * 6.6}
            stroke={isDark ? '#FFFFFF' : '#000000'}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.15 + (0.6 * ((spokes - i) % spokes)) / spokes}
          />
        );
      })}
    </svg>
  );
};

/** `ProgressView(value:total:)` linear bar. VERIFY. */
export const LinearProgress: React.FC<{value: number}> = ({value}) => {
  const {colors, isDark} = useMuesliTheme();
  return (
    <div style={{height: 6, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', overflow: 'hidden', alignSelf: 'stretch', flex: 'none'}}>
      <div style={{width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', borderRadius: 3, background: colors.toggleAccent}} />
    </div>
  );
};

/**
 * `.glassEffect(.regular, in: RoundedRectangle)` (macOS 26).
 * Inline on the dashboard page — measured from reference (dark): a flat #272728 fill
 * (≈ white @ 7% over backgroundBase), no visible rim, highlight or shadow.
 * Over arbitrary content (focus viewer) the glass refracts/blurs what is behind it; that variant is
 * approximated (translucent fill + backdrop blur). Light appearance: VERIFY.
 */
export const useGlass = (cornerRadius: number, overContent = false): React.CSSProperties => {
  const {isDark, appearance, colors} = useMuesliTheme();
  if (appearance === 'ultraDark') return {background: colors.backgroundRaised, borderRadius: cornerRadius};
  if (!overContent) {
    // Dark: owner's 2026-11-13 capture shows a near-clear fill (#18191B on #161719) with a 1pt rim
    // (#3D4045 / #2C3032 at 2×), superseding the flat #272728 measured on 2026-11-09.
    return {
      borderRadius: cornerRadius,
      background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.035)', // light: VERIFY
      boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.13)' : undefined,
    };
  }
  return {
    borderRadius: cornerRadius,
    background: isDark ? 'rgba(44,46,51,0.62)' : 'rgba(250,250,252,0.72)',
    boxShadow: isDark
      ? 'inset 0 0.5px 0 rgba(255,255,255,0.16), inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 4px 18px rgba(0,0,0,0.28)'
      : 'inset 0 0.5px 0 rgba(255,255,255,0.95), inset 0 0 0 0.5px rgba(0,0,0,0.07), 0 4px 18px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(20px) saturate(1.4)',
  };
};

/** NSPopover chrome with an arrow pointing up at `arrowX` (px from the left edge). VERIFY material + arrow size. */
export const PopoverSurface: React.FC<{width: number; height?: number; arrowX?: number; children: React.ReactNode}> = ({width, height, arrowX, children}) => {
  const {isDark, colors} = useMuesliTheme();
  const bg = isDark ? '#2A2C30' : '#F6F6F8';
  const border = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  return (
    <div style={{position: 'relative', width, height, flex: 'none'}}>
      {arrowX !== undefined ? (
        <svg width={28} height={11} viewBox="0 0 28 11" style={{position: 'absolute', top: -10, left: arrowX - 14, zIndex: 1}}>
          <path d="M0 11 C6 11 9 1 14 1 C19 1 22 11 28 11 Z" fill={bg} stroke={border} strokeWidth={0.5} />
          <rect x={0} y={10.4} width={28} height={1} fill={bg} />
        </svg>
      ) : null}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 12,
          background: bg,
          boxShadow: `inset 0 0 0 0.5px ${border}, 0 10px 30px rgba(0,0,0,${isDark ? 0.45 : 0.18})`,
          color: colors.textPrimary,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * System label colours (`.primary` / `.secondary` with no MuesliTheme override).
 * Measured from reference (dark): on the page, labelColor = white @ 85% (button text #DEDEDF on #28292B)
 * and secondaryLabel = white @ 55% ("Paused" #969697 on #161719). On the Time Turner glass the
 * vibrant labels read brighter: primary #F4F4F4 ≈ white @ 95%, secondary #A9A9A9 ≈ white @ 60%.
 * Light appearance: VERIFY.
 */
export const useLabelColors = (onGlass = false) => {
  const {isDark, appearance, colors} = useMuesliTheme();
  if (appearance === 'ultraDark') return {primary: colors.textPrimary, secondary: colors.textSecondary};
  if (isDark) {
    return onGlass
      ? {primary: 'rgba(255,255,255,0.95)', secondary: 'rgba(255,255,255,0.60)'}
      : {primary: 'rgba(255,255,255,0.85)', secondary: 'rgba(255,255,255,0.55)'};
  }
  return {primary: 'rgba(0,0,0,0.85)', secondary: 'rgba(0,0,0,0.5)'};
};
