// Shared row pieces for Timeline / Dictations rows (v0.8.6):
//  - RowShell: the padding / hover fill / inset divider every activity row repeats
//    (DictationRowView.swift, TimelineView.swift TimelineMeetingRow / TimelineCotypistRow / TimelineVidshotRow)
//  - TimeLabel: `.system(size: 13, weight: .medium, design: .monospaced)`, textTertiary, 80pt wide, top 2
//  - TimelineRowActionButton (DictationRowView.swift): quiet 28×28 button, 12pt symbol
//  - SyncOriginBadge (SyncOriginDisplay.swift) and the CUA / QUILL / COTYPIST pills
//  - TargetApplicationIconView (TargetApplicationIconView.swift)
//  - QuillGlyph (assets/quill-icon.svg via QuillIcon.swift) and Lucide AIIcon (AIElementsSwift/AIIcon.swift)
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {radius, spacing} from '../../tokens/theme';
import {font} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {glyphs} from '../../icons/generated';
import {Button, type ControlState} from '../../primitives/Button';
import type {RowActionId, RowInteraction, TargetApp} from './types';

/** Nunito Sans hhea ascent / descent per em (1011 / 353, line gap 0). */
export const NUNITO_ASCENT = 1.011;
export const NUNITO_DESCENT = 0.353;

/**
 * SwiftUI's line height for Nunito Sans. Measured from the reference capture: 15pt text has a 20pt
 * line pitch (single-line DictationRow = 52pt = 32 padding + 20), i.e. CoreText rounds ascent and
 * descent separately (15.17 → 15, 5.30 → 5) — not CSS `normal` (20.46).
 */
export const coreTextLine = (size: number) => Math.round(size * NUNITO_ASCENT) + Math.round(size * NUNITO_DESCENT);

/**
 * SwiftUI `.lineSpacing(n)` adds n between lines only. CSS line-height adds it around every line,
 * so we pad the line box and pull the half-spacing back off the top and bottom.
 */
export const lineSpaced = (size: number, extra: number): React.CSSProperties => ({
  lineHeight: `${coreTextLine(size) + extra}px`,
  // CoreText sits the first baseline 0.5pt lower than CSS half-leading does (measured: 15pt reading text).
  marginTop: -extra / 2 + 0.5,
  marginBottom: -extra / 2 - 0.5,
});

/** `.lineLimit(n)` */
export const clamp = (lines: number | undefined): React.CSSProperties =>
  lines === undefined
    ? {}
    : {display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden'};

/**
 * `.padding(.horizontal, 20).padding(.vertical, 16)
 *  .background(isHovered ? backgroundHover : .clear).clipShape(RoundedRectangle(cornerRadius: cornerSmall))
 *  .overlay(alignment: .bottom) { Rectangle().fill(surfaceBorder).frame(height: 1).padding(.horizontal, 20) }`
 */
export const RowShell: React.FC<{
  hovered?: boolean;
  /** Quill rows draw the divider edge to edge and never fill on hover. */
  dividerInset?: number;
  hoverFill?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({hovered, dividerInset = spacing[20], hoverFill = true, style, children}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        position: 'relative',
        padding: `${spacing[16]}px ${spacing[20]}px`,
        borderRadius: radius.small,
        background: hoverFill && hovered ? colors.backgroundHover : 'transparent',
        ...style,
      }}
    >
      {children}
      <div style={{position: 'absolute', left: dividerInset, right: dividerInset, bottom: 0, height: 1, background: colors.surfaceBorder}} />
    </div>
  );
};

/** The 80pt time column. Quill rows use `MuesliTheme.caption()` with no top padding instead. */
export const TimeLabel: React.FC<{time: string; variant?: 'mono' | 'caption'}> = ({time, variant = 'mono'}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        ...(variant === 'mono' ? font(13, 'medium', {mono: true}) : font(12)),
        color: colors.textTertiary,
        width: 80,
        flex: 'none',
        // Swift: .padding(.top, 2). Chrome's `normal` line box for SF Mono puts the glyphs 1.5pt higher than
        // CoreText; measured from reference, the digits sit 3pt below the row text's cap top → 3.5 here.
        paddingTop: variant === 'mono' ? 3.5 : 0,
        whiteSpace: 'nowrap',
      }}
    >
      {time}
    </div>
  );
};

