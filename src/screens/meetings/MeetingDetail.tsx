// MeetingDetailView.swift @ v0.8.6 — an opened, completed meeting in the wide dashboard
// (`standardHeader` + `content`): back link, MarqueeTitleTextField title, calendar/clock/words
// metadata, Export and "…" menus, folder pill + people + Notes/Transcript picker strip,
// thread breadcrumb, the saved-recording player (MeetingMediaView → MeetingRecordingPlayerView),
// the chat "Referenced passage" banner, then the Copy toolbar and MeetingNotesView / MeetingTranscriptView.
// Screen-video playback: pass `media={<MeetingMedia video=… />}` (MeetingMedia.tsx). The in-progress
// recording header lives in LiveMeetingDetail.tsx.
// Not ported: edit modes, sheets/alerts, the compact quick-notes layout.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {layout, radius, spacing} from '../../tokens/theme';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {BorderlessMenu, NativeDivider, NativeSegmented, formatDuration, opacityOf, oneLine} from './parts';
import {MeetingNotes, type RelatedMeeting} from './MeetingNotes';
import {MeetingTranscript} from './MeetingTranscript';
import {RecordingPlayer} from './RecordingPlayer';
import type {MeetingData} from './types';

export type MeetingDocumentMode = 'notes' | 'transcript';

export interface MeetingThreadContext {
  /** "Follow-up to: <title> · <start>" */
  predecessor?: {title: string; startLabel: string};
  count: number;
  successors?: {title: string; startLabel: string}[];
}

export interface ReferencedPassage {
  /** MeetingChatSourceKind.label: "Transcript" | "Written notes" | "Generated notes" | "Meeting title" */
  kindLabel: string;
  excerpt: string;
}

export interface MeetingDetailProps {
  meeting: MeetingData;
  mode?: MeetingDocumentMode;
  /** "Back to Meetings" (default), "Back to Chat", "Back to Time Turner". Omit `onBack` → pass null to hide. */
  backLabel?: string | null;
  backState?: ControlState;
  /** Retained recording: shows MeetingRecordingPlayerView. */
  recording?: {currentSeconds?: number; playing?: boolean; barCount?: number};
  /** Full MeetingMediaView content (e.g. `<MeetingMedia video={…} />` for a screen-recorded meeting). Replaces `recording`. */
  media?: React.ReactNode;
  thread?: MeetingThreadContext;
  /** Opened from a chat citation: the surfaceSelected "Referenced passage" banner. */
  referencedPassage?: ReferencedPassage;
  /** Notes line / transcript message tinted surfaceSelected for the cited passage. */
  highlightedLine?: number;
  highlightedMessage?: number;
  related?: RelatedMeeting[];
  /** Reveal controls for animation. */
  visibleNoteLines?: number;
  visibleTranscriptMessages?: number;
  /** Scroll offset of the notes / transcript scroll view. */
  contentScrollY?: number;
  copyState?: ControlState;
  folderState?: ControlState;
}

const CONTEXT_CONTROL_HEIGHT = 28; // MeetingHeaderLayout.contextControlHeight

/** metadataItem: HStack(spacing 5) { symbol 10 medium ; callout } in textSecondary. */
const MetadataItem: React.FC<{icon: string; text: string}> = ({icon, text}) => {
  const {colors} = useMuesliTheme();
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, color: colors.textSecondary, flex: 'none'}}>
      <Symbol name={icon} size={10} weight="medium" color={colors.textSecondary} />
      <span style={type.callout}>{text}</span>
    </span>
  );
};

