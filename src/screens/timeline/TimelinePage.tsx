// TimelineView (TimelineView.swift @ v0.8.6): the whole page scrolls (ScrollView > LazyVStack(spacing: 0)):
// header · stats · formatting card · search + activity picker · filter bar · day groups.
// Everything a video animates is a prop: rows' hover/copy/expand, which entries are visible,
// search text, filters, scroll offset.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {layout, spacing} from '../../tokens/theme';
import {font, type} from '../../typography';
import type {ControlState} from '../../primitives/Button';
import {DictationRow} from './DictationRow';
import {TimelineCotypistRow, TimelineMeetingRow, TimelineQuillRow, TimelineVidshotRow} from './TimelineRows';
import {
  AppFilterMenu,
  DashboardPageHeader,
  DateFilterMenu,
  DayHeader,
  DictationFormattingSetupCard,
  EmptyState,
  PopUpPicker,
  PrivacyControl,
  RecordOriginPicker,
  SearchField,
  StatsHeader,
} from './pageParts';
import type {
  DateFilterLabel,
  DayGroup,
  ICloudState,
  PageStats,
  RecordOrigin,
  RowInteraction,
  RowInteractions,
  StatId,
  TargetApp,
  TimelineEntry,
} from './types';

export const TIMELINE_ACTIVITY_OPTIONS = ['All activity', 'Meetings', 'Dictations', 'Cotypist', 'Quill', 'Vidshots'] as const;
export type TimelineActivity = (typeof TIMELINE_ACTIVITY_OPTIONS)[number];

export interface TimelinePageProps {
  days: DayGroup[];
  stats: PageStats;
  /** Show only the first N entries (flattened, top to bottom); days with none left disappear. */
  visibleCount?: number;
  /** Per-entry wrapper style, e.g. opacity / translate for an entry sliding in. */
  entryStyle?: (id: string, index: number) => React.CSSProperties | undefined;
  /** Per-row interaction keyed by entry id. */
  rows?: RowInteractions;
  /** Shorthand for rows[id].hovered. */
  hoveredId?: string;
  search?: string;
  searchFocused?: boolean;
  /** Draws a text caret after the search text (blink it from the video). */
  searchCaret?: boolean;
  activity?: TimelineActivity;
  activityPickerState?: ControlState;
  iCloud?: ICloudState;
  iCloudButtonState?: ControlState;
  hoveredStat?: StatId;
  pressedStat?: StatId;
  /** appState.showsDeviceOriginFilter (an iPhone has synced). */
  showsOriginFilter?: boolean;
  origin?: RecordOrigin;
  /** Apps menu shows when any target application exists. Default true. */
  showsAppFilter?: boolean;
  appFilter?: TargetApp;
  privateMode?: boolean;
  dateFilter?: DateFilterLabel;
  /** AppKit's pull-down chevron on the borderless menus. Default true (measured from reference). */
  menuIndicators?: boolean;
  showsFormattingSetupCard?: boolean;
  /** Shows ProgressView("Searching…") instead of results. */
  searchPending?: boolean;
  /** ScrollView offset in points. */
  scrollY?: number;
  /** The docked MeetingChatView safe-area inset (DashboardRootView), rendered below the scroll view. */
  bottomInset?: React.ReactNode;
}

export const TimelineEntryRow: React.FC<{entry: TimelineEntry; interaction?: RowInteraction}> = ({entry, interaction}) => {
  switch (entry.kind) {
    case 'dictation':
      return <DictationRow entry={entry} interaction={interaction} />;
    case 'meeting':
      return <TimelineMeetingRow entry={entry} interaction={interaction} />;
    case 'quill':
      return <TimelineQuillRow entry={entry} interaction={interaction} />;
    case 'cotypist':
      return <TimelineCotypistRow entry={entry} interaction={interaction} />;
    case 'vidshot':
      return <TimelineVidshotRow entry={entry} interaction={interaction} />;
  }
};

