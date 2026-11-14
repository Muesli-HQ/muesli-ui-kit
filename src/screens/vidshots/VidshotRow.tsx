// TimelineVidshotRow (TimelineView.swift @ v0.8.6) and TimelineRowActionButton (DictationRowView.swift).
// HStack(.top, 20) { time 80pt mono 13 medium tertiary (top 2) | VStack(8) {
//   header HStack(8) { VidshotIcon 14 accentText, "Vidshot" 14 semibold, appName callout secondary,
//                      duration caption tertiary, Spacer, hover actions (copy / trash) }
//   inline player (480 max × 220, radius 6) when playing
//   HStack(.top, 12) { 120×68 thumbnail on backgroundRaised r6 (+ play.circle.fill 27 white, shadow 3),
//                      transcript callout secondary lineLimit 4 } } }
// .padding(h 20, v 16), hover backgroundHover, radius 6, 1pt surfaceBorder divider inset 20.
// Kept self-contained (instead of importing ../timeline) so the two ports can evolve independently.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {radius, spacing} from '../../tokens/theme';
import {font, type} from '../../typography';
import {Symbol, VidshotIcon} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {NativeVideoPlayer} from './native';
import {formatDurationMs, rowAppLabel, type VidshotRecord} from './model';

/** SwiftUI natural line height for Nunito Sans (hhea ascent + descent). */
const NUNITO_LINE = 1.364;

/** TimelineRowActionButton: `.muesli(.quiet)`, 28×28, `.system(size: 12)` symbol. */
export const RowActionButton: React.FC<{symbol: string; color: string; state?: ControlState}> = ({symbol, color, state = 'rest'}) => (
  <Button kind="quiet" state={state} style={{width: 28, height: 28}}>
    <Symbol name={symbol} size={12} weight="regular" color={color} />
  </Button>
);

export interface VidshotRowProps {
  record: VidshotRecord;
  hovered?: boolean;
  /** Shows "Copied" + checkmark (1.6s after a copy in the app). */
  copyConfirmed?: boolean;
  /** Hovered/pressed state of a row action. */
  actionState?: {action: 'copy' | 'delete'; state: ControlState};
  /** Inline AVPlayer replaces the thumbnail after the play button is clicked. */
  playing?: boolean;
  /** Custom thumbnail/poster content (otherwise record.previewSrc, otherwise the `video` glyph). */
  preview?: React.ReactNode;
  playerProgress?: number;
}

export const VidshotRow: React.FC<VidshotRowProps> = ({record, hovered, copyConfirmed, actionState, playing, preview, playerProgress}) => {
  const {colors} = useMuesliTheme();
  const appName = rowAppLabel(record.title);
  const busy = record.state === 'recording' || record.state === 'processing';
  const transcript = record.transcript?.trim() || (busy ? 'Processing…' : 'No transcript available');
  const thumb =
    preview ?? (record.previewSrc ? <img src={record.previewSrc} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} /> : null);
  const actionsVisible = hovered || copyConfirmed || !!actionState;
  return (
    <div
      style={{
        position: 'relative',
        padding: `${spacing[16]}px ${spacing[20]}px`,
        borderRadius: radius.small,
        background: hovered ? colors.backgroundHover : 'transparent',
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing[20],
      }}
    >
      <div style={{...font(13, 'medium', {mono: true}), color: colors.textTertiary, width: 80, flex: 'none', paddingTop: 2, whiteSpace: 'nowrap'}}>
        {record.createdAt.time}
      </div>
      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
        <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], minWidth: 0}}>
            <VidshotIcon color={colors.accentText} size={14} />
            <span style={{...font(14, 'semibold'), color: colors.textPrimary, flex: 'none'}}>Vidshot</span>
            {appName ? (
              <span style={{...type.callout, color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{appName}</span>
            ) : null}
            <span style={{...type.caption, color: colors.textTertiary, flex: 'none'}}>{formatDurationMs(record.durationMs)}</span>
          </div>
          <div style={{flex: 1}} />
          <div style={{display: 'flex', alignItems: 'center', gap: 2, opacity: actionsVisible ? 1 : 0}}>
            {copyConfirmed ? <span style={{...type.captionMedium, color: colors.successText, paddingRight: 4}}>Copied</span> : null}
            <RowActionButton
              symbol={copyConfirmed ? 'checkmark' : 'doc.on.doc'}
              color={copyConfirmed ? colors.successText : colors.textTertiary}
              state={busy ? 'disabled' : actionState?.action === 'copy' ? actionState.state : 'rest'}
            />
            <RowActionButton symbol="trash" color={colors.destructiveText} state={busy ? 'disabled' : actionState?.action === 'delete' ? actionState.state : 'rest'} />
          </div>
        </div>
        {playing ? <NativeVideoPlayer height={220} maxWidth={480} radius={radius.small} posterSrc={record.previewSrc} poster={preview} controlsVisible progress={playerProgress} /> : null}
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 12}}>
          {playing ? null : (
            <div style={{position: 'relative', width: 120, height: 68, flex: 'none'}}>
              <div
                style={{
                  width: 120,
                  height: 68,
                  background: colors.backgroundRaised,
                  borderRadius: radius.small,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* No preview: Image(systemName: "video") inheriting the dashboard's body font (14). */}
                {thumb ?? <Symbol name="video" size={14} weight="regular" color={colors.textTertiary} />}
              </div>
              {record.hasVideo ? (
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Symbol name="play.circle.fill" size={27} weight="regular" color="#FFFFFF" style={{filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.33))'}} />
                </div>
              ) : null}
            </div>
          )}
          <div
            style={{
              ...type.callout,
              lineHeight: NUNITO_LINE,
              color: colors.textSecondary,
              flex: 1,
              minWidth: 0,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {transcript}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: spacing[20], right: spacing[20], bottom: 0, height: 1, background: colors.surfaceBorder}} />
    </div>
  );
};
