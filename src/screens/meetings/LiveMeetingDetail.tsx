// The in-progress meeting (status .recording) in MeetingDetailView.swift @ v0.8.6, wide dashboard layout:
//  standardHeader › back link, meetingIdentity (title + start time only while in progress) and
//  recordingControlGroup (recordingStatus timer, RecordingPauseButton, Stop (.recording), discard ✕),
//  recordingContextRow (Template menu + "Details" popover — folder, people and, while the screen isn't being
//  recorded, "Record Screen…"), recordingModePicker (Notes / Live underline tabs), MeetingMediaView
//  (showsStartControl: false), then content: the manual-notes editor (MarkdownRichTextEditor) or
//  LiveTranscriptSection › LiveTranscriptView (LiveTranscriptView.swift: newest-first bubbles + Copy).
// Not ported: meeting preparation state, audio warning banner, template menu contents, editor formatting
// toolbar (selection-only), "New messages" follow button.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {layout, radius, spacing} from '../../tokens/theme';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {RecordingPauseButton} from '../time-turner/TimeTurnerPage';
import {NativeButton, type NativeState} from '../time-turner/native';
import {NativePopover} from '../chat/popovers';
import {NativeDivider, oneLine, opacityOf} from './parts';
import {parseTranscript, type TranscriptMessage} from './MeetingTranscript';
import {formatPlayerTime} from './RecordingPlayer';
import {MeetingMedia, type MeetingMediaProps} from './MeetingMedia';
import type {MeetingData} from './types';

export interface LiveMeetingDetailProps {
  meeting: MeetingData;
  /** Seconds since the meeting started (`Text(startedAt, style: .timer)`). */
  elapsedSeconds: number;
  /** appState.isMeetingRecordingPaused */
  paused?: boolean;
  /** recordingMode: Notes (default) or Live. */
  mode?: 'notes' | 'live';
  /** MeetingTemplateSnapshot.name, "Template: <name>". */
  templateName?: string;
  /** The media block (MeetingMediaView): pass `screen` to show the screen-recording row. */
  media?: Omit<MeetingMediaProps, 'isActive' | 'showsStartControl'>;
  /** Details popover open; `recordScreenState` styles its Record Screen… button. */
  detailsOpen?: boolean;
  recordScreenState?: NativeState;
  /** Live transcript: committed "[HH:mm:ss] Speaker: text" lines and provisional tails. */
  liveTranscript?: string;
  partialYou?: string;
  partialOthers?: string;
  /** Manual notes typed so far (Notes mode). */
  manualNotes?: string;
  backLabel?: string | null;
  backState?: ControlState;
  pauseState?: ControlState;
  stopState?: ControlState;
}

/** LiveTranscriptBubble (LiveTranscriptView.swift). The hover-only copy button keeps its 18pt slot. */
const LiveBubble: React.FC<{speaker?: string; timestamp?: string; text: string; isUser: boolean; isPartial: boolean}> = ({speaker, timestamp, text, isUser, isPartial}) => {
  const {colors} = useMuesliTheme();
  const bg = isPartial ? (isUser ? opacityOf(colors.accent, 0.06) : opacityOf(colors.surfacePrimary, 0.5)) : isUser ? opacityOf(colors.accent, 0.15) : colors.surfacePrimary;
  const border = isPartial ? colors.surfaceBorder : isUser ? opacityOf(colors.accent, 0.2) : colors.surfaceBorder;
  const bubble = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 10px',
        background: bg,
        borderRadius: radius.small,
        // strokeBorder(…, dash: [4, 3]) for partials. CSS dashes are close, not exact. VERIFY dash rhythm.
        border: `1px ${isPartial ? 'dashed' : 'solid'} ${border}`,
        minWidth: 0,
      }}
    >
      {speaker ? <span style={{...font(10, 'medium'), color: colors.textTertiary}}>{speaker + (timestamp ? `  ${timestamp}` : '')}</span> : null}
      <span style={{...font(13, 'regular', {italic: isPartial}), color: isPartial ? colors.textSecondary : colors.textPrimary, whiteSpace: 'pre-wrap'}}>{text}</span>
    </div>
  );
  const slot = <span style={{width: 18, flex: 'none'}} />;
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 6, justifyContent: isUser ? 'flex-end' : 'flex-start', paddingLeft: isUser ? 40 + 6 : 0, paddingRight: isUser ? 0 : 40 + 6}}>
      {isUser ? slot : null}
      {bubble}
      {isUser ? null : slot}
    </div>
  );
};

