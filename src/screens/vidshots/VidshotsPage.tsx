// VidshotsPage (TimelineView.swift @ v0.8.6): the dashboard "Vidshots" tab.
// selectedVidshotID → FeedbackCaptureView(onBack:, backLabel: "Vidshots"|"Timeline") (VidshotDetail)
// otherwise ScrollView { VStack(.leading, 16) {
//   HStack(16) { "Vidshots" 26 bold textPrimary, Spacer(16), Start/Finish Vidshot .muesli(.primary) }.padding(.horizontal, pageInset)
//   empty → ContentUnavailableView("No Vidshots yet", VidshotIcon 36, "Record a window or screen region to create a Vidshot.")
//           .frame(maxWidth: .infinity, minHeight: 250)
//   else LazyVStack(0) { day header (12 semibold textSecondary, h pageInset, top 16) + TimelineVidshotRow } }
// }.padding(.top, 20)
// Rows are NOT inset by pageInset in the Swift: they span the detail column with their own 20pt padding.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {layout, spacing} from '../../tokens/theme';
import {font} from '../../typography';
import {Symbol, VidshotIcon} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {NativeContentUnavailable, useSystemColors} from './native';
import {VidshotRow, type VidshotRowProps} from './VidshotRow';
import {VidshotDetail, type VidshotDetailProps} from './VidshotDetail';
import type {VidshotRecord} from './model';

export interface VidshotsRecordButtonProps {
  /** controller.feedbackCapture.ownsMicrophone → "Finish Vidshot" with stop.fill. */
  isRecording?: boolean;
  /** Vidshot disabled in Settings (and not recording) → button disabled. */
  enabled?: boolean;
  state?: ControlState;
}

/** recordingButton: HStack(6) { symbol 11 semibold, text 12 semibold } .padding(h 12, v 8), .muesli(.primary) */
export const VidshotsRecordButton: React.FC<VidshotsRecordButtonProps> = ({isRecording = false, enabled = true, state = 'rest'}) => {
  const disabled = !enabled && !isRecording;
  return (
    <Button kind="primary" state={disabled ? 'disabled' : state} style={{padding: `8px ${spacing[12]}px`, gap: 6, flex: 'none'}}>
      <Symbol name={isRecording ? 'stop.fill' : 'plus'} size={11} weight="semibold" color="currentColor" />
      <span style={{...font(12, 'semibold'), whiteSpace: 'nowrap'}}>{isRecording ? 'Finish Vidshot' : 'Start Vidshot'}</span>
    </Button>
  );
};

export interface VidshotsPageProps {
  records: VidshotRecord[];
  recordButton?: VidshotsRecordButtonProps;
  /** Per-row interaction (hover, copy confirmation, inline playback…), keyed by record id. */
  rowProps?: Record<string, Omit<VidshotRowProps, 'record'>>;
  /** Preview renderer for rows/detail when records have no previewSrc. */
  renderPreview?: (record: VidshotRecord) => React.ReactNode;
  /** Shows the capture detail (FeedbackCaptureView) instead of the list. */
  selectedId?: string;
  detailProps?: Omit<VidshotDetailProps, 'record'>;
  /** Vertical scroll offset of the list, in points. */
  scrollY?: number;
}

export const VidshotsPage: React.FC<VidshotsPageProps> = ({records, recordButton, rowProps, renderPreview, selectedId, detailProps, scrollY = 0}) => {
  const {colors} = useMuesliTheme();
  const sys = useSystemColors();
  const selected = selectedId ? records.find((r) => r.id === selectedId) : undefined;
  if (selected) {
    return <VidshotDetail record={selected} poster={renderPreview?.(selected)} {...detailProps} />;
  }
  return (
    <div style={{width: '100%', height: '100%', overflow: 'hidden'}}>
      <div style={{paddingTop: spacing[20], display: 'flex', flexDirection: 'column', gap: spacing[16], transform: `translateY(${-scrollY}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: spacing[16], padding: `0 ${layout.pageInset}px`}}>
          <span style={{...font(26, 'bold'), color: colors.textPrimary}}>Vidshots</span>
          <span style={{flex: 1, minWidth: spacing[16]}} />
          <VidshotsRecordButton {...recordButton} />
        </div>
        {records.length === 0 ? (
          // paddingBottom 13: measured from reference — the system view sits 6.5pt above the centre of its 250pt frame.
          <div style={{minHeight: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 13, boxSizing: 'border-box'}}>
            <NativeContentUnavailable
              icon={<VidshotIcon color={sys.quaternary} size={36} />}
              title="No Vidshots yet"
              description="Record a window or screen region to create a Vidshot."
            />
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {records.map((r, i) => (
              <React.Fragment key={r.id}>
                {i === 0 || records[i - 1].createdAt.day !== r.createdAt.day ? (
                  <div style={{...font(12, 'semibold'), color: colors.textSecondary, padding: `${spacing[16]}px ${layout.pageInset}px 0`}}>{r.createdAt.day}</div>
                ) : null}
                <VidshotRow record={r} preview={renderPreview?.(r)} {...rowProps?.[r.id]} />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
