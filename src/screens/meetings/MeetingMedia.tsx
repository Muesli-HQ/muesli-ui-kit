// MeetingMediaView + MeetingVideoPlayerView (MeetingMediaView.swift @ v0.8.6): the media block in the
// meeting header (MeetingDetailView.standardHeader, below the thread breadcrumb).
//  - Active meeting: "Recording screen" / "Screen paused" (record.circle, .red / .secondary) + source name +
//    "Pause screen"/"Resume screen" + "Stop screen"; or, on a finished-then-resumed meeting that shows the start
//    control, "Record Screen…" + "Screen capture starts only after confirmation". In-progress meetings pass
//    showsStartControl: false — there, Record Screen… lives in the Details popover (LiveMeetingDetail).
//  - Preparing / finalizing: small spinner + "Preparing screen recording…" / "Choose a screen to record…" /
//    "Saving screen recording…".
//  - Saved clips: Video/Audio segmented picker (only when a separate audio file is retained too), a
//    "Part N · time" picker when there are several clips, then AVPlayerView (.inline controls,
//    .resizeAspect, full-screen toggle) framed minHeight 220 / idealHeight 330 / maxHeight 400.
// Per docs/meeting-screen-recording.md, clips play individually and transcript-linked seeking is NOT
// implemented in 0.8.6: the transcript below does not follow the video.
// VStack(alignment: .leading, spacing: 12); the environment font is MuesliTheme.body() (14pt Nunito).
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {systemFontStack} from '../../fonts';
import {NativeSegmented, oneLine} from './parts';
import {NativeButton, PopUpPicker, type NativeState} from '../time-turner/native';
import {NativeSpinner, useSystemColors} from '../vidshots/native';
import {RecordingPlayer, formatPlayerTime, type RecordingPlayerProps} from './RecordingPlayer';

export type ScreenRecordingPhase =
  | {kind: 'none'}
  | {kind: 'preparing'}
  | {kind: 'awaitingConfirmation'}
  | {kind: 'finalizing'}
  /** `pausedByUser`: explicit screen pause (button reads "Resume screen"); `paused` covers meeting pause / sleep / lock too. */
  | {kind: 'recording'; sourceName: string; paused?: boolean; pausedByUser?: boolean};

export interface MeetingVideoPlayerProps {
  /** One frame of the recorded window/display, drawn at `aspect` and fitted like `.resizeAspect`. */
  frame: React.ReactNode;
  /** Width / height of the recorded source. */
  aspect?: number;
  /** `.frame(minHeight: 220, idealHeight: 330, maxHeight: 400)` — the header gives it its ideal 330 unless squeezed. VERIFY. */
  height?: number;
  currentSeconds?: number;
  durationSeconds: number;
  playing?: boolean;
  /** AVKit shows the inline controls while the pointer is over the view (and while paused). */
  controlsVisible?: boolean;
}

export interface MeetingMediaProps {
  /** controller.activeLiveMeetingRecord()?.id == meeting.id */
  isActive?: boolean;
  showsStartControl?: boolean;
  screen?: ScreenRecordingPhase;
  /** Meeting audio recording paused (disables Record Screen… / Pause screen). */
  meetingPaused?: boolean;
  /** memory.message for this meeting, in orange caption + Dismiss. */
  message?: string;
  needsScreenPermission?: boolean;
  spinnerPhase?: number;
  /** Saved clips ("Part N · h:mm AM"); index of the selected one. */
  clips?: string[];
  selectedClip?: number;
  /** A separate audio file is retained too → Video/Audio picker. */
  hasSeparateAudio?: boolean;
  mode?: 'video' | 'audio';
  video?: MeetingVideoPlayerProps;
  audio?: RecordingPlayerProps;
  buttonStates?: {pause?: NativeState; stop?: NativeState; start?: NativeState};
}

/**
 * MeetingVideoPlayerView = AVPlayerView(controlsStyle: .inline, showsFullScreenToggleButton: true,
 * videoGravity: .resizeAspect). Black view, video fitted; the inline transport bar floats at the bottom.
 * VERIFY: the macOS 26 AVKit inline bar (layout, glass material, glyph sizes) — no capture of it yet; it
 * matches the kit's Vidshots player stand-in (vidshots/native.tsx NativeVideoPlayer) plus the play/pause state.
 */
