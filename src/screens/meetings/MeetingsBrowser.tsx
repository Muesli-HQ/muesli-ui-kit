// MeetingsView.swift @ v0.8.6 — the Meetings browser (`browserView`): page header, Meetings/People
// picker, Coming Up, the active-meeting banner, folder header with Import / Templates and
// sort / date filter, the meeting list (MeetingListItemView) or empty state, and the floating
// Quick Note button. The People directory, Granola import sheet and templates sheet are not ported.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {layout, radius, spacing} from '../../tokens/theme';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {NewBadge} from '../../primitives/NewBadge';
import {BorderlessMenu, DashboardPageHeader, NativeDivider, NativeSegmented, opacityOf, oneLine} from './parts';
import {MeetingListItem} from './MeetingListItem';
import type {MeetingData, UpcomingEventGroup} from './types';

export type MeetingBrowserSort = 'newestFirst' | 'oldestFirst';
export type MeetingBrowserFilter = 'all' | 'last2Days' | 'lastWeek' | 'last2Weeks' | 'lastMonth' | 'last3Months';

const SORT_LABEL: Record<MeetingBrowserSort, string> = {newestFirst: 'Newest first', oldestFirst: 'Oldest first'};
const FILTER_LABEL: Record<MeetingBrowserFilter, string> = {
  all: 'All time', last2Days: 'Last 2 days', lastWeek: 'Last week', last2Weeks: 'Last 2 weeks', lastMonth: 'Last month', last3Months: 'Last 3 months',
};

export interface ActiveMeetingBanner {
  title: string;
  status: 'recording' | 'paused' | 'finalizing';
}

export interface MeetingsBrowserProps {
  meetings: MeetingData[];
  /** Selected sidebar folder name; undefined = "All Meetings". */
  folder?: string;
  /** Meetings / People segmented picker. */
  showsPeople?: boolean;
  upcoming?: UpcomingEventGroup[];
  activeMeeting?: ActiveMeetingBanner;
  sort?: MeetingBrowserSort;
  filter?: MeetingBrowserFilter;
  selectedMeetingId?: number;
  hoveredMeetingId?: number;
  /** NewFeatureBadge(.granolaImport) on Import — new in 0.8.6, so shown until first use. */
  importNewBadge?: boolean;
  importState?: ControlState;
  templatesState?: ControlState;
  /** Quick Note floating button: hover swaps accent → joinAction and shows the "Quick Note" tip. */
  newMeetingHovered?: boolean;
  /** Recording or starting: the floating button is disabled (opacity 0.5). */
  newMeetingDisabled?: boolean;
  /** Vertical scroll offset of the page, in points. */
  scrollY?: number;
  /**
   * RecordOriginPicker (All / This Mac / From iPhone), shown when `appState.showsDeviceOriginFilter`
   * (iCloud sync with an iPhone). Omit to hide.
   */
  origin?: 'all' | 'thisMac' | 'fromIPhone';
  /** Extra bottom inset when the docked chat bar sits under the page (safeAreaInset). */
  bottomInset?: number;
}

// MARK: - Coming Up

const JoinActionControl: React.FC = () => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', gap: 1, borderRadius: 5, overflow: 'hidden', flex: 'none', alignSelf: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: colors.joinAction, color: colors.onJoinAction}}>
        <Symbol name="video.fill" size={9} weight="regular" color={colors.onJoinAction} />
        <span style={font(10, 'medium')}>Join &amp; Transcribe</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', padding: '0 5px', background: colors.joinActionSecondary}}>
        <Symbol name="chevron.down" size={8} weight="semibold" color={colors.onJoinAction} />
      </div>
    </div>
  );
};

const ComingUpSection: React.FC<{groups: UpcomingEventGroup[]}> = ({groups}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[16],
        padding: 20,
        background: colors.backgroundRaised,
        borderRadius: 12,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
      }}
    >
      <div style={{paddingBottom: 4}}>
        <div style={{...type.title2, color: colors.textPrimary}}>Coming Up</div>
      </div>
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 20}}>
            <div style={{width: 60, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
              <span style={{...font(24), color: g.isToday ? colors.accentText : colors.textPrimary}}>{g.dayNumber}</span>
              <span style={{...font(11, 'medium'), color: g.isToday ? colors.accentText : colors.textSecondary}}>{g.dayLabel}</span>
              <span style={{...font(10), color: colors.textSecondary}}>{g.dayOfWeek}</span>
            </div>
            <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10}}>
              {g.events.map((e, ei) => (
                <div key={ei} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <div style={{width: 3, height: 36, borderRadius: 1.5, flex: 'none', background: g.isToday ? colors.accent : opacityOf(colors.textSecondary, 0.4)}} />
                  <div style={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
                    <span style={{...font(13, 'medium'), color: colors.textPrimary, ...oneLine}}>{e.title}</span>
                    <span style={{...font(11), color: colors.textSecondary}}>{e.timeRange}</span>
                  </div>
                  <div style={{flex: 1}} />
                  {e.joinable && <JoinActionControl />}
                  {/* `.menuStyle(.borderlessButton)`: rendered like the measured sort menu (BorderlessMenu). VERIFY — not in the reference. */}
                  <BorderlessMenu text="Add to folder" textStyle={font(10, 'medium')} />
                  <Button kind="quiet" shape={{kind: 'circle'}} style={{width: 20, height: 20, flex: 'none'}}>
                    <Symbol name="xmark" size={9} weight="medium" color={colors.textSecondary} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          {gi < groups.length - 1 && <NativeDivider />}
        </React.Fragment>
      ))}
    </div>
  );
};

