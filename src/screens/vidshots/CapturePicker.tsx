// FeedbackCapturePicker.swift @ v0.8.6 (SelectionView.draw): the full-screen selection surface
// shown after ⌥⇧S. One borderless .screenSaver-level panel per display; this is one display.
//   - whole screen dimmed with black @ 35%
//   - the hovered window or the dragged region is cleared (black @ 2%) and outlined 2pt white @ 95%
//   - a hint label, 14pt semibold white on black @ 80%, radius 8, padding 12×6, centred 24pt from the top
// The crosshair cursor (resetCursorRects) is not drawn; the video supplies its own cursor.
import React from 'react';
import {font} from '../../typography';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CapturePickerOverlayProps {
  /** Display size in points (the panel covers screen.frame). */
  width: number;
  height: number;
  /**
   * The highlight: a hovered window's bounds, or the in-progress drag rectangle (top-left origin).
   * Omit for nothing highlighted. Clipped to the display, as `intersection(bounds)` does.
   */
  highlight?: Rect;
  /** Hide the hint label (it is always drawn in the app). */
  hideHint?: boolean;
}

export const PICKER_HINT = 'Drag to select a region  ·  Click a window  ·  Esc to cancel';

export const CapturePickerOverlay: React.FC<CapturePickerOverlayProps> = ({width, height, highlight, hideHint}) => {
  let hole: Rect | null = null;
  if (highlight) {
    const x0 = Math.max(0, Math.min(highlight.x, highlight.x + highlight.width));
    const y0 = Math.max(0, Math.min(highlight.y, highlight.y + highlight.height));
    const x1 = Math.min(width, Math.max(highlight.x, highlight.x + highlight.width));
    const y1 = Math.min(height, Math.max(highlight.y, highlight.y + highlight.height));
    if (x1 > x0 && y1 > y0) hole = {x: x0, y: y0, width: x1 - x0, height: y1 - y0};
  }
  const dim = hole
    ? `M0 0H${width}V${height}H0Z M${hole.x} ${hole.y}V${hole.y + hole.height}H${hole.x + hole.width}V${hole.y}Z`
    : `M0 0H${width}V${height}H0Z`;
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden'}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, display: 'block'}} aria-hidden>
        <path d={dim} fill="rgba(0,0,0,0.35)" fillRule="evenodd" />
        {hole ? (
          <>
            <rect x={hole.x} y={hole.y} width={hole.width} height={hole.height} fill="rgba(0,0,0,0.02)" />
            {/* NSBezierPath(rect:).stroke() with lineWidth 2: centred on the rect edge. */}
            <rect x={hole.x} y={hole.y} width={hole.width} height={hole.height} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
          </>
        ) : null}
      </svg>
      {hideHint ? null : (
        <div style={{position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              ...font(14, 'semibold'),
              color: '#FFFFFF',
              background: 'rgba(0,0,0,0.8)',
              borderRadius: 8,
              padding: '6px 12px',
              whiteSpace: 'pre',
            }}
          >
            {PICKER_HINT}
          </div>
        </div>
      )}
    </div>
  );
};
