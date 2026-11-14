// DictationRowView (DictationRowView.swift @ v0.8.6), shared by the Timeline and Dictations pages.
// Interaction (hover, copied, expanded, show-more, button states) comes in through `interaction`.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {spacing} from '../../tokens/theme';
import {font, type} from '../../typography';
import {Button} from '../../primitives/Button';
import {
  actionState,
  actionsVisible,
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
import type {DictationEntry, RowInteraction} from './types';

const ACTION_SIZE = 28;

export interface DictationRowProps {
  entry: DictationEntry;
  interaction?: RowInteraction;
  /** onDelete is optional in Swift; both pages pass it, so the trash button shows by default. */
  showsDelete?: boolean;
}

/** DictationRowView.statusColor */
const useStatusColor = () => {
  const {colors} = useMuesliTheme();
  return (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'executed':
        return colors.successText;
      case 'confirm':
      case 'needsconfirmation':
      case 'timed_out':
      case 'timedout':
        return colors.warningText;
      case 'failed':
      case 'unsupported':
        return colors.destructiveText;
      default:
        return colors.textTertiary;
    }
  };
};

/** DictationRowView.displayFinalStatus */
const displayFinalStatus = (status: string) => {
  const s = status.trim().toLowerCase();
  const map: Record<string, string> = {
    running: 'Running', interrupted: 'Interrupted', done: 'Done', timed_out: 'Timed out', timedout: 'Timed out',
    failed: 'Failed', fail: 'Failed', confirm: 'Confirm', needsconfirmation: 'Confirm', needs_confirmation: 'Confirm',
    cancelled: 'Cancelled', canceled: 'Cancelled',
  };
  return map[s] ?? status.replace(/\b\w/g, (c) => c.toUpperCase());
};

export const DictationRow: React.FC<DictationRowProps> = ({entry, interaction: r, showsDelete = true}) => {
  const {colors} = useMuesliTheme();
  const statusColor = useStatusColor();
  const isCUA = entry.source === 'cua';
  const isQuil = entry.source === 'quil';
  const iOSBadge = entry.source?.trim().toLowerCase() === 'ios' ? 'iOS' : undefined;
  const hasDetails = !!entry.trace;
  const expanded = !!r?.expanded;
  const showsFullText = !!r?.showsFullText;
  const raw = entry.text;
  const canExpandText = raw.length > 160 || (raw.match(/\n/g)?.length ?? 0) > 2;
  const displayed = !showsFullText && raw.length > 160 ? raw.slice(0, 160).trim() + '…' : raw;
  const copied = r?.copied;
  const visible = actionsVisible(r, expanded || hasDetails);

  return (
    <RowShell hovered={r?.hovered}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[20]}}>
        <TimeLabel time={entry.time} />

        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: spacing[8]}}>
          {/* HStack(alignment: .firstTextBaseline, spacing: 8) */}
          <div style={{display: 'flex', alignItems: 'baseline', gap: spacing[8], width: '100%'}}>
            {isCUA && <MonoBadge label="CUA" />}
            {isQuil && <MonoBadge label="QUILL" icon={<QuillGlyph size={10} color={colors.accentText} />} />}
            {iOSBadge && <MonoBadge label={iOSBadge} />}
            <div
              style={{
                ...type.reading,
                ...lineSpaced(15, 3),
                color: colors.textPrimary,
                flex: 1,
                minWidth: 0,
                whiteSpace: 'pre-wrap',
                ...clamp(showsFullText || !canExpandText ? undefined : 3),
              }}
            >
              {displayed}
            </div>
            {entry.trace && !isQuil && (
              <span style={{display: 'inline-flex', alignItems: 'baseline', gap: spacing[8], flex: 'none'}}>
                {/* ProgressView().controlSize(.small) while running. VERIFY native spinner look. */}
                {entry.trace.finalStatus.trim().toLowerCase() === 'running' && <Spinner color={colors.textTertiary} />}
                <span style={{...type.captionMedium, color: statusColor(entry.trace.finalStatus)}}>{displayFinalStatus(entry.trace.finalStatus)}</span>
              </span>
            )}
          </div>

          {canExpandText && (
            // .buttonStyle(.muesli(.quiet)) with .padding(.leading, -6).padding(.vertical, -6)
            <Button kind="quiet" state={actionState(r, 'showMore')} style={{margin: '-6px 0 -6px -6px', padding: '0 6px', minHeight: 28}}>
              <span style={{...type.captionMedium, color: colors.accentText}}>{showsFullText ? 'Show less' : 'Show more'}</span>
            </Button>
          )}

          {expanded && entry.trace && <TraceView entry={entry} statusColor={statusColor} />}
        </div>

        {entry.app && <TargetAppIcon app={entry.app} />}

        {/* 28pt targets; .padding(.vertical, -(28 - 14) / 2) keeps glyphs beside the first text line. */}
        <div style={{height: 14, flex: 'none', display: 'flex', alignItems: 'center', opacity: visible ? 1 : 0}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 2, height: ACTION_SIZE}}>
            {copied && <CopiedLabel text={copied === 'copyTrace' ? 'Trace copied' : 'Copied'} />}
            {hasDetails && (
              <RowActionButton symbol={expanded ? 'chevron.up' : 'chevron.down'} weight="semibold" color={colors.textTertiary} state={actionState(r, 'details')} />
            )}
            {!isQuil && entry.trace && (
              <RowActionButton
                symbol={copied === 'copyTrace' ? 'checkmark' : 'list.bullet.clipboard'}
                color={copied === 'copyTrace' ? colors.successText : colors.textTertiary}
                state={actionState(r, 'copyTrace')}
              />
            )}
            <RowActionButton
              symbol={copied === 'copy' ? 'checkmark' : 'doc.on.doc'}
              color={copied === 'copy' ? colors.successText : colors.textTertiary}
              state={actionState(r, 'copy')}
            />
            {showsDelete && <RowActionButton symbol="trash" color={colors.destructiveText} state={actionState(r, 'delete')} />}
          </div>
        </div>
      </div>
    </RowShell>
  );
};

