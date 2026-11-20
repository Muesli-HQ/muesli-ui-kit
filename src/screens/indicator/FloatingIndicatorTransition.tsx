// FloatingIndicatorController.swift @ v0.8.6: the motion between floating-pill states (transitionDuration,
// frameForState, the NSAnimationContext group that animates the panel frame and the labels' alpha).
//
//   preparing (any → preparing) and preparing → recording: 0 s (jump)
//   idle ↔ idle hover: 0.24 s expanding, 0.20 s collapsing
//   anything to or from idle: 0.18 s
//   everything else (recording → transcribing, notices…): 0.16 s
//
// The panel frame eases (NSAnimationContext default: ease-in-ease-out) between the two sizes. Old and new contents
// cross-fade and clip at the moving edge. Hover expansion keeps the collapsed pill's left edge (custom anchor);
// active states resize around the panel's centre (frameForState keeps midX).
// Checked against the owner's 2026-11-15 capture of the Classic pill (hover 0.2 s collapse with the label clipping
// and the mark fixed; hold → instant preparing → instant recording; release → 0.16 s growth into "Transcribing";
// 0.18 s collapse back to the idle mark).
import React from 'react';
import {fontStack} from '../../fonts';
import {FloatingIndicator, type FloatingIndicatorProps, type FloatingPhase} from './FloatingIndicator';

let ctx: CanvasRenderingContext2D | null | undefined;
const textWidth = (text: string, size: number, weight = 400) => {
  if (ctx === undefined) {
    try {
      ctx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
    } catch {
      ctx = null;
    }
  }
  if (!ctx) return text.length * size * 0.53;
  ctx.font = `${weight} ${size}px ${fontStack}`;
  return ctx.measureText(text).width;
};

/** frameForState sizes (points). Content-sized states measure their label like the Swift helpers do. */
export const floatingIndicatorSize = (p: FloatingIndicatorProps): {w: number; h: number} => {
  const prompt = `${p.isToggle ? 'Press' : 'Hold'} ${p.hotkeyLabel ?? 'Right Option'} to dictate`;
  switch (p.phase) {
    case 'idle':
      return {w: 44, h: 28};
    case 'idleHover':
      return {w: Math.max(220, Math.ceil(42 + textWidth(prompt, 11) + 22)), h: 36};
    case 'minimalIdle':
    case 'minimalHover':
      return {w: Math.ceil(37 + textWidth(prompt, 13) + 16), h: 40};
    case 'preparing':
    case 'recording':
      return {w: 76, h: 22};
    case 'connecting':
      return {w: 116, h: 22};
    case 'transcribing':
      return {w: Math.max(190, Math.ceil(14 + 18 + 6 + textWidth(p.transcribingTitle ?? 'Transcribing', 11) + 8 + 14)), h: 32};
    case 'warning':
    case 'success':
      return {w: Math.min(640, Math.max(180, Math.ceil(18 + 24 + 4 + textWidth(p.message ?? '', 11, 500) + 18))), h: 36};
  }
};

const isIdle = (p: FloatingPhase) => p === 'idle' || p === 'idleHover';

/** transitionDuration(from:to:wasHovered:isHovered:), in seconds. */
export const floatingTransitionDuration = (from: FloatingPhase, to: FloatingPhase): number => {
  if (to === 'preparing' || to === 'connecting') return 0;
  if ((from === 'preparing' || from === 'connecting') && to === 'recording') return 0;
  if (isIdle(from) && isIdle(to) && from !== to) return to === 'idleHover' ? 0.24 : 0.2;
  if (isIdle(from) || isIdle(to)) return 0.18;
  return 0.16;
};

/** CAMediaTimingFunction easeInEaseOut (0.42, 0, 0.58, 1). */
const easeInOut = (x: number) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // Solve the cubic-bezier x(t) = x for t (Newton), then return y(t).
  const cx = 3 * 0.42, bx = 3 * (0.58 - 0.42) - cx, ax = 1 - cx - bx;
  const cy = 0, by = 3, ay = -2;
  let t = x;
  for (let i = 0; i < 6; i++) {
    const xt = ((ax * t + bx) * t + cx) * t - x;
    const d = (3 * ax * t + 2 * bx) * t + cx;
    if (Math.abs(d) < 1e-6) break;
    t -= xt / d;
  }
  return ((ay * t + by) * t + cy) * t;
};

export interface FloatingIndicatorTransitionProps {
  from: FloatingIndicatorProps;
  to: FloatingIndicatorProps;
  /** Seconds since the state change. */
  t: number;
  /**
   * Where the panel is pinned while it resizes. anchorCenter keeps a preset anchor's edge inset 8pt from the visible
   * frame for every size, so: 'trailing' for the *Trailing anchors (default .midTrailing), 'leading' for *Leading and
   * for idle ↔ idle hover at a custom position, 'center' for the *Center anchors. Default: leading for idle ↔ idle
   * hover, otherwise center.
   */
  pin?: 'center' | 'leading' | 'trailing';
}

/**
 * Renders around its own origin: with pin 'center' the origin is the pill's centre; with 'leading' / 'trailing' it is
 * the midpoint of the pill's left / right edge. Place the wrapper at that point.
 */
export const FloatingIndicatorTransition: React.FC<FloatingIndicatorTransitionProps> = ({from, to, t, pin}) => {
  const duration = floatingTransitionDuration(from.phase, to.phase);
  const p = duration === 0 ? 1 : easeInOut(t / duration);
  const a = floatingIndicatorSize(from);
  const b = floatingIndicatorSize(to);
  const size = {w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p};
  const mode = pin ?? (isIdle(from.phase) && isIdle(to.phase) ? 'leading' : 'center');
  const left = mode === 'center' ? -size.w / 2 : mode === 'trailing' ? -size.w : 0;
  const layer = (props: FloatingIndicatorProps, opacity: number) =>
    opacity <= 0 ? null : (
      <div style={{position: 'absolute', left, top: -size.h / 2, opacity}}>
        <FloatingIndicator {...props} size={p >= 1 && props === to ? undefined : size} />
      </div>
    );
  return (
    <div style={{position: 'relative', width: 0, height: 0}}>
      {/* Overlapping fades (one panel in AppKit): neither layer drops below ~50% mid-way, so the glass never washes out. */}
      {layer(from, Math.min(1, 2 * (1 - p)))}
      {layer(to, Math.min(1, 2 * p))}
    </div>
  );
};