// MARK: - Active meeting banner

const ActiveBanner: React.FC<{meeting: ActiveMeetingBanner}> = ({meeting}) => {
  const {colors} = useMuesliTheme();
  const recording = meeting.status !== 'finalizing';
  const paused = meeting.status === 'paused';
  const dot = !recording ? colors.accent : paused ? colors.transcribing : colors.recording;
  const statusText = !recording ? 'Finalizing notes' : paused ? 'Recording paused' : 'Recording now';
  const label = (icon: string, text: string, iconSize: number, color: string) => (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: `8px ${spacing[12]}px`}}>
      <Symbol name={icon} size={iconSize} weight="semibold" color={color} />
      <span style={font(12, 'semibold')}>{text}</span>
    </span>
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[12],
        padding: spacing[12],
        background: colors.backgroundRaised,
        borderRadius: radius.large,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
        <div style={{width: 8, height: 8, borderRadius: '50%', background: dot, flex: 'none'}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
          <span style={{...font(13, 'semibold'), color: colors.textPrimary, ...oneLine}}>{meeting.title}</span>
          <span style={{...type.caption, color: colors.textSecondary}}>{statusText}</span>
        </div>
      </div>
      <div style={{flex: 1, minWidth: spacing[12]}} />
      <Button kind="secondary" bordered={false}>{label('square.and.pencil', 'Open Notes', 11, colors.textPrimary)}</Button>
      {recording && (
        <>
          <Button kind={paused ? 'primary' : 'secondary'}>{label(paused ? 'play.fill' : 'pause.fill', paused ? 'Resume' : 'Pause', 10, paused ? colors.onAccent : colors.textPrimary)}</Button>
          <Button kind="recording">{label('stop.fill', 'Stop', 10, colors.onRecordingFill)}</Button>
        </>
      )}
    </div>
  );
};

// MARK: - Browser header

const BrowserHeader: React.FC<{
  title: string;
  count: number;
  sort: MeetingBrowserSort;
  filter: MeetingBrowserFilter;
  importNewBadge: boolean;
  importState: ControlState;
  templatesState: ControlState;
  origin?: 'all' | 'thisMac' | 'fromIPhone';
}> = ({title, count, sort, filter, importNewBadge, importState, templatesState, origin}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[16]}}>
        <div style={{...type.title2, color: colors.textPrimary, flex: 1, minWidth: 0}}>{title}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], flex: 'none'}}>
          {/* Import: a Menu with a hand-styled label (surfacePrimary, 1pt border), .buttonStyle(.plain). */}
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: `8px ${spacing[12]}px`,
                background: importState === 'highlighted' || importState === 'pressed' ? colors.backgroundHover : colors.surfacePrimary,
                borderRadius: radius.small,
                boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
                color: colors.textPrimary,
              }}
            >
              <Symbol name="square.and.arrow.down" size={11} weight="semibold" color={colors.textPrimary} />
              <span style={font(12, 'semibold')}>Import</span>
              {importNewBadge && <NewBadge />}
            </div>
          </div>
          <Button kind="secondary" state={templatesState}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: `8px ${spacing[12]}px`}}>
              <Symbol name="square.and.pencil" size={11} weight="medium" color={colors.textPrimary} />
              <span style={font(12, 'semibold')}>Templates</span>
            </span>
          </Button>
        </div>
      </div>
      <div style={{...type.callout, color: colors.textSecondary}}>{`${count} meeting${count === 1 ? '' : 's'}`}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: spacing[12]}}>
        {origin && <NativeSegmented options={['All', 'This Mac', 'From iPhone']} selected={['all', 'thisMac', 'fromIPhone'].indexOf(origin)} />}
        <div style={{flex: 1}} />
        {/* Sort and date filter: `.menuStyle(.borderlessButton)` menus (see BorderlessMenu). */}
        <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
          <BorderlessMenu icon={<Symbol name="arrow.up.arrow.down" size={11} weight="regular" color={colors.accent} />} text={SORT_LABEL[sort]} textStyle={font(11)} />
          <BorderlessMenu
            icon={<Symbol name="line.3.horizontal.decrease" size={11} weight="regular" color={colors.accent} />}
            text={filter !== 'all' ? FILTER_LABEL[filter] : undefined}
            textStyle={font(11)}
          />
        </div>
      </div>
    </div>
  );
};

