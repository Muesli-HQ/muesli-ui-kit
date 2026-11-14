// MeetingRecordingPlayerView + RecordingWaveformView (MeetingRecordingPlayerView.swift @ v0.8.6):
// the saved-audio strip in the meeting header — play/pause, a seekable peak waveform, and
// "m:ss / m:ss" in 12pt medium monospace. Shown by MeetingMediaView when a recording is retained.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {radius, spacing} from '../../tokens/theme';
import {monoFontStack} from '../../fonts';
import {Symbol} from '../../icons/Icon';
import {opacityOf} from './parts';

export interface RecordingPlayerProps {
  durationSeconds: number;
  currentSeconds?: number;
  playing?: boolean;
  /** Normalised 0…1 peaks; defaults to a deterministic speech-like envelope. */
  peaks?: number[];
  /**
   * Visible bars: `min(peaks.count, max(48, Int(width / 4)))`. The canvas width depends on
   * the window; 160 matches the 1120pt dashboard with the sidebar expanded.
   */
  barCount?: number;
}

/** formatTime: "m:ss", or "h:mm:ss" past an hour. */
export const formatPlayerTime = (seconds: number) => {
  const r = Math.max(Math.round(seconds), 0);
  const h = Math.floor(r / 3600);
  const m = Math.floor((r % 3600) / 60);
  const s = r % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};

/** A fixed, speech-like envelope (no randomness, so every render is identical). */
export const defaultPeaks = (n: number) =>
  Array.from({length: n}, (_, i) => {
    const x = i / n;
    const v = 0.38 + 0.26 * Math.sin(i * 0.9) * Math.sin(i * 0.23 + 1) + 0.18 * Math.sin(i * 2.7 + x * 5) + 0.12 * Math.cos(i * 0.051);
    return Math.min(1, Math.max(0.08, Math.abs(v)));
  });

export const RecordingPlayer: React.FC<RecordingPlayerProps> = ({durationSeconds, currentSeconds = 0, playing = false, peaks, barCount = 160}) => {
  const {colors} = useMuesliTheme();
  const source = peaks ?? defaultPeaks(barCount);
  const count = Math.min(source.length, barCount);
  // peakForVisibleBar: resample the source peaks into `count` bars (max of each bucket).
  const bars = Array.from({length: count}, (_, i) => {
    const start = Math.floor((i * source.length) / count);
    const end = Math.max(start + 1, Math.floor(((i + 1) * source.length) / count));
    return Math.max(...source.slice(start, end));
  });
  const progress = durationSeconds > 0 ? Math.min(1, currentSeconds / durationSeconds) : 0;
  const H = 44;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[12],
        padding: `${spacing[8]}px ${spacing[12]}px`,
        background: opacityOf(colors.backgroundRaised, 0.74),
        borderRadius: radius.medium,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          flex: 'none',
          background: colors.surfacePrimary,
          boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name={playing ? 'pause.fill' : 'play.fill'} size={13} weight="semibold" color={colors.textPrimary} />
      </div>
      <div style={{flex: 1, minWidth: 0, height: H, position: 'relative', display: 'flex', alignItems: 'center', gap: 2}}>
        {bars.map((p, i) => {
          const played = (i + 0.0001) / count <= progress;
          return (
            <div
              key={i}
              style={{flex: 1, minWidth: 1, height: Math.max(4, H * p), borderRadius: 9999, background: played ? colors.accent : opacityOf(colors.textTertiary, 0.24)}}
            />
          );
        })}
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `calc(${progress * 100}% - 1px)`, width: 2, borderRadius: 1, background: colors.accent}} />
      </div>
      <div style={{fontFamily: monoFontStack, fontSize: 12, fontWeight: 500, color: colors.textSecondary, minWidth: 88, textAlign: 'right', flex: 'none'}}>
        {`${formatPlayerTime(currentSeconds)} / ${formatPlayerTime(durationSeconds)}`}
      </div>
    </div>
  );
};