export const MeetingVideoPlayer: React.FC<MeetingVideoPlayerProps> = ({
  frame,
  aspect = 1.6,
  height = 330,
  currentSeconds = 0,
  durationSeconds,
  playing = false,
  controlsVisible = true,
}) => {
  const progress = durationSeconds > 0 ? Math.max(0, Math.min(1, currentSeconds / durationSeconds)) : 0;
  return (
    <div style={{position: 'relative', height, alignSelf: 'stretch', background: '#000', overflow: 'hidden', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{height: '100%', aspectRatio: String(aspect), maxWidth: '100%', position: 'relative'}}>{frame}</div>
      {controlsVisible ? (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 10,
            height: 30,
            borderRadius: 9999,
            background: 'rgba(40,40,40,0.72)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 12px',
            color: '#fff',
            fontFamily: systemFontStack,
            fontSize: 11,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <Symbol name={playing ? 'pause.fill' : 'play.fill'} size={13} weight="regular" color="#fff" />
          <span>{formatPlayerTime(currentSeconds)}</span>
          <div style={{flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)', position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, borderRadius: 2, background: '#fff'}} />
          </div>
          <span>{`-${formatPlayerTime(Math.max(0, durationSeconds - currentSeconds))}`}</span>
          <Symbol name="speaker.wave.2.fill" size={12} weight="regular" color="#fff" />
          <Symbol name="arrow.up.left.and.arrow.down.right" size={11} weight="regular" color="#fff" />
        </div>
      ) : null}
    </div>
  );
};

/** SwiftUI `Label(title, systemImage:)` in the 14pt environment font. */
const Label: React.FC<{symbol: string; color: string; children: React.ReactNode}> = ({symbol, color, children}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color, flex: 'none', whiteSpace: 'nowrap'}}>
    <Symbol name={symbol} size={14} weight="regular" color={color} />
    <span>{children}</span>
  </span>
);

export const MeetingMedia: React.FC<MeetingMediaProps> = ({
  isActive = false,
  showsStartControl = true,
  screen = {kind: 'none'},
  meetingPaused = false,
  message,
  needsScreenPermission = false,
  spinnerPhase = 0,
  clips = [],
  selectedClip = 0,
  hasSeparateAudio = false,
  mode = 'video',
  video,
  audio,
  buttonStates = {},
}) => {
  const {colors} = useMuesliTheme();
  const sys = useSystemColors();
  const busy = screen.kind === 'preparing' || screen.kind === 'awaitingConfirmation' || screen.kind === 'finalizing';
  const recording = screen.kind === 'recording' ? screen : null;
  const showVideo = (mode === 'video' || !hasSeparateAudio) && !!video;
  const rows: React.ReactNode[] = [];

  if (isActive && (recording || showsStartControl)) {
    rows.push(
      // HStack (default spacing 8)
      <div key="active" style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
        {recording ? (
          <>
            <Label symbol="record.circle" color={recording.paused ? sys.secondary : sys.red}>{recording.paused ? 'Screen paused' : 'Recording screen'}</Label>
            <span style={{...oneLine, color: sys.secondary}}>{recording.sourceName}</span>
            <div style={{flex: 1, minWidth: 8}} />
            <NativeButton state={meetingPaused || busy ? 'disabled' : buttonStates.pause}>{recording.pausedByUser ? 'Resume screen' : 'Pause screen'}</NativeButton>
            <NativeButton state={screen.kind === 'finalizing' ? 'disabled' : buttonStates.stop}>Stop screen</NativeButton>
          </>
        ) : (
          <>
            <NativeButton state={busy || meetingPaused ? 'disabled' : buttonStates.start}>
              <Label symbol="record.circle" color={colors.textPrimary}>Record Screen…</Label>
            </NativeButton>
            <span style={{...type.caption, color: sys.secondary}}>Screen capture starts only after confirmation</span>
          </>
        )}
      </div>,
    );
  }
  if (busy) {
    rows.push(
      <div key="busy" style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <NativeSpinner size={16} phase={spinnerPhase} />
        <span>{screen.kind === 'finalizing' ? 'Saving screen recording…' : screen.kind === 'awaitingConfirmation' ? 'Choose a screen to record…' : 'Preparing screen recording…'}</span>
      </div>,
    );
  }
  if (needsScreenPermission) rows.push(<div key="perm"><NativeButton>Review permissions</NativeButton></div>);
  if (message) {
    rows.push(
      <div key="msg" style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{...type.caption, color: sys.orange}}>{message}</span>
        <div style={{flex: 1}} />
        <NativeButton>Dismiss</NativeButton>
      </div>,
    );
  }
  if (clips.length > 0 && hasSeparateAudio) {
    rows.push(<NativeSegmented key="mode" options={['Video', 'Audio']} selected={mode === 'video' ? 0 : 1} width={180} />);
  }
  if (showVideo && video) {
    // .labelsHidden() pop-up; VERIFY width (intrinsic).
    if (clips.length > 1) rows.push(<div key="part" style={{display: 'flex'}}><PopUpPicker value={clips[selectedClip] ?? clips[0]} /></div>);
    rows.push(<MeetingVideoPlayer key="video" {...video} />);
  } else if (audio) {
    rows.push(<RecordingPlayer key="audio" {...audio} />);
  }

  if (rows.length === 0) return null;
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 12, ...type.body, color: colors.textPrimary}}>{rows}</div>;
};
