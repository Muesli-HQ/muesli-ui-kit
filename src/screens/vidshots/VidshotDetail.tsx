// FeedbackCaptureView.swift @ v0.8.6, as VidshotsPage shows it (onBack set → back button instead of
// the capture Picker). ScrollView { VStack(.leading, 12) { ... }.padding(24) }.font(MuesliTheme.font(14)).
// Most controls here are stock SwiftUI (bordered Buttons, segmented Picker, DisclosureGroup,
// AVPlayerView); see native.tsx for those approximations (VERIFY).
// Also usable as the standalone "Vidshot captures" window body (FeedbackCaptureWindowController,
// 760×560) with `onBackLabel` unset, which shows the capture Picker header instead.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font} from '../../typography';
import {Symbol, VidshotIcon} from '../../icons/Icon';
import {NativeButton, NativeDisclosure, NativeLabel, NativeSegmented, NativeVideoPlayer, NativeContentUnavailable, useSystemColors} from './native';
import {formatClock, formatDurationMs, type VidshotRecord} from './model';

export type VidshotCopyButton = 'Context' | 'Image' | 'Video' | 'Video + context files';

export interface VidshotDetailProps {
  record: VidshotRecord;
  /** "Vidshots" (from the page) or "Timeline". `null` → window variant with the capture Picker. */
  backLabel?: string | null;
  /** Copy result line under the buttons: "Copied" / "Copy failed". */
  copyMessage?: string;
  /** Media picker selection when both video and audio exist. */
  mode?: 'Video' | 'Audio';
  /** Player poster (custom node) — otherwise record.previewSrc. */
  poster?: React.ReactNode;
  playerHeight?: number;
  playerControlsVisible?: boolean;
  playerProgress?: number;
  framesExpanded?: boolean;
  /** Keyframe image renderer for the expanded "Frames and timestamps" list. */
  renderFrame?: (index: number) => React.ReactNode;
  /** `loading` / `activeWriter` disable the copy and delete buttons. */
  disabled?: boolean;
  /** Pressed copy button, for choreography. */
  pressedButton?: VidshotCopyButton | 'Show in Finder' | 'Delete…' | 'back';
  /** Message under the content (orange), e.g. "Missing or unreadable: …". */
  message?: string;
}

