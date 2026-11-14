// NotchIndicatorController.swift (NotchIndicatorGeometry, NotchIndicatorView, NotchWaveformView, NotchStatusView),
// NotchCompletionOutline.swift (NotchCompletionTiming + sweep), RecordingIndicatorPalette.swift @ v0.8.6.
// The titles per phase come from FloatingIndicatorController.setState (the notch's caller).
//
// Muesli's default dictation flow on the notch: hold hotkey → "Listening" with a 7-bar standing waveform →
// release → "Transcribing" with a spinner → text pastes → the bar goes idle and plays the completion sweep
// (showDictationCompletion after a successful paste), then hides. Idle is hidden (activity-only surface).
import React from 'react';
import {Symbol, MuesliMark} from '../../icons/Icon';
import {glyphs, type GlyphKey} from '../../icons/generated';
import {font} from '../../typography';
import {generated as g} from '../../tokens/generated';
import {MacSpinner} from '../settings/controls';
import {latestLevel, notchScrollingSamples, standingBarFrame, standingWeight} from './waveform';

// ---------- Geometry ----------

/** NotchIndicatorGeometry: cutout (camera housing) + wings. Right wing is min(wing, 78). */
export interface NotchGeometry {
  screenWidth: number;
  /** cutout.width: the gap between auxiliaryTopLeftArea and auxiliaryTopRightArea. */
  cutoutWidth: number;
  /** cutout.height = NSScreen.safeAreaInsets.top. */
  height: number;
  /** min(110, left.width, right.width). */
  wingWidth: number;
}

/**
 * 14" MacBook Pro at the default 1512×982 scaling. VERIFY: cutout width and safe-area height are not in the
 * app source (they come from NSScreen at runtime); measure on the device and adjust.
 */
export const NOTCH_MBP_1512: NotchGeometry = {screenWidth: 1512, cutoutWidth: 185, height: 32, wingWidth: 110};

export function notchFrame(geo: NotchGeometry = NOTCH_MBP_1512) {
  const rightWingWidth = geo.cutoutWidth > 0 ? Math.min(geo.wingWidth, 78) : geo.wingWidth;
  const cutoutX = (geo.screenWidth - geo.cutoutWidth) / 2;
  const width = geo.wingWidth + geo.cutoutWidth + rightWingWidth;
  return {x: cutoutX - geo.wingWidth, y: 0, width, height: geo.height, rightWingWidth, cutoutX, midX: cutoutX - geo.wingWidth + width / 2};
}

// ---------- Palette ----------

/** RecordingIndicatorPalette.accent: the neutral theme ("1e1e2e") maps to the default dark accent. */
export function recordingIndicatorAccent(hex = '1e1e2e'): string {
  const v = hex.trim().replace('#', '').toLowerCase();
  const ok = v.length === 6 && v !== '1e1e2e' && /^[0-9a-f]{6}$/.test(v);
  return '#' + (ok ? v : g.defaultAccent.dark.replace('#', '')).toUpperCase();
}

/** NSColor system colours in the notch's forced dark appearance. VERIFY against macOS 26 values. */
export const SYSTEM_DARK = {yellow: '#FFD60A', green: '#30D158', blue: '#0A84FF', orange: '#FF9F0A'} as const;

// ---------- Phases ----------

export type NotchPhase =
  | 'preparing'
  | 'connecting'
  | 'listening'
  | 'handsFree'
  | 'transcribing'
  | 'completion'
  | 'notice'
  | 'done'
  | 'failed'
  | 'meeting'
  | 'meetingPaused';

type Outcome = 'success' | 'needsInput' | 'failure';
interface Resolved {
  active: boolean;
  title: string;
  recording: boolean;
  paused: boolean;
  meeting: boolean;
  handsFree: boolean;
  outcome?: Outcome;
  isStatus: boolean;
  icon: 'mark' | 'waveform';
  accent: string;
}

