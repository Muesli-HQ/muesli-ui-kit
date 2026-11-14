// FeedbackCaptureInkOverlay.swift + FeedbackCaptureRenderer.drawInk @ v0.8.6: the click-through
// overlay shown while a Vidshot records.
//   - boundary (window/region captures): rect inset 1.5, stroked 3pt black @ 75% then 1.5pt systemRed
//   - ink, clipped to the capture rect: #FF3B30, 3pt, round cap/join polyline
//   - pin: 30pt ring (3pt stroke) + 20pt filled dot + number in AppFonts.bold(12) white, baseline 4pt below centre
// Fade timing (hold 650ms, fade 650ms; pins 350ms) is in `inkAlpha()` (model.ts); pass the result as `opacity`.
import React, {useId} from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font} from '../../typography';
import type {Rect} from './CapturePicker';

/** drawInk: device components (1, 59/255, 48/255). */
export const INK_COLOR = '#FF3B30';

export interface InkStroke {
  /** Samples normalised to the capture rect, 0..1, top-left origin (pts / 10000). */
  points: Array<[number, number]>;
  /** A numbered pin at points[0] instead of a freehand stroke. */
  pin?: number;
  /** Fraction of the stroke drawn so far, 0..1 (default 1). Interpolates the last segment. */
  progress?: number;
  /** Per-stroke alpha (context.setAlpha), see inkAlpha(). Default 1. */
  opacity?: number;
}

export interface InkOverlayProps {
  /** Display size in points. */
  width: number;
  height: number;
  /** Capture target rect in display points (top-left origin). */
  target: Rect;
  /** True for window and region captures (FeedbackCaptureInputMonitor: target.region != nil || windowID != nil). */
  showsBoundary?: boolean;
  strokes?: InkStroke[];
}

function partialPoints(points: Array<[number, number]>, progress: number): Array<[number, number]> {
  const p = Math.max(0, Math.min(1, progress));
  if (p >= 1 || points.length < 2) return points;
  const pos = p * (points.length - 1);
  const i = Math.floor(pos);
  const f = pos - i;
  const out = points.slice(0, i + 1);
  if (f > 0 && i + 1 < points.length) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    out.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
  }
  return out;
}

export const InkOverlay: React.FC<InkOverlayProps> = ({width, height, target, showsBoundary = true, strokes = []}) => {
  const {isDark} = useMuesliTheme();
  const systemRed = isDark ? '#FF453A' : '#FF3B30'; // NSColor.systemRed. VERIFY panel appearance.
  const clipId = `vidshot-ink-${useId().replace(/:/g, '')}`;
  const b = {x: target.x + 1.5, y: target.y + 1.5, width: target.width - 3, height: target.height - 3};
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'hidden'}} aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <rect x={target.x} y={target.y} width={target.width} height={target.height} />
        </clipPath>
      </defs>
      {showsBoundary && target.width > 2 && target.height > 2 ? (
        <>
          <rect {...b} fill="none" stroke="rgba(0,0,0,0.75)" strokeWidth={3} />
          <rect {...b} fill="none" stroke={systemRed} strokeWidth={1.5} />
        </>
      ) : null}
      <g clipPath={`url(#${clipId})`}>
        {strokes.map((s, k) => {
          if (s.points.length < 1) return null;
          const map = ([x, y]: [number, number]) => [target.x + x * target.width, target.y + y * target.height] as const;
          if (s.pin != null) {
            const [cx, cy] = map(s.points[0]);
            return (
              <g key={k} opacity={s.opacity ?? 1}>
                <circle cx={cx} cy={cy} r={15} fill="none" stroke={INK_COLOR} strokeWidth={3} />
                <circle cx={cx} cy={cy} r={10} fill={INK_COLOR} />
                <text x={cx} y={cy + 4} textAnchor="middle" style={{...font(12, 'bold'), fill: '#FFFFFF'}}>
                  {s.pin}
                </text>
              </g>
            );
          }
          const pts = partialPoints(s.points, s.progress ?? 1).map(map);
          if (pts.length < 2) return null;
          return (
            <polyline
              key={k}
              points={pts.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke={INK_COLOR}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={s.opacity ?? 1}
            />
          );
        })}
      </g>
    </svg>
  );
};