/** LiveTranscriptView: newest-first feed (spacing 6, padding 16 / top 44 / bottom 8) with the Copy button top-trailing. */
export const LiveTranscript: React.FC<{transcript: string; partialYou?: string; partialOthers?: string}> = ({transcript, partialYou = '', partialOthers = ''}) => {
  const {colors} = useMuesliTheme();
  const messages: TranscriptMessage[] = parseTranscript(transcript);
  const pY = partialYou.trim();
  const pO = partialOthers.trim();
  const empty = messages.length === 0 && !pY && !pO;
  return (
    <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6, padding: `44px ${spacing[16]}px ${spacing[8]}px`}}>
        {empty ? (
          <span style={{...type.body, color: colors.textTertiary, paddingTop: spacing[8]}}>Waiting for speech…</span>
        ) : (
          <>
            {pO ? <LiveBubble speaker="Others" text={pO} isUser={false} isPartial /> : null}
            {pY ? <LiveBubble speaker="You" text={pY} isUser isPartial /> : null}
            {[...messages].reverse().map((m) => (
              <LiveBubble key={m.id} speaker={m.speaker} timestamp={m.timestamp} text={m.text} isUser={m.isUser} isPartial={false} />
            ))}
          </>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          top: spacing[8],
          right: spacing[16],
          height: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: `0 ${spacing[12]}px`,
          background: colors.surfacePrimary,
          borderRadius: radius.small,
          boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
          color: colors.textPrimary,
          opacity: empty ? 0.45 : 1,
        }}
      >
        <Symbol name="doc.on.doc" size={11} weight="semibold" color={colors.textPrimary} />
        <span style={font(12, 'semibold')}>Copy</span>
      </div>
    </div>
  );
};

const CONTEXT_CONTROL_HEIGHT = 28; // MeetingHeaderLayout.contextControlHeight

/** folderPill + MeetingParticipantsView, as in MeetingDetail's context strip. */
const FolderPill: React.FC<{folder?: string}> = ({folder}) => {
  const {colors} = useMuesliTheme();
  return (
    <Button kind={folder ? 'tinted' : 'secondary'}>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: `0 ${spacing[8]}px`, height: CONTEXT_CONTROL_HEIGHT}}>
        <Symbol name={folder ? 'folder.fill' : 'folder.badge.plus'} size={10} weight="regular" color={folder ? colors.accentText : colors.textPrimary} />
        <span style={{...font(11, 'medium'), ...oneLine}}>{folder ?? 'Add to folder'}</span>
      </span>
    </Button>
  );
};
const PeopleChip: React.FC<{participants: string[]}> = ({participants}) => {
  const {colors} = useMuesliTheme();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 10px',
        height: CONTEXT_CONTROL_HEIGHT,
        maxWidth: 220,
        boxSizing: 'border-box',
        background: colors.backgroundRaised,
        borderRadius: radius.small,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
        color: colors.textSecondary,
        ...type.caption,
      }}
    >
      <Symbol name={participants.length ? 'person.2.fill' : 'person.2'} size={12} weight="regular" color={colors.textSecondary} />
      <span style={oneLine}>{participants[0] ?? 'Add people'}</span>
      {participants.length > 1 && <span style={{color: colors.textTertiary, flex: 'none'}}>{`+${participants.length - 1}`}</span>}
    </span>
  );
};