function resolvePhase(phase: NotchPhase, accent: string, transcribingTitle: string): Resolved {
  const base: Resolved = {active: true, title: '', recording: false, paused: false, meeting: false, handsFree: false, isStatus: false, icon: 'mark', accent};
  switch (phase) {
    case 'preparing': return {...base, title: 'Preparing'};
    case 'connecting': return {...base, title: 'Connecting'};
    case 'listening': return {...base, title: 'Listening', recording: true};
    case 'handsFree': return {...base, title: 'Listening', recording: true, handsFree: true};
    case 'transcribing': return {...base, title: transcribingTitle};
    // showCompletion keeps the idle render (title "muesli", inactive) and overlays the sweep.
    case 'completion': return {...base, active: false, title: 'muesli'};
    // showStatus(.warning) → title "Notice", systemYellow, outcome .needsInput, waveform icon.
    case 'notice': return {...base, title: 'Notice', isStatus: true, outcome: 'needsInput', icon: 'waveform', accent: SYSTEM_DARK.yellow};
    // showStatus(.success) → "Done", systemGreen, outcome .success.
    case 'done': return {...base, title: 'Done', isStatus: true, outcome: 'success', icon: 'waveform', accent: SYSTEM_DARK.green};
    // showOutcome(.failure) (Quill / computer use) → "Failed", recordingFillHex.
    case 'failed': return {...base, title: 'Failed', outcome: 'failure', accent: g.fixed.recordingFillHex};
    case 'meeting': return {...base, title: 'Meeting', recording: true, meeting: true, handsFree: true};
    case 'meetingPaused': return {...base, title: 'Paused', recording: true, paused: true, meeting: true, handsFree: true};
  }
}

const outcomeColor = (o: Outcome) => (o === 'success' ? SYSTEM_DARK.green : o === 'needsInput' ? SYSTEM_DARK.yellow : g.fixed.recordingFillHex);

// ---------- Shapes ----------

/** UnevenRoundedRectangle(bottomLeadingRadius: r, bottomTrailingRadius: r) inset by `i`, starting top-left, clockwise.
 *  SwiftUI's default corner style is .continuous; circular arcs here. VERIFY start point of the trimmed path. */
function bottomRoundedPath(w: number, h: number, r: number, i: number) {
  const rr = Math.max(0, r - i);
  return `M${i} ${i} H${w - i} V${h - i - rr} A${rr} ${rr} 0 0 1 ${w - i - rr} ${h - i} H${i + rr} A${rr} ${rr} 0 0 1 ${i} ${h - i - rr} Z`;
}

/** Fits an SF Symbol inside a square like `.resizable().scaledToFit().frame(width:height:)`. */
const FittedSymbol: React.FC<{name: string; weight?: 'regular' | 'medium' | 'semibold' | 'bold'; box: number; color: string}> = ({name, weight = 'regular', box, color}) => {
  const gl = glyphs[`${name}@${weight}` as GlyphKey];
  const size = gl ? box / Math.max(gl.w, gl.h) : box;
  return (
    <span style={{width: box, height: box, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
      <Symbol name={name} size={size} weight={weight} color={color} />
    </span>
  );
};

// ---------- Waveform ----------

/** NotchWaveformView: 7 standing bars (dictation) or 15 scrolling bars (hands-free / meetings), accent with a glow. */
const NotchWaveform: React.FC<{levels: number[] | number; scrolling: boolean; accent: string; width: number; height: number}> = ({levels, scrolling, accent, width, height}) => {
  const bounds = {x: 0, y: 0, width, height};
  const bars: Array<{x: number; y: number; w: number; h: number; amp: number}> = [];
  if (!scrolling) {
    const smoothed = latestLevel(levels);
    const count = 7;
    for (let i = 0; i < count; i++) {
      const amp = smoothed * standingWeight(i, count);
      const f = standingBarFrame(i, count, amp, bounds);
      bars.push({x: f.x, y: f.y, w: f.width, h: f.height, amp});
    }
  } else {
    const samples = notchScrollingSamples(Array.isArray(levels) ? levels : [levels], 15);
    const stride = width / 15;
    const w = Math.min(1.25, stride * 0.5);
    samples.forEach((amp, i) => {
      const h = 0.75 + amp * Math.max(0, Math.min(14, height) - 0.75);
      bars.push({x: i * stride + (stride - w) / 2, y: (height - h) / 2, w, h, amp});
    });
  }
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden', flex: 'none'}}>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            borderRadius: Math.min(b.w, b.h) / 2,
            background: accent,
            // CALayer shadowRadius 3, offset 0, opacity amplitude × 0.2
            boxShadow: `0 0 3px ${hexA(accent, b.amp * 0.2)}`,
          }}
        />
      ))}
    </div>
  );
};

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
};

// ---------- Completion sweep (NotchCompletionTiming) ----------

function completionStroke(progress: number) {
  const t = Math.max(0, Math.min(1, progress)) * 0.8; // seconds into NotchCompletionTiming.duration
  // opacity keyframes [op, op, 0] at [0, 0.8125, 1] over 0.8 s
  const fade = t / 0.8 <= 0.8125 ? 1 : Math.max(0, 1 - (t / 0.8 - 0.8125) / (1 - 0.8125));
  // sweep keyframes over 0.65 s: strokeStart [0,0,1] @ [0, .35/1.35, 1], strokeEnd [0,1,1] @ [0, 1/1.35, 1]
  const u = Math.min(1, t / 0.65);
  const k1 = 0.35 / 1.35;
  const k2 = 1 / 1.35;
  const start = u <= k1 ? 0 : (u - k1) / (1 - k1);
  const end = Math.min(1, u / k2);
  return {outlineOpacity: 0.3 * fade, sweepOpacity: fade, start, end};
}