/** Export menu label / Copy button: accent @ 0.18 fill, accent @ 0.35 stroke, cornerSmall, padding 12 × 7. */
const AccentOutlineButton: React.FC<{icon: string; label: string; state?: ControlState}> = ({icon, label, state = 'rest'}) => {
  const {colors} = useMuesliTheme();
  const pressed = state === 'pressed' || state === 'highlighted';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: `7px ${spacing[12]}px`,
        borderRadius: radius.small,
        background: opacityOf(colors.accent, 0.18),
        boxShadow: `inset 0 0 0 1px ${opacityOf(colors.accent, 0.35)}`,
        color: colors.textPrimary,
        // .buttonStyle(.plain) dims the label while pressed. VERIFY the system amount.
        opacity: pressed && state === 'pressed' ? 0.7 : 1,
      }}
    >
      <Symbol name={icon} size={10} weight="semibold" color={colors.textPrimary} />
      <span style={font(12, 'semibold')}>{label}</span>
    </span>
  );
};

const ThreadBreadcrumb: React.FC<{thread: MeetingThreadContext}> = ({thread}) => {
  const {colors} = useMuesliTheme();
  const link = (icon: string, text: string, key?: number) => (
    <span key={key} style={{display: 'inline-flex', alignItems: 'center', gap: 4, color: colors.accentText, minWidth: 0}}>
      <Symbol name={icon === 'up' ? 'arrow.turn.left.up' : 'arrow.turn.left.down'} size={9} weight="semibold" color={colors.accentText} />
      <span style={{...font(11, 'medium'), ...oneLine}}>{text}</span>
    </span>
  );
  const succ = thread.successors ?? [];
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      {thread.predecessor && link('up', `Follow-up to: ${thread.predecessor.title} · ${thread.predecessor.startLabel}`)}
      <span style={{...font(11, 'medium'), color: colors.textTertiary}}>{`Thread · ${thread.count} meetings`}</span>
      {succ.length === 1 && link('down', `Followed by: ${succ[0].title} · ${succ[0].startLabel}`)}
      {succ.length > 1 && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 3}}>
          <span style={{...font(11, 'medium'), color: colors.textTertiary}}>{`Follow-ups (${succ.length})`}</span>
          {succ.map((s, i) => link('down', `${s.title} · ${s.startLabel}`, i))}
        </div>
      )}
    </div>
  );
};

