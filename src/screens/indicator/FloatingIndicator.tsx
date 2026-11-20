// FloatingIndicatorController.swift @ v0.8.6 — the floating pill ("Classic" and "Minimal" styles).
// Sizes: frameForState; colours: applyGlassState / styleForState / showNotice; bars: setupWaveformBars +
// waveformTimerFired; labels: layoutLabels / applyGlassState. Default anchor is .midTrailing (right edge, mid-height).
//
// Glass: NSVisualEffectView(.hudWindow, .behindWindow, darkAqua) under a #1e1e2e tint layer. Approximated
// with backdrop blur + a dark fill. VERIFY against a capture. The panel's compositor shadow is also a guess.
import React from 'react';
import {Symbol, MuesliMark} from '../../icons/Icon';
import {font} from '../../typography';
import {systemFont} from '../settings/controls';
import {latestLevel, standingBarFrame, standingWeight} from './waveform';

export type FloatingPhase =
  | 'idle'
  | 'idleHover'
  | 'minimalIdle'
  | 'minimalHover'
  | 'preparing'
  | 'connecting'
  | 'recording'
  | 'transcribing'
  | 'warning'
  | 'success';

/** Where the Minimal style's grip sits relative to its hover pill (idleHoverPlacement for the anchor). */
export type MinimalPlacement = 'above' | 'below' | 'leading' | 'trailing';

export interface FloatingIndicatorProps {
  phase: FloatingPhase;
  /** Smoothed amplitudes (0…1, newest last); recording bars use the last value × standingWeight. */
  levels?: number[] | number;
  /** Seconds since the waiting animation began (preparing): phase = t × 5.8 + i × 0.72. */
  waitingTime?: number;
  /** config.recordingColorHex — the floating recording fill uses it raw (default "1e1e2e"). */
  recordingColorHex?: string;
  /** config.dictationHotkey.label (default "Right Option"). */
  hotkeyLabel?: string;
  /** Press-to-toggle combination shortcut: "Press …" instead of "Hold …". */
  isToggle?: boolean;
  transcribingTitle?: string;
  /** Warning/success notice text (showWarning / showSuccess). */
  message?: string;
  /** Notice icon (showWarning default "⚡"; dictation failures pass "!"). */
  noticeIcon?: string;
  minimalPlacement?: MinimalPlacement;
  /** Override the capsule size (used by FloatingIndicatorTransition while the panel frame animates); content clips. */
  size?: {w: number; h: number};
}

