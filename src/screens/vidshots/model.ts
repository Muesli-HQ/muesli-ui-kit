// Vidshot data shapes and pure helpers ported from v0.8.6:
//   FeedbackCapturePillState.swift (pill states + title)
//   MuesliCore/FeedbackCaptureManifest.swift (FeedbackCaptureRecord / FeedbackCaptureState)
//   FeedbackCaptureInkOverlay.swift (ink hold/fade timing)
//   IndicatorWaveformDynamics.swift + NotchIndicatorController.swift (NotchWaveformLevel)

/** FeedbackCapturePillState. `seconds` is elapsed recording time. */
export type VidshotPillState =
  | {kind: 'preparing'}
  | {kind: 'recording'; seconds: number; deadMicrophone?: boolean}
  | {kind: 'processing'}
  | {kind: 'ready'}
  | {kind: 'recovered'}
  | {kind: 'copied'; partial?: string}
  | {kind: 'readyToCopy'; partial?: string}
  | {kind: 'blocked'; permission: string}
  | {kind: 'busy'; activity: string}
  | {kind: 'failed'; stage: string; message: string; retainedMedia: boolean};

/** `String(format: "%d:%02d", m, s)` */
export const formatClock = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
export const formatDurationMs = (ms: number) => formatClock(Math.floor(ms / 1000));

/** FeedbackCapturePillState.title */
export function pillTitle(state: VidshotPillState): string {
  switch (state.kind) {
    case 'preparing': return 'Preparing Vidshot';
    case 'recording': return formatClock(state.seconds);
    case 'processing': return 'Processing';
    case 'ready': return 'Ready';
    case 'recovered': return 'Recovered';
    case 'copied': return 'Copied' + (state.partial ? ` · ${state.partial}` : '');
    case 'readyToCopy': return 'Ready' + (state.partial ? ` · ${state.partial}` : '');
    case 'blocked': return `Vidshot needs ${state.permission}`;
    case 'busy': return `${state.activity} first`;
    case 'failed': return `${state.stage} failed: ${state.message}`;
  }
}

/** FeedbackCaptureAdmission.missingPermission order. */
export const VIDSHOT_PERMISSIONS = ['Screen Recording', 'Microphone', 'Accessibility', 'Input Monitoring'] as const;

/** FeedbackCaptureState */
export type VidshotCaptureState = 'recording' | 'processing' | 'ready' | 'recovered' | 'failed';

export interface VidshotKeyframe {
  index: number;
  /** ms from capture start */
  t: number;
  said: string;
  /** Optional image for the frame thumbnail (220pt wide). */
  imageSrc?: string;
}

export interface VidshotRecord {
  id: string;
  /** FeedbackCaptureRecord.title = target.appName ("Screen region" for regions). */
  title: string;
  /** Pre-formatted dates (never computed from Date.now()). */
  createdAt: {
    /** TimelineView.timeFormatter "hh:mm a" → "10:42 AM" */
    time: string;
    /** `.formatted(date: .abbreviated, time: .omitted)` → "Nov 9, 2026" */
    day: string;
    /** `Date.formatted()` → "11/9/2026, 10:42 AM" */
    full: string;
  };
  durationMs: number;
  state: VidshotCaptureState;
  transcript?: string;
  hasVideo: boolean;
  hasAudio: boolean;
  /** Thumbnail / poster image (first video frame). */
  previewSrc?: string;
  keyframes?: VidshotKeyframe[];
  /** FeedbackCaptureMark.description, e.g. "pin 1" or "marked region x 0.12–0.40, y 0.30–0.52". */
  marks?: string[];
  failures?: {stage: string; message: string}[];
}

/** TimelineVidshotRow: appName label hides generic screen names. */
export const rowAppLabel = (title: string) =>
  ['screen region', 'screen capture', 'screen'].includes(title.trim().toLowerCase()) ? '' : title.trim();

/**
 * FeedbackCaptureInkOverlay.update: a freehand stroke holds 650 ms after release then fades
 * over 650 ms; a pin shows for 350 ms. `ageMs` = time since the stroke ended (t - t1).
 */
export function inkAlpha(ageMs: number, isPin: boolean): number {
  const age = Math.max(0, ageMs);
  if (age >= 1300) return 0;
  if (isPin) return age < 350 ? 1 : 0;
  return age <= 650 ? 1 : (1300 - age) / 650;
}

/** NotchWaveformLevel.amplitude(decibels:) */
export const waveformAmplitude = (decibels: number) => {
  if (!Number.isFinite(decibels) || decibels <= -50) return 0;
  const n = Math.min(1, (decibels + 50) / 30);
  return n * n;
};

/** IndicatorWaveformDynamics.standingWeight */
export function standingWeight(index: number, count: number): number {
  const profile = [0.6, 0.85, 1, 0.85, 0.6];
  if (count <= 1) return 1;
  const position = (index / (count - 1)) * 4;
  const lower = Math.min(3, Math.max(0, Math.floor(position)));
  const fraction = position - lower;
  return profile[lower] + (profile[lower + 1] - profile[lower]) * fraction;
}