/** Applies visibleCount across day groups, keeping flattened indices for entryStyle. */
export function sliceDays<E extends {id: string}>(days: DayGroup<E>[], visibleCount?: number) {
  let index = 0;
  const out: Array<{header: string; entries: Array<{entry: E; index: number}>}> = [];
  for (const day of days) {
    const entries: Array<{entry: E; index: number}> = [];
    for (const entry of day.entries) {
      if (visibleCount === undefined || index < visibleCount) entries.push({entry, index});
      index++;
    }
    if (entries.length) out.push({header: day.header, entries});
  }
  return out;
}

export const interactionFor = (rows: RowInteractions | undefined, hoveredId: string | undefined, id: string): RowInteraction | undefined => {
  const r = rows?.[id];
  return hoveredId === id ? {...r, hovered: true} : r;
};

export const TimelinePage: React.FC<TimelinePageProps> = (p) => {
  const {colors} = useMuesliTheme();
  const groups = sliceDays(p.days, p.visibleCount);
  const emptyTitle = p.appFilter
    ? `No activity for ${p.appFilter.name}`
    : p.origin === 'thisMac'
      ? 'No activity from this Mac'
      : p.origin === 'fromIPhone'
        ? 'No activity from iPhone'
        : 'No activity yet';

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
      <div style={{flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative'}}>
        <div style={{display: 'flex', flexDirection: 'column', transform: p.scrollY ? `translateY(${-p.scrollY}px)` : undefined}}>
          <DashboardPageHeader title="Timeline" iCloud={p.iCloud} iCloudButtonState={p.iCloudButtonState} />
          <StatsHeader stats={p.stats} showsMeetingStat hovered={p.hoveredStat} pressed={p.pressedStat} />
          {p.showsFormattingSetupCard && <DictationFormattingSetupCard />}

          {/* HStack { TextField; Picker.frame(width: 180) }, spacing 8 (measured). .padding(.bottom, 12): the
              measured gap from the field's fill to the segmented control is 11 — the field's frame is 1pt
              taller than its fill. */}
          <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: `0 ${layout.pageInset}px 11px`}}>
            <SearchField placeholder="Search activity…" text={p.search} focused={p.searchFocused} caret={p.searchCaret} />
            <PopUpPicker value={p.activity ?? 'All activity'} width={180} state={p.activityPickerState} />
          </div>

          {/* filterBar: the ViewThatFits HStack variant (fits at the default window width). */}
          <div style={{padding: `0 ${layout.pageInset}px ${spacing[12]}px`, display: 'flex', flexDirection: 'column', gap: 8}}>
            <div style={{display: 'flex', alignItems: 'center', gap: spacing[12]}}>
              <div style={{display: 'flex', alignItems: 'center', gap: spacing[12]}}>
                {p.showsOriginFilter && <RecordOriginPicker selection={p.origin ?? 'all'} />}
                {(p.showsAppFilter ?? true) && <AppFilterMenu selection={p.appFilter} indicator={p.menuIndicators} />}
              </div>
              <div style={{flex: 1, minWidth: 12}} />
              <PrivacyControl on={!!p.privateMode} />
              <DateFilterMenu filter={p.dateFilter} indicator={p.menuIndicators} />
            </div>
            {p.privateMode && (
              <span style={{...font(12), color: colors.textSecondary}}>
                Of new activity on this Mac, only meetings and their recordings are saved. Time Turner and Cotypist are paused.
              </span>
            )}
          </div>

          {p.searchPending ? (
            // ProgressView("Searching…").padding(). VERIFY native spinner + label layout.
            <div style={{...type.body, color: colors.textSecondary, padding: 16, textAlign: 'center'}}>Searching…</div>
          ) : groups.length === 0 ? (
            <EmptyState symbol="clock.badge.questionmark" title={emptyTitle} message="Try another search, source, app, or time range" style={{minHeight: 200}} />
          ) : null}

          <div style={{display: 'flex', flexDirection: 'column', gap: spacing[20], padding: `0 ${layout.pageInset}px ${spacing[24]}px`}}>
            {!p.searchPending &&
              groups.map((g) => (
                <div key={g.header} style={{display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
                  <DayHeader>{g.header}</DayHeader>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    {g.entries.map(({entry, index}) => (
                      <div key={entry.id} style={p.entryStyle?.(entry.id, index)}>
                        <TimelineEntryRow entry={entry} interaction={interactionFor(p.rows, p.hoveredId, entry.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {p.bottomInset}
    </div>
  );
};