const hex = (h: string, a: number) => {
  const n = parseInt(h.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** NSVisualEffectView(.hudWindow) dark + tint layer. VERIFY material. */
const glass = (tintAlpha: number): React.CSSProperties => ({
  background: `linear-gradient(${hex('1e1e2e', tintAlpha)}, ${hex('1e1e2e', tintAlpha)}), rgba(28,28,30,0.55)`,
  backdropFilter: 'blur(20px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
});

/** Panel hasShadow = true (borderless window shadow). VERIFY. */
const PANEL_SHADOW = '0 3px 10px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(0,0,0,0.25)';

const Pill: React.FC<{w: number | string; h: number; minW?: number; border: string; fill: React.CSSProperties; alpha?: number; shadow?: boolean; children?: React.ReactNode; style?: React.CSSProperties; size?: {w: number; h: number}}> = ({
  w,
  h,
  minW,
  border,
  fill,
  alpha = 1,
  shadow = true,
  children,
  style,
  size,
}) => (
  <div
    style={{
      position: 'relative',
      width: size ? size.w : w,
      minWidth: size ? undefined : minW,
      height: size ? size.h : h,
      overflow: size ? 'hidden' : undefined,
      boxSizing: 'border-box',
      borderRadius: (size ? size.h : h) / 2,
      boxShadow: [`inset 0 0 0 1px ${border}`, shadow ? PANEL_SHADOW : ''].filter(Boolean).join(', '),
      opacity: alpha,
      flex: 'none',
      ...fill,
      ...style,
      ...(size ? {width: size.w, minWidth: undefined, maxWidth: undefined, height: size.h} : {}),
    }}
  >
    {children}
  </div>
);

/** Five white bars: standingBarFrame over the pill bounds. */
const Bars: React.FC<{w: number; h: number; amps: number[]; opacities: number[]}> = ({w, h, amps, opacities}) => (
  <>
    {amps.map((a, i) => {
      const f = standingBarFrame(i, amps.length, a, {x: 0, y: 0, width: w, height: h});
      return <div key={i} style={{position: 'absolute', left: f.x, top: f.y, width: f.width, height: f.height, borderRadius: f.width / 2, background: '#FFFFFF', opacity: opacities[i]}} />;
    })}
  </>
);

export const FloatingIndicator: React.FC<FloatingIndicatorProps> = ({
  phase,
  levels = 0,
  waitingTime = 0,
  recordingColorHex = '1e1e2e',
  hotkeyLabel = 'Right Option',
  isToggle = false,
  transcribingTitle = 'Transcribing',
  message = '',
  noticeIcon,
  minimalPlacement = 'leading',
  size,
}) => {
  const H = (h: number) => size?.h ?? h;
  const prompt = `${isToggle ? 'Press' : 'Hold'} ${hotkeyLabel} to dictate`;

  switch (phase) {
    case 'idle':
      // 44×28, tint 0.44, border white 0.22, panel alpha 0.90; the menu-bar mark at 14×14, centred.
      return (
        <Pill w={44} h={28} size={size} border="rgba(255,255,255,0.22)" fill={glass(0.44)} alpha={0.9}>
          <div style={{position: 'absolute', left: 15, top: (H(28) - 14) / 2}}>
            <MuesliMark color="#FFFFFF" box={14} />
          </div>
        </Pill>
      );
    case 'idleHover':
      // idleHoverPillSize: max(220, 42 + text + 22) × 36; mic 18×18 at x 14; text 11pt at x 42, white 0.75.
      return (
        <Pill w="auto" minW={220} h={36} size={size} border="rgba(255,255,255,0.14)" fill={glass(0.72)} style={{display: 'inline-flex', alignItems: 'center', padding: '0 22px 0 42px'}}>
          <div style={{position: 'absolute', left: 14, top: (H(36) - 18) / 2}}>
            <MuesliMark color="#FFFFFF" box={18} />
          </div>
          <span style={{...font(11, 'regular'), color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap'}}>{prompt}</span>
        </Pill>
      );
    case 'minimalIdle':
    case 'minimalHover':
      return <MinimalIdle hovered={phase === 'minimalHover'} prompt={prompt} placement={minimalPlacement} />;
    case 'preparing': {
      // 76×22, glass tint 0.62, waiting animation (white bars, opacity breathing).
      const amps: number[] = [];
      const ops: number[] = [];
      for (let i = 0; i < 5; i++) {
        const m = standingWeight(i, 5);
        const p = waitingTime * 5.8 + i * 0.72;
        amps.push(0.28 + (Math.sin(p) + 1) * 0.22 * m);
        ops.push(0.38 + (Math.sin(p) + 1) * 0.18);
      }
      return (
        <Pill w={76} h={22} size={size} border="rgba(255,255,255,0.16)" fill={glass(0.62)}>
          <Bars w={size?.w ?? 76} h={H(22)} amps={amps} opacities={ops} />
        </Pill>
      );
    }
    case 'connecting':
      // microphoneStartupPending: 116×22, "Connecting…" 11pt centred, no bars.
      return (
        <Pill w={116} h={22} size={size} border="rgba(255,255,255,0.16)" fill={glass(0.62)} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{...font(11, 'regular'), color: '#FFFFFF'}}>Connecting…</span>
        </Pill>
      );
    case 'recording': {
      // 76×22, glass hidden, solid recordingColorHex @ 0.85; "✕" (7pt semibold, white 0.45) at x 7; stop square 6×6 at right − 8.
      const smoothed = latestLevel(levels);
      const amps = Array.from({length: 5}, (_, i) => smoothed * standingWeight(i, 5));
      return (
        <Pill w={76} h={22} size={size} border="rgba(255,255,255,0.16)" fill={{background: hex(recordingColorHex, 0.85)}}>
          <div style={{position: 'absolute', left: 7, top: (H(22) - 10) / 2, width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', ...systemFont(7, 600), color: 'rgba(255,255,255,0.45)'}}>✕</div>
          <Bars w={size?.w ?? 76} h={H(22)} amps={amps} opacities={amps.map(() => 0.85)} />
          <div style={{position: 'absolute', right: 8, top: (H(22) - 6) / 2, width: 6, height: 6, borderRadius: 1, background: 'rgba(255,255,255,0.85)'}} />
        </Pill>
      );
    }
    case 'transcribing':
      // transcribingPillSize: max(190, 14 + 18 + 6 + text + 8 + 14) × 32; wand.and.sparkles (15pt) in 18×18 + title 11pt white 0.82.
      return (
        <Pill w="auto" minW={190} h={32} size={size} border="rgba(255,255,255,0.16)" fill={glass(0.62)} style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 14px'}}>
          <span style={{width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
            <Symbol name="wand.and.sparkles" size={15} weight="regular" color="#FFFFFF" />
          </span>
          <span style={{...font(11, 'regular'), color: 'rgba(255,255,255,0.82)', whiteSpace: 'nowrap', paddingRight: 8}}>{transcribingTitle}</span>
        </Pill>
      );
    case 'warning':
    case 'success': {
      // showNotice: 36 tall, min 180 wide, #D99A11 / #34C759 @ 0.92, border white 0.24, ink #1A140D @ 0.95.
      const icon = noticeIcon ?? (phase === 'success' ? '✓' : '⚡');
      const bg = phase === 'success' ? hex('34C759', 0.92) : hex('D99A11', 0.92);
      return (
        <Pill w="auto" minW={180} h={36} size={size} border="rgba(255,255,255,0.24)" fill={{background: bg}} style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0 18px', maxWidth: 640}}>
          <span style={{minWidth: 24, textAlign: 'center', ...systemFont(14, 700), color: 'rgba(26,20,13,0.95)'}}>{icon}</span>
          <span style={{...font(11, 'medium'), color: 'rgba(26,20,13,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{message}</span>
        </Pill>
      );
    }
  }
};

/**
 * IndicatorHoverStyle.shortcutPill ("Minimal"): a fixed canvas (pill width + 4) × 40. At rest only a grip
 * (30×8, or 8×30 at the side anchors; #696969 @ 0.82, radius 5) shows; on hover a #111111 stadium with a
 * white 0.10 border pops out from it: mic 15×15 at +14, prompt 13pt white 0.88 at +35.
 */
const MinimalIdle: React.FC<{hovered: boolean; prompt: string; placement: MinimalPlacement}> = ({hovered, prompt, placement}) => {
  // Text width is content-driven; the canvas wraps the pill (+4) so layout matches without measuring.
  const vertical = placement === 'leading' || placement === 'trailing';
  const handle: React.CSSProperties = vertical
    ? {position: 'absolute', [placement === 'leading' ? 'right' : 'left']: 2, top: 5, width: 8, height: 30, borderRadius: 5}
    : {position: 'absolute', left: '50%', marginLeft: -15, [placement === 'above' ? 'bottom' : 'top']: 2, width: 30, height: 8, borderRadius: 5};
  const pillPos: React.CSSProperties = vertical
    ? {position: 'absolute', top: 5, [placement === 'leading' ? 'right' : 'left']: 2}
    : {position: 'absolute', left: 2, [placement === 'above' ? 'bottom' : 'top']: 2};
  return (
    <div style={{position: 'relative', height: 40, display: 'inline-block'}}>
      {/* invisible sizer = pill width + 4 */}
      <div style={{visibility: 'hidden', display: 'flex', alignItems: 'center', height: 40, padding: '0 16px 0 37px', ...font(13, 'regular'), whiteSpace: 'nowrap'}}>{prompt}&nbsp;</div>
      {hovered ? (
        <div style={{...pillPos, height: 30, boxSizing: 'border-box', borderRadius: 15, background: '#111111', boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.10), ${PANEL_SHADOW}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6}}>
          <MuesliMark color="#FFFFFF" box={15} />
          <span style={{...font(13, 'regular'), color: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap', paddingRight: 4}}>{prompt}</span>
        </div>
      ) : (
        <div style={{...handle, background: hex('696969', 0.82)}} />
      )}
    </div>
  );
};