export const LiveMeetingDetail: React.FC<LiveMeetingDetailProps> = ({
  meeting: m,
  elapsedSeconds,
  paused = false,
  mode = 'notes',
  templateName = 'Auto',
  media,
  detailsOpen = false,
  recordScreenState,
  liveTranscript = '',
  partialYou,
  partialOthers,
  manualNotes = '',
  backLabel = 'Back to Meetings',
  backState = 'rest',
  pauseState,
  stopState,
}) => {
  const {colors, isDark} = useMuesliTheme();
  const screenRecording = media?.screen?.kind === 'recording';
  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: colors.backgroundBase, overflow: 'hidden', isolation: 'isolate'}}>
      {/* standardHeader: maxWidth 980, padding 32 × 16, VStack(spacing 16) */}
      <div style={{display: 'flex', justifyContent: 'center', flex: 'none'}}>
        <div style={{width: '100%', maxWidth: 980 + layout.pageInset * 2, boxSizing: 'border-box', padding: `16px ${layout.pageInset}px`, display: 'flex', flexDirection: 'column', gap: spacing[16]}}>
          {backLabel !== null && (
            <div style={{display: 'flex'}}>
              <Button kind="quiet" state={backState}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 6px', minHeight: 28, color: colors.textSecondary}}>
                  <Symbol name="chevron.left" size={11} weight="semibold" color={colors.textSecondary} />
                  <span style={type.callout}>{backLabel}</span>
                </span>
              </Button>
            </div>
          )}

          {/* responsiveTitleAndActions (wide) */}
          <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[24]}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: spacing[8], minWidth: 260, flex: 1}}>
              <div style={{...font(30, 'bold'), color: colors.textPrimary, padding: '4px 0', ...oneLine}}>{m.title || 'Meeting Title'}</div>
              {/* in progress: start time only (no duration / word count) */}
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, color: colors.textSecondary}}>
                <Symbol name="calendar" size={10} weight="medium" color={colors.textSecondary} />
                <span style={type.callout}>{m.startLabel}</span>
              </span>
            </div>
            {/* recordingControlGroup: HStack(spacing 8) */}
            <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], flex: 'none'}}>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, ...font(12), color: colors.textSecondary, fontVariantNumeric: 'tabular-nums'}}>
                <span style={{width: 7, height: 7, borderRadius: '50%', background: paused ? colors.transcribing : colors.recording}} />
                {paused ? 'Paused' : formatPlayerTime(elapsedSeconds)}
              </span>
              <RecordingPauseButton paused={paused} state={pauseState} />
              <Button kind="recording" state={stopState}>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', whiteSpace: 'nowrap', color: colors.onRecordingFill}}>
                  <Symbol name="stop.fill" size={10} weight="semibold" color={colors.onRecordingFill} />
                  <span style={font(12, 'semibold')}>Stop</span>
                </div>
              </Button>
              <span style={{width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                <Symbol name="xmark" size={13} weight="medium" color={colors.textSecondary} />
              </span>
            </div>
          </div>

          {/* recordingContextRow: HStack(spacing 16) { Template menu ; Details ; Spacer } */}
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[16], position: 'relative'}}>
            {/* Menu with the default (pull-down) style. VERIFY macOS 26 look. */}
            <NativeButton style={{gap: 6, padding: '0 8px 0 10px', height: 24}}>
              <span style={oneLine}>{`Template: ${templateName}`}</span>
              <Symbol name="chevron.down" size={8} weight="semibold" color={colors.textPrimary} />
            </NativeButton>
            <span style={{position: 'relative', display: 'inline-flex'}}>
              <Button kind="quiet" state={detailsOpen ? 'highlighted' : 'rest'}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 6px', minHeight: 28, color: colors.textSecondary, ...type.body}}>
                  <span>Details</span>
                  <Symbol name="chevron.down" size={9} weight="regular" color={colors.textSecondary} />
                </span>
              </Button>
              {detailsOpen ? (
                <div style={{position: 'absolute', top: 36, left: '50%', transform: 'translateX(-140px)', zIndex: 5}}>
                  <NativePopover width={280} arrow="top">
                    <div style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, ...type.body, color: colors.textPrimary}}>
                      <FolderPill folder={m.folder} />
                      <PeopleChip participants={m.participants} />
                      {!screenRecording ? (
                        <>
                          <NativeDivider />
                          <NativeButton state={recordScreenState}>
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                              <Symbol name="record.circle" size={14} weight="regular" color={colors.textPrimary} />
                              Record Screen…
                            </span>
                          </NativeButton>
                        </>
                      ) : null}
                    </div>
                  </NativePopover>
                </div>
              ) : null}
            </span>
          </div>

          {/* recordingModePicker: HStack(spacing 24) of underline tabs, Divider below */}
          <div style={{display: 'flex', gap: 24, position: 'relative'}}>
            {(['notes', 'live'] as const).map((k) => (
              <span key={k} style={{position: 'relative', padding: '8px 0', ...type.body, color: mode === k ? colors.textPrimary : colors.textSecondary, zIndex: 1}}>
                {k === 'notes' ? 'Notes' : 'Live'}
                {mode === k ? <span style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: colors.accent}} /> : null}
              </span>
            ))}
            <div style={{position: 'absolute', left: 0, right: 0, bottom: -1}}>
              <NativeDivider />
            </div>
          </div>

          {media ? <MeetingMedia isActive showsStartControl={false} {...media} /> : null}
        </div>
      </div>

      <div style={{height: 1, background: colors.surfaceBorder, flex: 'none'}} />

      <div style={{flex: 1, minHeight: 0, position: 'relative'}}>
        {mode === 'live' ? (
          <LiveTranscript transcript={liveTranscript} partialYou={partialYou} partialOthers={partialOthers} />
        ) : (
          // padding(.horizontal, 40).padding(.top, 12).padding(.bottom, 24); editor maxWidth 980, cornerSmall + surfaceBorder
          <div style={{height: '100%', boxSizing: 'border-box', padding: '12px 40px 24px', display: 'flex', justifyContent: 'center'}}>
            <div style={{flex: 1, maxWidth: 980, position: 'relative', borderRadius: radius.small, boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`, background: colors.backgroundBase}}>
              {/* NSTextView: textContainerInset 34 × 30, body font AppFonts 16; placeholder in placeholderTextColor (VERIFY alpha) */}
              <div style={{padding: '30px 39px', ...font(16), color: manualNotes ? colors.textPrimary : isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', whiteSpace: 'pre-wrap'}}>
                {manualNotes || 'Write notes here...'}
              </div>
              {/* Format notes menu (textformat, borderless) in a backgroundRaised 8pt box, padding 6 / 6 */}
              <div style={{position: 'absolute', top: 6, right: 6, padding: 6, borderRadius: 8, background: colors.backgroundRaised, display: 'flex', alignItems: 'center', gap: 3}}>
                <Symbol name="textformat" size={14} weight="regular" color={colors.accent} />
                <Symbol name="chevron.down" size={6.5} weight="semibold" color={colors.accent} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