export const MeetingDetail: React.FC<MeetingDetailProps> = ({
  meeting,
  mode = 'notes',
  backLabel = 'Back to Meetings',
  backState = 'rest',
  recording,
  media,
  thread,
  referencedPassage,
  highlightedLine,
  highlightedMessage,
  related,
  visibleNoteLines,
  visibleTranscriptMessages,
  contentScrollY = 0,
  copyState = 'rest',
  folderState = 'rest',
}) => {
  const {colors} = useMuesliTheme();
  const m = meeting;
  const hasFolder = !!m.folder;
  const firstParticipant = m.participants[0];

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: colors.backgroundBase, overflow: 'hidden'}}>
      {/* standardHeader: maxWidth 980, padding 32 × 16, VStack(spacing 16) */}
      <div style={{display: 'flex', justifyContent: 'center', flex: 'none'}}>
        <div
          style={{
            width: '100%',
            maxWidth: 980 + layout.pageInset * 2,
            boxSizing: 'border-box',
            padding: `16px ${layout.pageInset}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[16],
          }}
        >
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

          {/* responsiveTitleAndActions (wide): HStack(alignment: .top, spacing 24) */}
          <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[24]}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: spacing[8], minWidth: 260, flex: 1}}>
              {/* MarqueeTitleTextField: 30pt bold, padding(.vertical, 4), single line */}
              <div style={{...font(30, 'bold'), color: colors.textPrimary, padding: '4px 0', ...oneLine}}>{m.title || 'Meeting Title'}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], flexWrap: 'nowrap'}}>
                <MetadataItem icon="calendar" text={m.startLabel} />
                <span style={{...type.callout, color: colors.textTertiary}}>·</span>
                <MetadataItem icon="clock" text={formatDuration(m.durationSeconds)} />
                <span style={{...type.callout, color: colors.textTertiary}}>·</span>
                <MetadataItem icon="doc.text" text={`${m.wordCount} words`} />
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], flex: 'none'}}>
              {/*
                Export and "…" are `.menuStyle(.borderlessButton)` menus. Rendered like the measured
                Meetings sort menu (BorderlessMenu: label glyphs only, in the accent tint, + chevron);
                the Swift's fill/stroke label chrome does not draw. VERIFY — no detail-view capture.
              */}
              <BorderlessMenu icon={<Symbol name="square.and.arrow.up" size={10} weight="semibold" color={colors.accent} />} text="Export" textStyle={font(12, 'semibold')} />
              <BorderlessMenu icon={<Symbol name="ellipsis" size={12} weight="semibold" color={colors.accent} />} />
            </div>
          </div>

          {/* responsiveContextControls in a surfacePrimary card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[12],
              padding: spacing[8],
              background: colors.surfacePrimary,
              borderRadius: radius.medium,
              boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: spacing[16], minWidth: 280}}>
              <Button kind={hasFolder ? 'tinted' : 'secondary'} state={folderState}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: `0 ${spacing[8]}px`, height: CONTEXT_CONTROL_HEIGHT}}>
                  <Symbol name={hasFolder ? 'folder.fill' : 'folder.badge.plus'} size={10} weight="regular" color={hasFolder ? colors.accentText : colors.textPrimary} />
                  <span style={{...font(11, 'medium'), ...oneLine}}>{m.folder ?? 'Add to folder'}</span>
                </span>
              </Button>
              <NativeDivider vertical length={20} />
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
                <Symbol name={m.participants.length ? 'person.2.fill' : 'person.2'} size={12} weight="regular" color={colors.textSecondary} />
                <span style={oneLine}>{firstParticipant ?? 'Add people'}</span>
                {m.participants.length > 1 && <span style={{color: colors.textTertiary, flex: 'none'}}>{`+${m.participants.length - 1}`}</span>}
              </span>
            </div>
            <div style={{flex: 1, minWidth: spacing[12]}} />
            <NativeSegmented options={['Notes', 'Transcript']} selected={mode === 'notes' ? 0 : 1} width={220} />
          </div>

          {thread && <ThreadBreadcrumb thread={thread} />}

          {media}
          {!media && recording && <RecordingPlayer durationSeconds={m.durationSeconds} currentSeconds={recording.currentSeconds} playing={recording.playing} barCount={recording.barCount} />}
        </div>
      </div>

      {referencedPassage && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 6, padding: 16, background: colors.surfaceSelected, flex: 'none'}}>
          {/* `.foregroundStyle(.secondary)`: system secondary label. VERIFY vs textSecondary. */}
          <span style={{...type.caption, color: colors.textSecondary}}>{`Referenced passage · ${referencedPassage.kindLabel}`}</span>
          <span style={{...type.body, color: colors.textPrimary}}>{referencedPassage.excerpt}</span>
        </div>
      )}

      {/* Divider().background(surfaceBorder) */}
      <div style={{height: 1, background: colors.surfaceBorder, flex: 'none'}} />

      {/* content: maxWidth 1080, padding 32 / top 12 / bottom 24, VStack(spacing 12) */}
      <div style={{flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            width: '100%',
            maxWidth: 1080 + layout.pageInset * 2,
            boxSizing: 'border-box',
            padding: `12px ${layout.pageInset}px 24px`,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[12],
            minHeight: 0,
          }}
        >
          <div style={{display: 'flex', justifyContent: 'flex-end', maxWidth: 980, flex: 'none'}}>
            <AccentOutlineButton icon="doc.on.doc" label="Copy" state={copyState} />
          </div>
          <div style={{flex: 1, minHeight: 0}}>
            {mode === 'notes' ? (
              <MeetingNotes markdown={m.notes} highlightedLine={highlightedLine} visibleLines={visibleNoteLines} related={related} scrollY={contentScrollY} />
            ) : (
              <MeetingTranscript transcript={m.transcript} highlightedMessage={highlightedMessage} visibleMessages={visibleTranscriptMessages} scrollY={contentScrollY} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