/** `Date.formatted()` uses the system text font here (inherits 14). */
export const VidshotDetail: React.FC<VidshotDetailProps> = ({
  record,
  backLabel = 'Vidshots',
  copyMessage,
  mode = 'Video',
  poster,
  playerHeight = 220,
  playerControlsVisible = false,
  playerProgress = 0,
  framesExpanded = false,
  renderFrame,
  disabled = false,
  pressedButton,
  message,
}) => {
  const {colors} = useMuesliTheme();
  const sys = useSystemColors();
  const accentText = colors.accentText;
  const copyButtons: VidshotCopyButton[] = ['Context', 'Image', 'Video', 'Video + context files'];
  const keyframes = record.keyframes ?? [];
  const marks = record.marks ?? [];
  const failures = record.failures ?? [];
  const transcript = record.transcript?.trim();
  const showVideo = record.hasVideo && (mode === 'Video' || !record.hasAudio);
  const durationSeconds = Math.floor(record.durationMs / 1000);
  return (
    <div style={{width: '100%', height: '100%', overflow: 'hidden'}}>
      <div style={{padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, ...font(14), color: colors.textPrimary}}>
        {backLabel != null ? (
          // Button { Label(backLabel, systemImage: "chevron.left").padding(.horizontal, 8).frame(minHeight: 32) }.buttonStyle(.plain)
          <div style={{display: 'flex', alignItems: 'center', minHeight: 32, padding: '0 8px', opacity: pressedButton === 'back' ? 0.6 : 1}}>
            <NativeLabel symbol="chevron.left" color={colors.textPrimary}>{backLabel}</NativeLabel>
          </div>
        ) : (
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <VidshotIcon color={accentText} size={16} />
            {/* Picker("Capture") — native pop-up button. VERIFY. */}
            <span>Capture</span>
            <NativeButton>
              {record.title} · {record.createdAt.full}
              <Symbol name="chevron.down" size={9} weight="semibold" color={colors.textSecondary} />
            </NativeButton>
          </div>
        )}
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8, alignSelf: 'stretch'}}>
          <span style={{...font(15, 'semibold')}}>{record.title}</span>
          <span style={{color: sys.secondary}}>{record.createdAt.full}</span>
          <span style={{flex: 1}} />
          <span style={{fontVariantNumeric: 'tabular-nums'}}>{formatDurationMs(record.durationMs)}</span>
        </div>
        <div style={{display: 'flex', gap: 8, flexWrap: 'nowrap'}}>
          {copyButtons.map((b) => (
            <NativeButton
              key={b}
              color={accentText}
              pressed={pressedButton === b}
              disabled={disabled || ((b === 'Video' || b === 'Video + context files') && !record.hasVideo)}
            >
              <NativeLabel symbol="doc.on.clipboard" color={accentText}>{b}</NativeLabel>
            </NativeButton>
          ))}
        </div>
        {copyMessage ? <div style={{...font(12), color: sys.secondary}}>{copyMessage}</div> : null}
        <div style={{...font(12), color: sys.secondary}}>Paste support varies by destination app.</div>
        {record.hasVideo && record.hasAudio ? <NativeSegmented options={['Video', 'Audio']} selected={mode === 'Video' ? 0 : 1} /> : null}
        {showVideo ? (
          <NativeVideoPlayer
            height={playerHeight}
            posterSrc={record.previewSrc}
            poster={poster}
            controlsVisible={playerControlsVisible}
            progress={playerProgress}
            elapsed={formatClock(durationSeconds * playerProgress)}
            remaining={`-${formatClock(durationSeconds * (1 - playerProgress))}`}
          />
        ) : record.hasAudio ? (
          // MeetingRecordingPlayerView (audio scrubber) — not ported. VERIFY if a video needs it.
          <div style={{alignSelf: 'stretch', height: 44, borderRadius: 10, background: colors.backgroundRaised}} />
        ) : (
          <div style={{alignSelf: 'stretch'}}>
            <NativeContentUnavailable
              icon={<Symbol name="video.slash" size={36} weight="regular" color={sys.quaternary} />}
              title="Media unavailable"
              description="The saved media may be missing or still recording."
            />
          </div>
        )}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, alignSelf: 'stretch'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{...font(15, 'semibold')}}>Narration</span>
            {record.hasAudio && !transcript ? <NativeButton disabled={disabled}>Retry transcription</NativeButton> : null}
          </div>
          {transcript ? (
            <div style={{...font(14), lineHeight: 1.364, alignSelf: 'stretch'}}>{transcript}</div>
          ) : (
            <div style={{color: sys.secondary}}>{record.state === 'processing' ? 'Transcribing narration…' : 'No transcript saved'}</div>
          )}
        </div>
        {keyframes.length > 0 ? (
          <NativeDisclosure title="Frames and timestamps" expanded={framesExpanded}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 220, overflow: 'hidden'}}>
              {keyframes.map((f, i) => (
                <div key={f.index} style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
                  <div style={{width: 220, flex: 'none'}}>
                    {renderFrame?.(i) ??
                      (f.imageSrc ? (
                        <img src={f.imageSrc} style={{width: 220, display: 'block'}} />
                      ) : (
                        <NativeLabel symbol="photo" color={colors.textPrimary}>Frame unavailable</NativeLabel>
                      ))}
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0}}>
                    <span style={{...font(15, 'semibold')}}>{`#${f.index} · ${formatClock(Math.floor(f.t / 1000))}`}</span>
                    <span>{f.said || 'No narration for this frame'}</span>
                  </div>
                </div>
              ))}
            </div>
          </NativeDisclosure>
        ) : null}
        {marks.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            {marks.map((m) => (
              <span key={m}>{`✎ ${m}`}</span>
            ))}
          </div>
        ) : null}
        {record.state !== 'ready' ? (
          <span style={{...font(15, 'semibold')}}>{record.state.charAt(0).toUpperCase() + record.state.slice(1)}</span>
        ) : null}
        <div style={{display: 'flex', gap: 8}}>
          <NativeButton pressed={pressedButton === 'Show in Finder'}>Show in Finder</NativeButton>
          {/* role: .destructive → red label on macOS. VERIFY. */}
          <NativeButton color={sys.red} disabled={disabled} pressed={pressedButton === 'Delete…'}>
            Delete…
          </NativeButton>
        </div>
        {!record.hasAudio && record.hasVideo ? <span style={{color: sys.secondary}}>Narration unavailable</span> : null}
        {!record.hasVideo && record.hasAudio ? <span style={{color: sys.secondary}}>Audio only · video unavailable</span> : null}
        {failures.map((f, i) => (
          <span key={i} style={{...font(12), color: sys.orange}}>{`${f.stage}: ${f.message}`}</span>
        ))}
        {message ? <span style={{color: sys.orange}}>{message}</span> : null}
      </div>
    </div>
  );
};
