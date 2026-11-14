// IndicatorWaveformDynamics.swift + NotchWaveformLevel (NotchIndicatorController.swift) @ v0.8.6.
// Pure maths shared by the floating pill and the notch. Videos pass audio levels in as props;
// use these helpers to turn real audio (dBFS per frame) into the same values the app draws.

export type Rect = {x: number; y: number; width: number; height: number};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** IndicatorWaveformDynamics.standingBarFrame: classic capsule bars (3pt wide, 3pt gap, 3 + 11 × amplitude tall). */
export function standingBarFrame(index: number, count: number, amplitude: number, bounds: Rect, overlapsMeeting = false): Rect {
  if (count <= 0 || index < 0 || index >= count) return {x: 0, y: 0, width: 0, height: 0};
  const b = overlapsMeeting ? {x: bounds.x + bounds.width - 85, y: bounds.y, width: 27, height: bounds.height} : bounds;
  const naturalWidth = count * 6 - 3;
  const scale = Math.min(1, Math.max(0, b.width) / naturalWidth);
  const width = 3 * scale;
  const spacing = 3 * scale;
  const total = count * width + Math.max(0, count - 1) * spacing;
  const height = Math.min(b.height, 3 + 11 * clamp01(amplitude));
  const midX = b.x + b.width / 2;
  const midY = b.y + b.height / 2;
  return {x: midX - total / 2 + index * (width + spacing), y: midY - height / 2, width, height};
}

/** IndicatorWaveformDynamics.amplitude(decibels:) — the floating pill's mapping (-68…-30 dB → 0…1). */
export function amplitudeFromDecibels(decibels: number): number {
  if (!Number.isFinite(decibels)) return 0;
  return clamp01((decibels + 68) / 38);
}

/** NotchWaveformLevel.amplitude(decibels:) — the notch's visual noise gate (-50…-20 dB, squared). */
export function notchAmplitudeFromDecibels(decibels: number): number {
  if (!Number.isFinite(decibels) || decibels <= -50) return 0;
  const normalized = Math.min(1, (decibels + 50) / 30);
  return normalized * normalized;
}

/** IndicatorWaveformDynamics.smooth: 0.48 × new + 0.52 × previous, applied once per 1/30 s tick. */
export const smooth = (amplitude: number, previous: number) => 0.48 * amplitude + 0.52 * previous;

/** Runs `smooth` over a series of raw per-tick amplitudes, as the 30 Hz timers do. */
export function smoothSeries(raw: number[], initial = 0): number[] {
  const out: number[] = [];
  let prev = initial;
  for (const r of raw) {
    prev = smooth(r, prev);
    out.push(prev);
  }
  return out;
}

/** IndicatorWaveformDynamics.standingWeight: a [0.6, 0.85, 1, 0.85, 0.6] profile resampled to `count` bars. */
export function standingWeight(index: number, count: number): number {
  const profile = [0.6, 0.85, 1, 0.85, 0.6];
  if (count <= 1) return 1;
  const position = (index / (count - 1)) * 4;
  const lower = Math.min(3, Math.max(0, Math.floor(position)));
  const fraction = position - lower;
  return profile[lower] + (profile[lower + 1] - profile[lower]) * fraction;
}

/**
 * The notch's scrolling history (NotchWaveformView.tick): 15 samples, newest last. Pass the smoothed
 * amplitudes for the most recent ticks (one per 1/30 s); missing history is zero.
 */
export function notchScrollingSamples(levels: number[], count = 15): number[] {
  const tail = levels.slice(-count);
  return [...Array(Math.max(0, count - tail.length)).fill(0), ...tail];
}

/** Latest value of a level series (the "smoothed" scalar the standing bars use). */
export const latestLevel = (levels: number[] | number | undefined): number =>
  typeof levels === 'number' ? levels : levels && levels.length ? levels[levels.length - 1] : 0;
