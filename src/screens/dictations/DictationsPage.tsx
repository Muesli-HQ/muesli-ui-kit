// DictationsView (DictationsView.swift @ v0.8.6). Unlike Timeline, only the list scrolls:
// VStack(spacing: 0) { header · stats (no meetings card) · formatting card · voice-note button ·
// filter bar · [FailedDictationsView] · ScrollView of day groups | empty state }.
// Rows are DictationRowView (../timeline/DictationRow). Not ported: IPhoneBridgeCard and
// FailedDictationsView (both conditional, separate features).
import React from 'react';
import {layout, spacing} from '../../tokens/theme';
import {font} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {DictationRow} from '../timeline/DictationRow';
import {interactionFor, sliceDays} from '../timeline/TimelinePage';
import {
  AppFilterMenu,
  DashboardPageHeader,
  DateFilterMenu,
  DayHeader,
  DictationFormattingSetupCard,
  EmptyState,
  RecordOriginPicker,
  StatsHeader,
} from '../timeline/pageParts';
import type {DateFilterLabel, DayGroup, DictationEntry, ICloudState, PageStats, RecordOrigin, RowInteractions, StatId, TargetApp} from '../timeline/types';

export interface DictationsPageProps {
  days: DayGroup<DictationEntry>[];
  /** appState.filteredDictationStats (the meetings card is hidden on this page). */
  stats: PageStats;
  visibleCount?: number;
  entryStyle?: (id: string, index: number) => React.CSSProperties | undefined;
  rows?: RowInteractions;
  hoveredId?: string;
  iCloud?: ICloudState;
  iCloudButtonState?: ControlState;
  hoveredStat?: StatId;
  pressedStat?: StatId;
  showsOriginFilter?: boolean;
  origin?: RecordOrigin;
  showsAppFilter?: boolean;
  appFilter?: TargetApp;
  dateFilter?: DateFilterLabel;
  menuIndicators?: boolean;
  showsFormattingSetupCard?: boolean;
  /** Onboarding use case includes voice notes → "Record Voice Note" button row. */
  showsVoiceNoteButton?: boolean;
  voiceNoteRecording?: boolean;
  voiceNoteButtonState?: ControlState;
  /** config.dictationStartPrompt, shown in the empty state when no filter is active. */
  dictationStartPrompt?: string;
  /** List ScrollView offset in points. */
  scrollY?: number;
  /** Docked MeetingChatView safe-area inset (DashboardRootView). */
  bottomInset?: React.ReactNode;
}

/** voiceNoteButton: `.muesli(.primary)` / `.muesli(.recording)`, height 30, padding h12. */
const VoiceNoteButton: React.FC<{recording?: boolean; state?: ControlState}> = ({recording, state}) => {
  const {colors} = useMuesliTheme();
  const fg = recording ? colors.onRecordingFill : colors.onAccent;
  return (
    <Button kind={recording ? 'recording' : 'primary'} state={state} style={{height: 30, padding: '0 12px', gap: 6}}>
      <Symbol name={recording ? 'stop.fill' : 'mic.fill'} size={12} weight="semibold" color={fg} />
      <span style={{...font(12, 'semibold'), color: fg}}>{recording ? 'Stop Voice Note' : 'Record Voice Note'}</span>
    </Button>
  );
};

export const DictationsPage: React.FC<DictationsPageProps> = (p) => {
  const groups = sliceDays(p.days, p.visibleCount);
  const filtered = (p.origin && p.origin !== 'all') || (p.dateFilter && p.dateFilter !== 'All time') || !!p.appFilter;
  const emptyTitle = p.appFilter
    ? `No dictations for ${p.appFilter.name}`
    : p.origin === 'thisMac'
      ? 'No dictations from this Mac'
      : p.origin === 'fromIPhone'
        ? 'No dictations from iPhone'
        : 'No dictations yet';
  const emptyMessage = filtered ? 'Try another source, app, or time range' : (p.dictationStartPrompt ?? 'Hold Right Option to dictate');

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
      <DashboardPageHeader title="Dictations" iCloud={p.iCloud} iCloudButtonState={p.iCloudButtonState} />
      <StatsHeader stats={p.stats} showsMeetingStat={false} hovered={p.hoveredStat} pressed={p.pressedStat} />
      {p.showsFormattingSetupCard && <DictationFormattingSetupCard />}

      {p.showsVoiceNoteButton && (
        <div style={{display: 'flex', justifyContent: 'flex-end', padding: `0 ${layout.pageInset}px ${spacing[12]}px`}}>
          <VoiceNoteButton recording={p.voiceNoteRecording} state={p.voiceNoteButtonState} />
        </div>
      )}

      {/* dictationFilterBar: HStack(spacing: 12) { origin? · apps? · Spacer · date filter } */}
      <div style={{display: 'flex', alignItems: 'center', gap: spacing[12], padding: `0 ${layout.pageInset}px ${spacing[12]}px`}}>
        {p.showsOriginFilter && <RecordOriginPicker selection={p.origin ?? 'all'} />}
        {(p.showsAppFilter ?? true) && <AppFilterMenu selection={p.appFilter} indicator={p.menuIndicators} />}
        <div style={{flex: 1}} />
        <DateFilterMenu filter={p.dateFilter} indicator={p.menuIndicators} />
      </div>

      {groups.length === 0 ? (
        <EmptyState symbol="mic.badge.plus" title={emptyTitle} message={emptyMessage} style={{flex: 1}} />
      ) : (
        <div style={{flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative'}}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[20],
              padding: `0 ${layout.pageInset}px ${spacing[24]}px`,
              transform: p.scrollY ? `translateY(${-p.scrollY}px)` : undefined,
            }}
          >
            {groups.map((g) => (
              <div key={g.header} style={{display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
                <DayHeader>{g.header}</DayHeader>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  {g.entries.map(({entry, index}) => (
                    <div key={entry.id} style={p.entryStyle?.(entry.id, index)}>
                      <DictationRow entry={entry} interaction={interactionFor(p.rows, p.hoveredId, entry.id)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {p.bottomInset}
    </div>
  );
};
