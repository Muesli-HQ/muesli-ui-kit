// MeetingListItemView.swift @ v0.8.6 — one row in the Meetings browser.
// The folder popover / delete alert are AppKit popovers and alerts and are not ported.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {radius, spacing} from '../../tokens/theme';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {StatusBadge, clamp, formatDuration, opacityOf, previewSnippet} from './parts';
import type {MeetingData} from './types';

export interface MeetingListItemProps {
  meeting: MeetingData;
  selected?: boolean;
  hovered?: boolean;
  /** The folder being browsed; the folder badge hides when it matches the meeting's folder. */
  browsedFolder?: string;
  /** `!folders.isEmpty` — the folder button only renders when folders exist. */
  hasFolders?: boolean;
  /** Delete is offered (controller.canDeleteMeeting). It is invisible until hover/focus. */
  canDelete?: boolean;
  folderButtonState?: ControlState;
  deleteButtonState?: ControlState;
}

const BULLET = '•';

/** relationshipIcon: 11 semibold accentText in a 24×24 frame. */
const RelationshipIcon: React.FC<{name: string}> = ({name}) => {
  const {colors} = useMuesliTheme();
  return (
    <span style={{width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
      <Symbol name={name} size={11} weight="semibold" color={colors.accentText} />
    </span>
  );
};

export const MeetingListItem: React.FC<MeetingListItemProps> = ({
  meeting,
  selected = false,
  hovered = false,
  browsedFolder,
  hasFolders = true,
  canDelete = true,
  folderButtonState = 'rest',
  deleteButtonState = 'rest',
}) => {
  const {colors} = useMuesliTheme();
  const m = meeting;
  const meta = `${m.startLabel}  ${BULLET}  ${formatDuration(m.durationSeconds)}`;
  const folderBadge = m.folder && m.folder !== browsedFolder ? m.folder : undefined;
  const deleteRevealed = hovered || deleteButtonState !== 'rest';
  const imported = m.source === 'imported';
  const preview = previewSnippet(m.status !== 'completed' && m.notes.trim() === '' ? m.transcript : m.notes || m.transcript);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[8],
        padding: spacing[16],
        borderRadius: radius.small,
        background: selected ? colors.accentSubtle : hovered ? colors.backgroundHover : 'transparent',
        // muesliSelectionOutline: textSecondary 1pt stroke
        boxShadow: selected ? `inset 0 0 0 1px ${colors.textSecondary}` : undefined,
      }}
    >
      <div style={{display: 'flex', alignItems: 'flex-start'}}>
        <div style={{...type.headline, color: colors.textPrimary, ...clamp(2), flex: 1, minWidth: 0}}>{m.title}</div>
        <div style={{width: 4, flex: 'none'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 6, flex: 'none'}}>
          {(m.isFollowUp || m.hasFollowUps) && (
            <div style={{display: 'flex', gap: 4}}>
              {m.isFollowUp && <RelationshipIcon name="arrow.turn.down.right" />}
              {m.hasFollowUps && <RelationshipIcon name="arrow.triangle.branch" />}
            </div>
          )}
          {hasFolders && (
            <Button kind="quiet" state={folderButtonState} style={{width: 24, height: 24}}>
              <Symbol
                name={m.folder ? 'folder.fill' : 'folder.badge.plus'}
                size={11}
                weight="regular"
                color={m.folder ? colors.accentText : hovered ? colors.textSecondary : colors.textTertiary}
              />
            </Button>
          )}
          {canDelete && (
            <div style={{opacity: deleteRevealed ? 1 : 0}}>
              <Button kind="quiet" state={deleteButtonState} style={{width: 24, height: 24}}>
                <Symbol name="trash" size={11} weight="regular" color={deleteRevealed ? colors.destructiveText : colors.textTertiary} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: spacing[4], minWidth: 0}}>
        {m.status !== 'completed' && (
          <>
            <StatusBadge status={m.status} />
            <span style={{...type.caption, color: colors.textTertiary}}>{BULLET}</span>
          </>
        )}
        <span style={{...type.caption, color: colors.textSecondary, whiteSpace: 'pre'}}>{meta}</span>
        {m.source && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              borderRadius: 9999,
              background: opacityOf(imported ? colors.accent : colors.textSecondary, 0.12),
              color: imported ? colors.accentText : colors.textSecondary,
              flex: 'none',
            }}
          >
            <Symbol name={imported ? 'square.and.arrow.down' : 'waveform'} size={10} weight="semibold" color={imported ? colors.accentText : colors.textSecondary} />
            <span style={font(10, 'semibold')}>{imported ? 'Imported' : 'Recording'}</span>
          </span>
        )}
        {folderBadge && (
          <>
            <span style={{...type.caption, color: colors.textTertiary}}>{BULLET}</span>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 2, color: colors.accentText}}>
              <Symbol name="folder" size={9} weight="regular" color={colors.accentText} />
              <span style={type.caption}>{folderBadge}</span>
            </span>
          </>
        )}
      </div>

      <div style={{...type.body, color: colors.textSecondary, ...clamp(2)}}>{preview}</div>

      {/* .overlay(alignment: .bottom) { surfaceBorder 1pt, inset 16 } */}
      <div style={{position: 'absolute', left: spacing[16], right: spacing[16], bottom: 0, height: 1, background: colors.surfaceBorder}} />
    </div>
  );
};
