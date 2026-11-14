// MuesliButtonStyle / MuesliButtonChrome (MuesliControlStyles.swift @ v0.8.6).
// Interaction state is a prop, so videos can choreograph hover/press frame by frame.
import React from 'react';
import {useMuesliTheme} from '../theme/MuesliThemeProvider';
import {withAlpha} from '../tokens/theme';
import {radius as R} from '../tokens/theme';

export type ButtonKind = 'primary' | 'success' | 'recording' | 'secondary' | 'raised' | 'tinted' | 'destructive' | 'destructiveTinted' | 'quiet';
export type ControlState = 'rest' | 'highlighted' | 'pressed' | 'disabled';
export type ControlShape = {kind: 'rounded'; radius?: number} | {kind: 'capsule'} | {kind: 'circle'};

const borderRadiusFor = (shape: ControlShape) =>
  shape.kind === 'rounded' ? (shape.radius ?? R.small) : shape.kind === 'capsule' ? 9999 : '50%';

/** Colours for one kind/state, exactly as MuesliButtonChrome composes them. */
export function useButtonChrome(kind: ButtonKind, state: ControlState, opts: {bordered?: boolean; compresses?: boolean} = {}) {
  const t = useMuesliTheme();
  const c = t.colors;
  const o = t.opacity;
  const dark = t.isDark;
  const ultraDark = t.appearance === 'ultraDark';
  const compresses = opts.compresses ?? true;
  const bordered = opts.bordered ?? (kind === 'secondary' || kind === 'raised' || kind === 'destructive' || kind === 'destructiveTinted');

  const depth = !compresses
    ? 'none'
    : kind === 'primary' || kind === 'success' || kind === 'recording'
      ? 'lifted'
      : kind === 'secondary' || kind === 'raised'
        ? 'edge'
        : kind === 'tinted'
          ? 'rim'
          : 'none';
  const isRaised = state === 'rest' || state === 'highlighted';

  const lip = !isRaised
    ? 0
    : depth === 'lifted'
      ? dark ? 0.26 : 0.14
      : depth === 'edge'
        ? ultraDark ? 0 : dark ? 0.2 : 0.06
        : 0;
  const rimOpacity = !isRaised ? 0 : depth === 'lifted' ? 0.1 : depth === 'rim' ? 0.14 : 0;
  const rimColor =
    kind === 'primary' ? withAlpha(c.accentStateShade, rimOpacity)
    : kind === 'success' ? `rgba(255,255,255,${rimOpacity})`
    : kind === 'recording' ? `rgba(0,0,0,${rimOpacity})`
    : withAlpha(c.accent, rimOpacity);

  const disabled = state === 'disabled';
  let base = 'transparent';
  if (disabled && (kind === 'primary' || kind === 'success' || kind === 'recording' || kind === 'tinted')) base = c.surfacePrimary;
  else if (kind === 'primary') base = c.accent;
  else if (kind === 'success') base = c.success;
  else if (kind === 'recording') base = c.recordingFill;
  else if (kind === 'secondary') base = c.surfacePrimary;
  else if (kind === 'raised') base = c.backgroundRaised;
  else if (kind === 'tinted') base = withAlpha(c.accent, state === 'pressed' ? o.accentTintPressed : state === 'highlighted' ? o.accentTintHover : o.accentTintRest);
  else if (kind === 'destructive' || kind === 'destructiveTinted') {
    base = state === 'pressed' ? withAlpha(c.recording, o.destructiveTintPressed)
      : state === 'highlighted' ? withAlpha(c.recording, o.destructiveTintHover)
      : kind === 'destructiveTinted' && state === 'rest' ? withAlpha(c.recording, o.destructiveTintRest)
      : 'transparent';
  }

  let overlay = 'transparent';
  const tp = (a: number) => c.textPrimary.replace(/rgba\((\d+),(\d+),(\d+),[\d.]+\)/, `rgba($1,$2,$3,${a})`);
  if (kind === 'primary' && state !== 'disabled' && state !== 'rest') overlay = withAlpha(c.accentStateShade, state === 'pressed' ? o.accentShadePressed : o.accentShadeHover);
  else if (kind === 'success' && (state === 'pressed' || state === 'highlighted')) overlay = `rgba(255,255,255,${state === 'pressed' ? o.accentShadePressed : o.accentShadeHover})`;
  else if (kind === 'recording' && (state === 'pressed' || state === 'highlighted')) overlay = `rgba(0,0,0,${state === 'pressed' ? o.accentShadePressed : o.accentShadeHover})`;
  else if ((kind === 'secondary' || kind === 'raised' || kind === 'quiet') && (state === 'pressed' || state === 'highlighted')) overlay = tp(state === 'pressed' ? 0.11 : 0.06);

  const foreground =
    kind === 'primary' ? c.onAccent
    : kind === 'success' ? c.onSuccess
    : kind === 'recording' ? c.onRecordingFill
    : kind === 'tinted' ? c.accentText
    : kind === 'destructive' || kind === 'destructiveTinted' ? c.destructiveText
    : kind === 'quiet' ? undefined
    : c.textPrimary;

  const shadows: string[] = [];
  if (lip > 0) shadows.push(`inset 0 -1px 0 rgba(0,0,0,${lip})`);
  if (rimOpacity > 0 && (depth === 'lifted' || depth === 'rim')) shadows.push(`inset 0 0 0 1px ${rimColor}`);
  if (bordered) shadows.push(`inset 0 0 0 1px ${kind === 'destructiveTinted' ? withAlpha(c.recording, 0.2) : c.surfaceBorder}`);

  return {
    background: overlay === 'transparent' ? base : `linear-gradient(${overlay}, ${overlay}), ${base}`,
    boxShadow: shadows.join(', ') || 'none',
    // MuesliButtonChrome.foreground: disabled labels use textTertiary at full opacity;
    // only quiet buttons (which keep their own label colour) dim to 0.45.
    color: disabled && kind !== 'quiet' ? c.textTertiary : foreground,
    opacity: disabled && kind === 'quiet' ? 0.45 : 1,
    transform: compresses && state === 'pressed' ? 'scale(0.98)' : undefined,
  };
}

export const Button: React.FC<{
  kind: ButtonKind;
  state?: ControlState;
  shape?: ControlShape;
  bordered?: boolean;
  compresses?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({kind, state = 'rest', shape = {kind: 'rounded'}, bordered, compresses, style, children}) => {
  const chrome = useButtonChrome(kind, state, {bordered, compresses});
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadiusFor(shape),
        background: chrome.background,
        boxShadow: chrome.boxShadow,
        color: chrome.color,
        transform: chrome.transform,
        opacity: chrome.opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