// MARK: - Empty state and floating button

const EmptyState: React.FC<{inFolder: boolean; filtered: boolean}> = ({inFolder, filtered}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: spacing[12],
        padding: spacing[24],
        background: colors.backgroundRaised,
        borderRadius: radius.xl,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
      }}
    >
      {/* VERIFY: the Swift uses weight .thin; the glyph is exported at .regular. */}
      <Symbol name={inFolder ? 'folder' : 'person.2.wave.2'} size={30} weight="regular" color={colors.textTertiary} />
      <div style={{...type.title3, color: colors.textSecondary}}>{inFolder ? 'No meetings in this folder' : 'No meetings yet'}</div>
      <div style={{...type.callout, color: colors.textTertiary, maxWidth: 320}}>
        {filtered
          ? 'Try another source, time range, or folder.'
          : inFolder
            ? 'Choose another folder or move a meeting here from the browser.'
            : 'Start a recording from the menu bar to create your first meeting note.'}
      </div>
    </div>
  );
};

/** MeetingsView.newMeetingButton — 56pt circle, person.wave.2 22 semibold, "+" badge, "Quick Note" tip on hover. */
export const QuickNoteButton: React.FC<{hovered?: boolean; disabled?: boolean; focused?: boolean}> = ({hovered = false, disabled = false, focused = false}) => {
  const {colors} = useMuesliTheme();
  const highlighted = hovered && !disabled;
  const fill = highlighted ? colors.joinAction : colors.accent;
  const ink = highlighted ? colors.onJoinAction : colors.onAccent;
  return (
    <div style={{position: 'relative', width: 56, height: 56}}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: fill,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          opacity: disabled ? 0.5 : 1,
          boxShadow: `inset 0 0 0 ${focused ? 2 : 1}px ${focused ? colors.textPrimary : colors.surfaceBorder}`,
        }}
      >
        <Symbol name="person.wave.2" size={22} weight="semibold" color={ink} />
        {/* plus 9 bold, padding 3, fill circle, bottom-trailing offset (-7, -7) */}
        <div style={{position: 'absolute', right: 7, bottom: 7, padding: 3, borderRadius: '50%', background: fill, display: 'flex'}}>
          <Symbol name="plus" size={9} weight="bold" color={ink} />
        </div>
      </div>
      {(highlighted || focused) && (
        <div style={{position: 'absolute', top: 0, bottom: 0, right: 68, display: 'flex', alignItems: 'center'}}>
          <span
            style={{
              ...type.callout,
              color: colors.textPrimary,
              padding: '6px 10px',
              background: colors.surfacePrimary,
              borderRadius: 7,
              boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
              whiteSpace: 'nowrap',
            }}
          >
            Quick Note
          </span>
        </div>
      )}
    </div>
  );
};

// MARK: - Page

export const MeetingsBrowser: React.FC<MeetingsBrowserProps> = ({
  meetings,
  folder,
  showsPeople = false,
  upcoming,
  activeMeeting,
  sort = 'newestFirst',
  filter = 'all',
  selectedMeetingId,
  hoveredMeetingId,
  importNewBadge = true,
  importState = 'rest',
  templatesState = 'rest',
  newMeetingHovered = false,
  newMeetingDisabled = false,
  scrollY = 0,
  bottomInset = 0,
  origin,
}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: colors.backgroundBase}}>
      <div style={{transform: `translateY(${-scrollY}px)`}}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: `${layout.pageTop}px ${layout.pageInset}px 96px`,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[24],
          }}
        >
          <DashboardPageHeader title="Meetings" />
          <div style={{display: 'flex', justifyContent: 'center'}}>
            {/* `.frame(maxWidth: 240)` caps it; the control keeps its intrinsic width (measured: 152pt). */}
            <NativeSegmented options={['Meetings', 'People']} selected={showsPeople ? 1 : 0} />
          </div>
          {upcoming && upcoming.length > 0 && <ComingUpSection groups={upcoming} />}
          {activeMeeting && <ActiveBanner meeting={activeMeeting} />}
          <BrowserHeader
            title={folder ?? 'All Meetings'}
            count={meetings.length}
            sort={sort}
            filter={filter}
            importNewBadge={importNewBadge}
            importState={importState}
            templatesState={templatesState}
            origin={origin}
          />
          {meetings.length === 0 ? (
            <EmptyState inFolder={folder !== undefined} filtered={filter !== 'all'} />
          ) : (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {meetings.map((m) => (
                <MeetingListItem
                  key={m.id}
                  meeting={m}
                  selected={m.id === selectedMeetingId}
                  hovered={m.id === hoveredMeetingId}
                  browsedFolder={folder}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{position: 'absolute', right: layout.pageInset, bottom: 20 + bottomInset}}>
        <QuickNoteButton hovered={newMeetingHovered} disabled={newMeetingDisabled} />
      </div>
    </div>
  );
};