/** TimelineRowActionButton: `.font(.system(size: 12))`, 28×28, `.buttonStyle(.muesli(.quiet))`. */
export const RowActionButton: React.FC<{symbol: string; color: string; state?: ControlState; weight?: 'regular' | 'semibold'}> = ({
  symbol,
  color,
  state = 'rest',
  weight = 'regular',
}) => (
  <Button kind="quiet" state={state} style={{width: 28, height: 28, flex: 'none'}}>
    <Symbol name={symbol} size={12} weight={weight} color={color} />
  </Button>
);

/** Is the hover-revealed action strip visible? (isHovered || focusedAction != nil || copied …) */
export const actionsVisible = (r: RowInteraction | undefined, extra = false) =>
  !!(r?.hovered || r?.focusedAction || r?.copied || extra);

export const actionState = (r: RowInteraction | undefined, id: RowActionId): ControlState => r?.actionStates?.[id] ?? 'rest';

/** "Copied" / "Trace copied": captionMedium, successText, trailing 4. */
export const CopiedLabel: React.FC<{text: string}> = ({text}) => {
  const {colors} = useMuesliTheme();
  return <span style={{...font(12, 'medium'), color: colors.successText, paddingRight: 4, whiteSpace: 'nowrap'}}>{text}</span>;
};

/** SyncOriginBadge and the CUA pill: SF Mono 10 bold, accentText on accentSubtle, padding 5×2, radius 4. */
export const MonoBadge: React.FC<{label: string; icon?: React.ReactNode; iconGap?: number}> = ({label, icon, iconGap = 3}) => {
  const {colors} = useMuesliTheme();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: iconGap,
        flex: 'none',
        padding: '2px 5px',
        borderRadius: 4,
        background: colors.accentSubtle,
        color: colors.accentText,
        ...font(10, 'bold', {mono: true}),
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </span>
  );
};

/** QuillIcon.image(): assets/quill-icon.svg (v0.8.6), rendered as a template image. */
export const QuillGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{flex: 'none', display: 'block'}} aria-hidden>
    <g fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 57C14 42 20 29 30 19C38 11 47 7 58 6C56 18 51 29 42 38C34 46 24 50 13 50" />
      <path d="M8 58C20 43 33 31 51 15" />
      <path d="M21 43L20 30" />
      <path d="M30 34L29 21" />
      <path d="M39 26L50 25" />
      <path d="M30 36L42 36" />
    </g>
  </svg>
);

const LUCIDE: Record<'chevronDown' | 'chevronUp' | 'trash', string> = {
  chevronDown: 'M6 9L12 15L18 9',
  chevronUp: 'M18 15L12 9L6 15',
  trash:
    'M10 11L10 17M14 11L14 17M19 6L19 20C19 21.1046 18.1046 22 17 22L7 22C5.8954 22 5 21.1046 5 20L5 6M3 6L21 6M8 6L8 4C8 2.8954 8.8954 2 10 2L14 2C15.1046 2 16 2.8954 16 4L16 6',
};

/** AIIcon (AIElementsSwift, Lucide paths): default 16pt, stroke size/12, round caps. */
export const AIIcon: React.FC<{name: keyof typeof LUCIDE; size?: number; color: string}> = ({name, size = 16, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{flex: 'none', display: 'block'}} aria-hidden>
    <path d={LUCIDE[name]} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * TargetApplicationIconView: the app's NSWorkspace icon scaled to fit `size` (default 20), or the
 * `app.dashed` fallback (padding size×0.13, textTertiary on surfacePrimary, radius size×0.22).
 */
export const TargetAppIcon: React.FC<{app: TargetApp; size?: number}> = ({app, size = 20}) => {
  const {colors} = useMuesliTheme();
  if (app.icon) {
    return <img src={app.icon} width={size} height={size} style={{flex: 'none', display: 'block', objectFit: 'contain'}} alt="" />;
  }
  const dashed = glyphs['app.dashed@regular'];
  const pad = size * 0.13;
  const inner = size - pad * 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.surfacePrimary,
        borderRadius: size * 0.22,
      }}
    >
      {/* .resizable().scaledToFit() into the padded box. */}
      <Symbol name="app.dashed" size={inner / Math.max(dashed.w, dashed.h)} weight="regular" color={colors.textTertiary} />
    </div>
  );
};