/** computerUseTraceView: Divider @50%, events (Step n · title · status), body indented 56. */
const TraceView: React.FC<{entry: DictationEntry; statusColor: (s: string) => string}> = ({entry, statusColor}) => {
  const {colors} = useMuesliTheme();
  const isQuil = entry.source === 'quil';
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: spacing[12], paddingTop: spacing[4], width: '100%'}}>
      {/* Divider().opacity(0.5). VERIFY: native separator colour approximated with surfaceBorder. */}
      <div style={{height: 1, background: colors.surfaceBorder, opacity: 0.5}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
        {entry.trace!.events.map((ev, i) => (
          <div key={i} style={{display: 'flex', flexDirection: 'column', gap: spacing[4]}}>
            <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
              {!isQuil && (
                <span style={{...font(11, 'medium', {mono: true}), color: colors.textTertiary, width: 48, flex: 'none'}}>
                  {ev.step !== undefined ? `Step ${ev.step}` : 'Run'}
                </span>
              )}
              <span style={{...type.captionMedium, color: colors.textSecondary}}>{ev.title}</span>
              {ev.status && <span style={{...font(10, 'medium', {mono: true}), color: statusColor(ev.status)}}>{ev.status}</span>}
            </div>
            <div
              style={{
                ...font(12, 'regular', {mono: ev.kind === 'model_output' || ev.kind === 'quil_model'}),
                color: colors.textPrimary,
                paddingLeft: isQuil ? 0 : 56,
                whiteSpace: 'pre-wrap',
              }}
            >
              {ev.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Small indeterminate spinner (static frame). VERIFY against NSProgressIndicator small. */
const Spinner: React.FC<{color: string}> = ({color}) => (
  <svg width={14} height={14} viewBox="0 0 16 16" style={{flex: 'none', alignSelf: 'center'}} aria-hidden>
    {Array.from({length: 8}, (_, i) => (
      <line
        key={i}
        x1={8}
        y1={2}
        x2={8}
        y2={5}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.25 + (i / 8) * 0.75}
        transform={`rotate(${i * 45} 8 8)`}
      />
    ))}
  </svg>
);

