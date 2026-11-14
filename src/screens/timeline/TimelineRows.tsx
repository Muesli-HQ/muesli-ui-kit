// The non-dictation Timeline rows (TimelineView.swift @ v0.8.6):
// TimelineMeetingRow, TimelineCotypistRow, TimelineQuillRow, TimelineVidshotRow.
// (VidshotsPage in the same file is ported separately.)
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {radius, spacing, withAlpha} from '../../tokens/theme';
import {font, type} from '../../typography';
import {Symbol, VidshotIcon} from '../../icons/Icon';
import {
  actionState,
  actionsVisible,
  AIIcon,
  clamp,
  CopiedLabel,
  lineSpaced,
  MonoBadge,
  QuillGlyph,
  RowActionButton,
  RowShell,
  TargetAppIcon,
  TimeLabel,
} from './rowParts';
import type {CotypistEntry, MeetingEntry, MeetingStatus, QuillEntry, RowInteraction, VidshotEntry} from './types';

/** Applies an opacity to a hex or rgba() colour (SwiftUI `.opacity()` on a Color). */
export const tint = (color: string, a: number) => {
  if (color.startsWith('#')) return withAlpha(color, a);
  return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/, (_, r, g, b, x) => `rgba(${r},${g},${b},${Number(x) * a})`);
};

// ---------------------------------------------------------------- Meeting

/** MeetingStatusDisplay.swift */
export const MEETING_STATUS_LABEL: Record<MeetingStatus, string> = {
  recording: 'Recording',
  processing: 'Processing',
  completed: 'Completed',
  noteOnly: 'Note only',
  failed: 'Needs attention',
};

const useMeetingStatusColors = (status: MeetingStatus) => {
  const {colors: c} = useMuesliTheme();
  const fill = {recording: c.recording, processing: c.accent, completed: c.success, noteOnly: c.textTertiary, failed: c.transcribing}[status];
  const text = {recording: c.destructiveText, processing: c.accentText, completed: c.successText, noteOnly: c.textTertiary, failed: c.warningText}[status];
  return {fill, text};
};

/** TimelineMeetingRow.formatDuration */
export const formatMeetingDuration = (seconds: number) => {
  const r = Math.max(0, Math.round(seconds));
  if (r >= 3600) return `${Math.floor(r / 3600)}h ${Math.floor((r % 3600) / 60)}m`;
  if (r >= 60) {
    const m = Math.floor(r / 60);
    const s = r % 60;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
  }
  return `${r}s`;
};

export const TimelineMeetingRow: React.FC<{entry: MeetingEntry; interaction?: RowInteraction}> = ({entry, interaction: r}) => {
  const {colors} = useMuesliTheme();
  const status = useMeetingStatusColors(entry.status);
  const badge = entry.source === 'granola' ? 'Imported from Granola' : entry.source === 'ios' ? 'iOS' : 'Mac';
  return (
    <RowShell hovered={r?.hovered}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[20]}}>
        <TimeLabel time={entry.time} />
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
            <Symbol name="person.2.fill" size={11} weight="semibold" color={colors.accentText} />
            <span style={{...font(14, 'semibold'), color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0}}>
              {entry.title}
            </span>
            <span
              style={{
                ...font(10, 'semibold'),
                color: status.text,
                padding: '2px 6px',
                background: tint(status.fill, 0.12),
                borderRadius: 9999,
                flex: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {MEETING_STATUS_LABEL[entry.status]}
            </span>
            <MonoBadge label={badge} />
            <div style={{flex: 1}} />
            <span style={{...type.caption, color: colors.textTertiary, flex: 'none'}}>{formatMeetingDuration(entry.durationSeconds)}</span>
          </div>
          <div style={{...type.callout, color: colors.textSecondary, ...clamp(2)}}>{entry.preview || 'No transcript or notes yet'}</div>
        </div>
      </div>
    </RowShell>
  );
};

// ---------------------------------------------------------------- Cotypist

const COTYPIST_MAX_SHOWN = 3;

export const TimelineCotypistRow: React.FC<{entry: CotypistEntry; interaction?: RowInteraction}> = ({entry, interaction: r}) => {
  const {colors} = useMuesliTheme();
  const shown = entry.acceptances.slice(0, COTYPIST_MAX_SHOWN);
  const hidden = Math.max(entry.acceptances.length - COTYPIST_MAX_SHOWN, 0);
  return (
    <RowShell hovered={r?.hovered}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[20]}}>
        <TimeLabel time={entry.time} />
        <div style={{flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: spacing[8]}}>
          <MonoBadge label="COTYPIST" icon={<Symbol name="text.cursor" size={9} weight="bold" color={colors.accentText} />} />
          <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing[4]}}>
            {shown.map((a, i) => (
              <div key={i} style={{...type.reading, ...lineSpaced(15, 3), ...clamp(2)}}>
                <span style={{color: colors.textTertiary}}>{a.contextBefore}</span>
                <span style={{color: colors.textPrimary, fontWeight: 600}}>{a.text}</span>
              </div>
            ))}
            {hidden > 0 && <span style={{...type.caption, color: colors.textTertiary}}>+{hidden} more</span>}
          </div>
        </div>
        {entry.app && entry.app.name !== '' && <TargetAppIcon app={entry.app} />}
        <div style={{display: 'flex', gap: 2, flex: 'none', opacity: actionsVisible(r) ? 1 : 0}}>
          <RowActionButton symbol="doc.on.doc" color={colors.textTertiary} state={actionState(r, 'copy')} />
          <RowActionButton symbol="trash" color={colors.destructiveText} state={actionState(r, 'delete')} />
        </div>
      </div>
    </RowShell>
  );
};

