// FeedbackCapturePillView.swift + FeedbackCapturePillState.swift @ v0.8.6: the Vidshot recording
// control pill. Hosted either in a floating NSPanel (FloatingIndicatorController.showFeedbackCapture,
// hasShadow = true, centered on the indicator / 40pt above visibleFrame.minY) or under the notch
// (NotchIndicatorController.showFeedbackCapture, hasShadow = false, 4pt below the notch geometry).
// Waveform: NotchWaveform(scrolling: false) → 7 standing bars, IndicatorWaveformDynamics.swift.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {Symbol, VidshotIcon} from '../../icons/Icon';
import {font} from '../../typography';
import {NativeSpinner} from './native';
import {pillTitle, standingWeight, type VidshotPillState} from './model';

/** RecordingIndicatorPalette.accent(hex: "FF3B30") */
const WAVE_ACCENT = '#FF3B30';

export interface PillWaveformProps {
  /** Smoothed microphone amplitude 0..1 (NotchWaveformLevel). Each bar = level × standingWeight. */
  level?: number;
  /** Per-bar amplitudes (7 values, 0..1). Overrides `level`. */
  levels?: number[];
  width?: number;
  height?: number;
}

/** NotchWaveformView, non-scrolling: 7 standing bars, 3pt wide/3pt gap scaled to fit, 3 + 11·amp tall. */
export const PillWaveform: React.FC<PillWaveformProps> = ({level = 0, levels, width = 36, height = 18}) => {
  const count = 7;
  const naturalWidth = count * 6 - 3;
  const scale = Math.min(1, Math.max(0, width) / naturalWidth);
  const barW = 3 * scale;
  const gap = 3 * scale;
  const total = count * barW + (count - 1) * gap;
  return (
    <div style={{position: 'relative', width, height, flex: 'none', overflow: 'hidden'}} aria-label="Microphone level">
      {Array.from({length: count}, (_, i) => {
        const raw = levels ? (levels[i] ?? 0) : level * standingWeight(i, count);
        const amp = Math.max(0, Math.min(1, raw));
        const h = Math.min(height, 3 + 11 * amp);
        const r = Math.min(barW, h) / 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: width / 2 - total / 2 + i * (barW + gap),
              top: height / 2 - h / 2,
              width: barW,
              height: h,
              borderRadius: r,
              background: WAVE_ACCENT,
              // CALayer shadowRadius 3, shadowOpacity amplitude × 0.2, accent-coloured glow.
              boxShadow: amp > 0 ? `0 0 3px rgba(255,59,48,${amp * 0.2})` : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

export interface VidshotPillProps extends Pick<PillWaveformProps, 'level' | 'levels'> {
  state: VidshotPillState;
  /** `copy == nil` disables Copy in the completion states. Default true (copy available). */
  copyAvailable?: boolean;
  /** Spinner rotation for preparing/processing, 0..1. */
  spinnerPhase?: number;
  /** Which plain button (if any) is shown pressed. */
  pressed?: 'cancel' | 'finish' | 'copy' | 'open' | 'openSettings';
  /** floating = NSPanel with window shadow; notch = no shadow. */
  presentation?: 'floating' | 'notch';
}

/** One `Button(...).buttonStyle(.plain)` in white 12pt medium. VERIFY pressed/disabled dimming. */
const PlainText: React.FC<{children: React.ReactNode; disabled?: boolean; pressed?: boolean}> = ({children, disabled, pressed}) => (
  <span style={{opacity: disabled ? 0.4 : pressed ? 0.6 : 1, whiteSpace: 'nowrap', flex: 'none'}}>{children}</span>
);

export const VidshotPill: React.FC<VidshotPillProps> = ({state, level, levels, copyAvailable = true, spinnerPhase = 0, pressed, presentation = 'floating'}) => {
  const {isDark} = useMuesliTheme();
  // Circle().fill(.red) / Rectangle().fill(.red): SwiftUI red adapts to appearance.
  const red = isDark ? '#FF453A' : '#FF3B30';
  const isRecording = state.kind === 'recording';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: '#000000',
        borderRadius: 9999,
        color: '#FFFFFF',
        ...font(12, 'medium'),
        whiteSpace: 'nowrap',
        flex: 'none',
        // NSPanel.hasShadow for the floating presentation. VERIFY window shadow strength.
        boxShadow: presentation === 'floating' ? '0 6px 20px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.12)' : undefined,
      }}
    >
      {isRecording ? (
        <span style={{width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', opacity: pressed === 'cancel' ? 0.6 : 1}} aria-label="Cancel Vidshot">
          <Symbol name="xmark" size={9} weight="semibold" color="#FFFFFF" />
        </span>
      ) : null}
      <VidshotIcon color="#FFFFFF" size={14} />
      {state.kind === 'preparing' || state.kind === 'processing' ? <NativeSpinner phase={spinnerPhase} /> : null}
      {state.kind === 'recording' ? (
        <>
          <span style={{width: 7, height: 7, borderRadius: '50%', background: red, flex: 'none'}} />
          {state.deadMicrophone ? (
            <span style={{width: 32, height: 2, background: red, flex: 'none'}} aria-label="No microphone samples" />
          ) : (
            <PillWaveform level={level} levels={levels} />
          )}
        </>
      ) : null}
      <span style={{fontVariantNumeric: 'normal'}}>{pillTitle(state)}</span>
      {state.kind === 'recording' ? <PlainText pressed={pressed === 'finish'}>Finish</PlainText> : null}
      {state.kind === 'blocked' ? <PlainText pressed={pressed === 'openSettings'}>Open Settings</PlainText> : null}
      {state.kind === 'readyToCopy' || state.kind === 'ready' || state.kind === 'recovered' || state.kind === 'copied' ? (
        <>
          <PlainText disabled={!copyAvailable} pressed={pressed === 'copy'}>Copy</PlainText>
          <PlainText pressed={pressed === 'open'}>Open</PlainText>
        </>
      ) : null}
      {state.kind === 'failed' && state.retainedMedia ? <PlainText pressed={pressed === 'open'}>Open</PlainText> : null}
    </div>
  );
};

export interface VidshotPillOverlayProps extends VidshotPillProps {
  /** Screen (composition) size in points. */
  screenWidth: number;
  screenHeight: number;
  /** Horizontal centre of the pill. Default: screen centre (both presentations centre on midX). */
  centerX?: number;
  /**
   * Floating: distance from the screen bottom to the pill's bottom edge. The app uses the idle
   * indicator's minY, falling back to visibleFrame.minY + 40 (dock height not included here).
   */
  bottom?: number;
  /** Notch: top of the pill = notch bottom + 4. Default 37 + 4 (menu bar/notch height VERIFY). */
  top?: number;
}

/** The pill placed on a transparent full-screen layer, for compositing over a desktop scene. */
export const VidshotPillOverlay: React.FC<VidshotPillOverlayProps> = ({screenWidth, screenHeight, centerX, bottom = 40, top = 41, ...pill}) => {
  const notch = pill.presentation === 'notch';
  return (
    <div style={{position: 'relative', width: screenWidth, height: screenHeight, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: centerX ?? screenWidth / 2,
          ...(notch ? {top} : {bottom}),
          transform: 'translateX(-50%)',
          display: 'flex',
        }}
      >
        <VidshotPill {...pill} />
      </div>
    </div>
  );
};
