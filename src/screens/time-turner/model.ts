// Data model + pure helpers for Time Turner.
// Ports: VisualMemoryScrubScale (MuesliCore/VisualMemoryStore.swift @ v0.8.6),
// VisualMemoryDayTimeline.nearestIndex, MemoryExplorerView.iconMarkers (TimeTurnerView.swift),
// and en_US Date.formatted styles used by the views. Times are seconds since local midnight,
// so fixtures never touch Date.now().
import type React from 'react';

export interface TimeTurnerApp {
  /** Bundle identifier (used for marker de-duplication, like item.bundleID). */
  id: string;
  /** app.localizedName */
  name: string;
  /** App icon that fills its box (e.g. an <svg width="100%" height="100%">). Omit for the app.dashed fallback. */
  icon?: React.ReactNode;
}

export interface TimeTurnerCapture {
  id: string;
  /** Capture time, seconds since local midnight (may be fractional). */
  time: number;
  app: TimeTurnerApp;
  /** Focused window title. `source` = [app.name, windowTitle].joined(" · ") as in VisualMemoryController. */
  windowTitle?: string;
  /** OCR text. */
  text: string;
  /**
   * The screenshot of the focused window. A URL renders as an <img> with object-fit: contain
   * (scaledToFit); a ReactNode must fit itself inside its box (e.g. an SVG with preserveAspectRatio meet).
   */
  image: React.ReactNode | string;
}

export const captureSource = (c: TimeTurnerCapture) => [c.app.name, c.windowTitle ?? ''].filter((s) => s.length > 0).join(' · ');

// ---- Formatting (en_US) ----
const NNBSP = ' ';
const pad2 = (n: number) => String(n).padStart(2, '0');
const parts = (t: number) => {
  const s = Math.floor(((t % 86400) + 86400) % 86400);
  const h24 = Math.floor(s / 3600);
  return {h24, h12: h24 % 12 === 0 ? 12 : h24 % 12, m: Math.floor((s % 3600) / 60), s: s % 60, ampm: h24 < 12 ? 'AM' : 'PM'};
};
/** `.formatted(date: .omitted, time: .standard)` → "10:42:17 AM" */
export const formatTimeStandard = (t: number) => {
  const p = parts(t);
  return `${p.h12}:${pad2(p.m)}:${pad2(p.s)}${NNBSP}${p.ampm}`;
};
/** `.formatted(date: .omitted, time: .shortened)` → "10:42 AM" */
export const formatTimeShort = (t: number) => {
  const p = parts(t);
  return `${p.h12}:${pad2(p.m)}${NNBSP}${p.ampm}`;
};
/** `.formatted(date: .abbreviated, time: .standard)` with a fixed day label ("6 Nov 2026"). */
export const formatDateTimeStandard = (dayLabel: string, t: number) => `${dayLabel} at ${formatTimeStandard(t)}`;
/** `.formatted(date: .abbreviated, time: .shortened)` */
export const formatDateTimeShort = (dayLabel: string, t: number) => `${dayLabel} at ${formatTimeShort(t)}`;

// ---- VisualMemoryScrubScale ----
export interface ScrubScale {
  compressesGaps: boolean;
  fraction(time: number): number;
  time(at: number): number | undefined;
}

/** Port of VisualMemoryScrubScale: gaps longer than 120 s use 120 s of track. */
export function createScrubScale(times: number[]): ScrubScale {
  const dates = [...times].sort((a, b) => a - b);
  const positions: number[] = [];
  dates.forEach((d, i) => positions.push(i === 0 ? 0 : positions[i - 1] + Math.min(120, Math.max(1, d - dates[i - 1]))));
  const lowerBound = (values: number[], target: number) => {
    let low = 0;
    let high = values.length;
    while (low < high) {
      const mid = low + ((high - low) >> 1);
      if (values[mid] < target) low = mid + 1;
      else high = mid;
    }
    return low;
  };
  const total = positions[positions.length - 1];
  return {
    compressesGaps: dates.some((d, i) => i > 0 && d - dates[i - 1] > 120),
    fraction(date) {
      if (!dates.length || !(total > 0)) return 0;
      if (date <= dates[0]) return 0;
      if (date >= dates[dates.length - 1]) return 1;
      const upper = lowerBound(dates, date);
      const lower = upper - 1;
      const interval = dates[upper] - dates[lower];
      const local = interval > 0 ? (date - dates[lower]) / interval : 0;
      return (positions[lower] + local * (positions[upper] - positions[lower])) / total;
    },
    time(fraction) {
      if (!dates.length) return undefined;
      if (!(total > 0)) return dates[0];
      const position = Math.min(1, Math.max(0, fraction)) * total;
      const upper = lowerBound(positions, position);
      if (upper <= 0) return dates[0];
      const lower = upper - 1;
      const local = (position - positions[lower]) / (positions[upper] - positions[lower]);
      return dates[lower] + local * (dates[upper] - dates[lower]);
    },
  };
}

/** VisualMemoryDayTimeline.nearestIndex: the capture closest in time (earlier wins ties). */
export function nearestIndex(captures: TimeTurnerCapture[], time: number): number | undefined {
  if (!captures.length) return undefined;
  let best = 0;
  captures.forEach((c, i) => {
    if (Math.abs(c.time - time) < Math.abs(captures[best].time - time)) best = i;
  });
  return best;
}

/** MemoryExplorerView.iconMarkers: one row; a marker per app switch, at least 30 pt apart. */
export function iconMarkers(captures: TimeTurnerCapture[], scale: ScrubScale, width: number) {
  const markers: Array<{capture: TimeTurnerCapture; x: number}> = [];
  let previous: string | undefined;
  for (const item of captures) {
    const bundle = item.app.id;
    if (bundle !== previous) {
      const x = Math.min(Math.max(14, width - 14), Math.max(14, scale.fraction(item.time) * width));
      if (!markers.length || x - markers[markers.length - 1].x >= 30) markers.push({capture: item, x});
    }
    previous = bundle;
  }
  return markers;
}