// ---------------------------------------------------------------- Quill

/**
 * TimelineQuillRow. Collapsed: badge + first question, turn count, chevron, last answer.
 * Expanded shows every turn (AIResponse markdown), approximated here as plain body text. VERIFY.
 */
export const TimelineQuillRow: React.FC<{entry: QuillEntry; interaction?: RowInteraction}> = ({entry, interaction: r}) => {
  const {colors} = useMuesliTheme();
  const expanded = !!r?.expanded;
  const last = entry.turns[entry.turns.length - 1];
  return (
    <RowShell hovered={r?.hovered} hoverFill={false} dividerInset={0}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[20]}}>
        <TimeLabel time={entry.time} variant="caption" />
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12}}>
          {/* HStack(alignment: .firstTextBaseline) — default spacing. VERIFY: assumed 8. */}
          <div style={{display: 'flex', alignItems: 'baseline', gap: 8, color: colors.textPrimary}}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '2px 5px',
                borderRadius: 4,
                background: colors.accentSubtle,
                color: colors.accentText,
                flex: 'none',
                ...type.caption,
              }}
            >
              <QuillGlyph size={10} color={colors.accentText} />
              QUILL
            </span>
            <span style={{...type.body, flex: 1, minWidth: 0, ...clamp(2)}}>{entry.turns[0]?.question ?? 'Quill conversation'}</span>
            <span style={{...type.caption, color: colors.textTertiary, flex: 'none'}}>
              {entry.turnCount} {entry.turnCount === 1 ? 'turn' : 'turns'}
            </span>
            <span style={{alignSelf: 'center', flex: 'none'}}>
              <AIIcon name={expanded ? 'chevronUp' : 'chevronDown'} color={colors.textPrimary} />
            </span>
          </div>
          {expanded ? (
            entry.turns.map((t, i) => (
              <React.Fragment key={i}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0'}}>
                  <div style={{...type.body, color: colors.textSecondary}}>{t.question ?? 'Question transcript unavailable'}</div>
                  <div style={{...type.body, color: colors.textPrimary}}>{t.answer}</div>
                  <div style={{...type.caption, color: colors.textPrimary}}>Copy answer</div>
                </div>
                {i < entry.turns.length - 1 && <div style={{height: 1, background: colors.surfaceBorder}} />}
              </React.Fragment>
            ))
          ) : last ? (
            <div style={{...type.body, color: colors.textSecondary, ...clamp(2)}}>{last.answer}</div>
          ) : null}
        </div>
        {/* Button(action: onDelete) { AIIcon(.trash) }.buttonStyle(.plain) */}
        <AIIcon name="trash" color={colors.textPrimary} />
      </div>
    </RowShell>
  );
};

// ---------------------------------------------------------------- Vidshot

const formatVidshotDuration = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

export const TimelineVidshotRow: React.FC<{entry: VidshotEntry; interaction?: RowInteraction}> = ({entry, interaction: r}) => {
  const {colors} = useMuesliTheme();
  const busy = entry.state === 'recording' || entry.state === 'processing';
  const copied = r?.copied === 'copy';
  const hasVideo = entry.hasVideo ?? !!entry.preview;
  const transcript = entry.transcript?.trim() ? entry.transcript : busy ? 'Processing…' : 'No transcript available';
  return (
    <RowShell hovered={r?.hovered}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[20]}}>
        <TimeLabel time={entry.time} />
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
            <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], minWidth: 0}}>
              <VidshotIcon size={14} color={colors.accentText} />
              <span style={{...font(14, 'semibold'), color: colors.textPrimary, flex: 'none'}}>Vidshot</span>
              {entry.appName && (
                <span style={{...type.callout, color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{entry.appName}</span>
              )}
              <span style={{...type.caption, color: colors.textTertiary, flex: 'none'}}>{formatVidshotDuration(entry.durationMs)}</span>
            </div>
            <div style={{flex: 1}} />
            <div style={{display: 'flex', alignItems: 'center', gap: 2, flex: 'none', opacity: actionsVisible(r) ? 1 : 0}}>
              {copied && <CopiedLabel text="Copied" />}
              <RowActionButton
                symbol={copied ? 'checkmark' : 'doc.on.doc'}
                color={copied ? colors.successText : colors.textTertiary}
                state={busy ? 'disabled' : actionState(r, 'copy')}
              />
              <RowActionButton symbol="trash" color={colors.destructiveText} state={busy ? 'disabled' : actionState(r, 'delete')} />
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
            <div style={{position: 'relative', width: 120, height: 68, flex: 'none'}}>
              <div
                style={{
                  width: 120,
                  height: 68,
                  borderRadius: radius.small,
                  overflow: 'hidden',
                  background: colors.backgroundRaised,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {entry.preview ? (
                  <img src={entry.preview} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} alt="" />
                ) : (
                  // Image(systemName: "video") at the inherited body font (14pt).
                  <Symbol name="video" size={14} weight="regular" color={colors.textTertiary} />
                )}
              </div>
              {hasVideo && (
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {/* .font(.system(size: 27)).foregroundStyle(.white).shadow(radius: 3) */}
                  <Symbol name="play.circle.fill" size={27} weight="regular" color="#FFFFFF" style={{filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.33))'}} />
                </div>
              )}
            </div>
            <div style={{...type.callout, color: colors.textSecondary, flex: 1, minWidth: 0, ...clamp(4)}}>{transcript}</div>
          </div>
        </div>
      </div>
    </RowShell>
  );
};