// ---------- Bar ----------

export interface NotchIndicatorProps {
  phase: NotchPhase;
  /** Smoothed amplitudes (0…1), one per 1/30 s tick, newest last. Standing bars use the last value. */
  levels?: number[] | number;
  /** config.recordingColorHex; "1e1e2e" (default) → the default dark accent #6BA3F7. */
  recordingColorHex?: string;
  /** setTranscribingTitle (default "Transcribing"; meetings use "Cleaning", "Titling", "Summarizing"). */
  transcribingTitle?: string;
  /** Edge glow: 0.7 right after activation, eases to 0.18 over 1.2 s (easeOut). Default 0.18. */
  edgeIntensity?: number;
  /** 0…1 through the 0.8 s completion sweep (phase "completion"). */
  completionProgress?: number;
  /** 0…1 rotation of the spinner. */
  spinnerPhase?: number;
  geometry?: NotchGeometry;
  /** Dictating while a meeting records (v0.8.6): second line under the title. "Meeting recording" reads "Meeting on". */
  meetingStatus?: string;
}

export const NotchIndicatorBar: React.FC<NotchIndicatorProps> = ({
  phase,
  levels = 0,
  recordingColorHex = '1e1e2e',
  transcribingTitle = 'Transcribing',
  edgeIntensity = 0.18,
  completionProgress = 0,
  spinnerPhase = 0,
  geometry = NOTCH_MBP_1512,
  meetingStatus,
}) => {
  const r = resolvePhase(phase, recordingIndicatorAccent(recordingColorHex), transcribingTitle);
  const frame = notchFrame(geometry);
  const W = frame.width;
  const H = frame.height;
  const fg = r.outcome === 'needsInput' || r.outcome === 'success' ? '#000000' : '#FFFFFF';
  const bg = r.outcome ? outcomeColor(r.outcome) : '#000000';
  const controlWidth = r.active ? (r.meeting ? 40 : r.recording && r.handsFree ? 42 : 22) : 0;
  const gaps = r.active ? (r.meeting || (r.recording && r.handsFree) ? 8 : 4) : 0;
  const waveformWidth = Math.max(0, Math.min(58, frame.rightWingWidth - 12 - controlWidth - gaps));
  const waveformHeight = Math.min(20, H - 8);
  const sweep = phase === 'completion' ? completionStroke(completionProgress) : null;
  const silhouette = bottomRoundedPath(W, H, 12, 0);

  const cancelButton = (
    <div style={{width: 22, height: 22, borderRadius: 11, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(rgba(255,255,255,0.16), rgba(255,255,255,0.06))', boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.12)'}}>
      <Symbol name="xmark" size={9} weight="semibold" color={fg} />
    </div>
  );
  const plainButton = (name: string, weight: 'regular' | 'semibold', w = 20) => (
    <div style={{width: w, height: 22, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Symbol name={name} size={name === 'xmark' ? 9 : 10} weight={weight} color={fg} />
    </div>
  );

  let status: React.ReactNode = null;
  if (r.recording && !r.paused) status = <NotchWaveform levels={levels} scrolling={r.handsFree} accent={r.accent} width={waveformWidth} height={waveformHeight} />;
  else if (r.paused) status = <Symbol name="pause.fill" size={13} weight="regular" color={fg} />;
  else if (r.outcome) status = <Symbol name={r.outcome === 'success' ? 'circle.fill' : 'exclamationmark.triangle.fill'} size={13} weight="regular" color={fg} />;
  else if (r.active) status = <MacSpinner size={10} color={r.accent} phase={spinnerPhase} />; // ProgressView().controlSize(.mini).tint(accent). VERIFY tint + size

  return (
    <div style={{position: 'relative', width: W, height: H, color: fg}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}} aria-hidden>
        <path d={silhouette} fill={bg} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', clipPath: `path('${silhouette}')`}}>
        {/* Left wing: optional discard (meetings), then logo + title. HStack(spacing 4).padding(.horizontal, 7) */}
        <div style={{width: geometry.wingWidth, flex: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '0 7px', boxSizing: 'border-box'}}>
          {r.active && r.meeting ? plainButton('xmark', 'semibold', 22) : null}
          <div style={{flex: 1, minWidth: 0, minHeight: H, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5}}>
            {r.icon === 'mark' ? <MuesliMark color={fg} box={16} /> : <FittedSymbol name="waveform" box={16} color={fg} />}
            {/* Text(title).foregroundStyle(Color.primary): primary resolves to white in the forced dark scheme, even on yellow/green outcomes. */}
            {/* VStack(alignment: .leading, spacing: 0) { title; meetingStatus (9pt, .secondary) } */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
              <span style={{...font(10, 'semibold'), color: '#FFFFFF', whiteSpace: 'nowrap'}}>{r.title}</span>
              {meetingStatus ? <span style={{...font(9), color: 'rgba(235,235,245,0.6)', whiteSpace: 'nowrap'}}>{meetingStatus === 'Meeting recording' ? 'Meeting on' : meetingStatus}</span> : null}
            </div>
          </div>
        </div>
        {/* Camera region: always black, never interactive. */}
        <div style={{width: geometry.cutoutWidth, flex: 'none', background: '#000000'}} />
        {/* Right wing: status + controls. HStack(spacing 4).padding(.horizontal, 6) */}
        <div style={{width: frame.rightWingWidth, flex: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '0 6px', boxSizing: 'border-box'}}>
          <div style={{flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{status}</div>
          {r.active && r.meeting ? (
            <>
              {plainButton(r.paused ? 'play.fill' : 'pause.fill', 'semibold')}
              {plainButton('stop.fill', 'semibold')}
            </>
          ) : r.active ? (
            <>
              {r.recording && r.handsFree ? plainButton('stop.fill', 'regular') : null}
              {cancelButton}
            </>
          ) : null}
        </div>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}} aria-hidden>
        <defs>
          {/* LinearGradient(topLeading → bottomTrailing) in user space, like SwiftUI's unit points. */}
          <linearGradient id={`notch-edge-${phase}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={W} y2={H}>
            <stop offset="0" stopColor={r.accent} stopOpacity={edgeIntensity} />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.07} />
            <stop offset="1" stopColor={r.accent} stopOpacity={edgeIntensity * 0.6} />
          </linearGradient>
        </defs>
        {/* strokeBorder(lineWidth: 0.75): stroked inside the silhouette */}
        <path d={bottomRoundedPath(W, H, 12, 0.375)} fill="none" stroke={`url(#notch-edge-${phase})`} strokeWidth={0.75} />
        {sweep ? (
          <>
            <path d={bottomRoundedPath(W, H, 12, 1.5)} fill="none" stroke={r.accent} strokeWidth={2} strokeLinecap="round" opacity={sweep.outlineOpacity} />
            {sweep.end > sweep.start ? (
              <path
                d={bottomRoundedPath(W, H, 12, 1.5)}
                pathLength={1}
                fill="none"
                stroke={r.accent}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={`${sweep.end - sweep.start} 2`}
                strokeDashoffset={-sweep.start}
                opacity={sweep.sweepOpacity}
              />
            ) : null}
          </>
        ) : null}
      </svg>
    </div>
  );
};

/** NotchStatusView: the 380×64 message panel under the bar for showStatus (13 medium white, 2 lines, bottom radius 18). */
export const NotchStatusPanel: React.FC<{message: string}> = ({message}) => (
  <div
    style={{
      width: 380,
      height: 64,
      boxSizing: 'border-box',
      padding: '0 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      borderRadius: '0 0 18px 18px',
    }}
  >
    <span style={{...font(13, 'medium'), color: '#FFFFFF', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{message}</span>
  </div>
);

/**
 * The notch surface placed on a full screen-width strip (origin = top-left of the display), as the panel sits
 * at the top centre of the built-in display. `statusMessage` adds the NotchStatusView panel for notice/done.
 */
export const NotchIndicator: React.FC<NotchIndicatorProps & {statusMessage?: string; hidden?: boolean}> = ({statusMessage, hidden = false, ...props}) => {
  const geo = props.geometry ?? NOTCH_MBP_1512;
  const frame = notchFrame(geo);
  return (
    <div style={{position: 'relative', width: geo.screenWidth, height: geo.height + (statusMessage ? 64 : 0), pointerEvents: 'none'}}>
      {hidden ? null : (
        <>
          <div style={{position: 'absolute', left: frame.x, top: 0}}>
            <NotchIndicatorBar {...props} />
          </div>
          {statusMessage && (props.phase === 'notice' || props.phase === 'done') ? (
            <div style={{position: 'absolute', left: Math.min(Math.max(frame.midX - 190, 0), geo.screenWidth - 380), top: geo.height}}>
              <NotchStatusPanel message={statusMessage} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
