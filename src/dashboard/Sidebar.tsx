// SidebarView.swift + SidebarOrder.swift @ v0.8.6 — expanded (240pt) and collapsed (68pt) dashboard sidebar.
import React from 'react';
import {useMuesliTheme} from '../theme/MuesliThemeProvider';
import {font, type} from '../typography';
import {spacing, layout, radius} from '../tokens/theme';
import {Symbol, TimeTurnerIcon, VidshotIcon, MuesliMark} from '../icons/Icon';
import {NewBadge} from '../primitives/NewBadge';
import {RowFeedback, type RowState} from '../primitives/RowFeedback';
import {Button} from '../primitives/Button';
import {GlassCircleButton} from '../primitives/GlassButton';

export type DashboardTab =
  | 'timeline' | 'timeTurner' | 'dictations' | 'vidshots' | 'insights' | 'meetings'
  | 'meetingChat' | 'dictionary' | 'models' | 'shortcuts' | 'settings' | 'about';

/** SidebarOrder.defaults — the reorderable navigation block. */
export const DEFAULT_SIDEBAR_ORDER: DashboardTab[] = ['timeline', 'timeTurner', 'dictations', 'vidshots', 'meetings', 'meetingChat', 'dictionary'];
/** NewFeature.sidebar(tab): tabs that carry a "New" badge until first used. */
export const NEW_FEATURE_TABS: DashboardTab[] = ['meetingChat', 'timeTurner', 'vidshots'];

export const SIDEBAR_LABEL: Record<DashboardTab, string> = {
  timeline: 'Timeline', timeTurner: 'Time Turner', dictations: 'Dictations', vidshots: 'Vidshots', meetings: 'Meetings',
  meetingChat: 'Chat', insights: 'Insights', dictionary: 'Dictionary', models: 'Models', shortcuts: 'Shortcuts', settings: 'Settings', about: 'About',
};
export const SIDEBAR_ICON: Record<DashboardTab, string> = {
  timeline: 'clock', timeTurner: 'clock.arrow.circlepath', dictations: 'waveform', vidshots: 'viewfinder', meetings: 'person.2',
  meetingChat: 'bubble.left.and.bubble.right', insights: 'chart.bar.xaxis', dictionary: 'character.book.closed',
  models: 'cpu', shortcuts: 'command', settings: 'gearshape', about: 'info.circle',
};

export type MeetingFolder = {name: string; count: number; depth?: number; hasChildren?: boolean; collapsed?: boolean};
export type UpdateCTA = {label: 'Update' | 'Ready'};
export type AppearanceChoice = 'light' | 'system' | 'dark';

export interface SidebarProps {
  selected: DashboardTab;
  collapsed?: boolean;
  /** "Hi, <name>" under the wordmark; omitted when empty, as in the app. */
  userName?: string;
  order?: DashboardTab[];
  newBadges?: DashboardTab[];
  meetingsExpanded?: boolean;
  totalMeetingCount?: number;
  folders?: MeetingFolder[];
  /** Selected Meetings filter: undefined = All Meetings, otherwise a folder index. */
  selectedFolder?: number;
  /** Hover / press / focus feedback per row, keyed by tab (or 'search'). */
  rowStates?: Partial<Record<DashboardTab | 'search', RowState>>;
  aboutUpdate?: UpdateCTA;
  modelsUpdate?: boolean;
  appearanceChoice?: AppearanceChoice;
}

/** SidebarView.formattedCount */
export const formatCount = (n: number) => (n < 1000 ? `${n}` : n < 10000 ? `${(Math.floor((n / 1000) * 10) / 10).toFixed(1)}k` : `${Math.floor(n / 1000)}k`);

const ICON_COLUMN = 20;
const ROW_H_PAD = 10;
const ROW_OUTER_PAD = 8;
const MEETINGS_CHILD_INDENT = 24;
const FOLDER_DEPTH_INDENT = 16;
const MEETINGS_ACTION_WIDTH = 36;

const TabGlyph: React.FC<{tab: DashboardTab; color: string; collapsed?: boolean}> = ({tab, color, collapsed}) => {
  if (tab === 'vidshots') return <VidshotIcon color={color} size={collapsed ? 16 : 14} />;
  if (tab === 'timeTurner') return <TimeTurnerIcon color={color} />;
  return <Symbol name={SIDEBAR_ICON[tab]} size={collapsed ? 16 : 14} weight="medium" color={color} />;
};

export const Sidebar: React.FC<SidebarProps> = (p) => (p.collapsed ? <CollapsedSidebar {...p} /> : <ExpandedSidebar {...p} />);

const ExpandedSidebar: React.FC<SidebarProps> = ({
  selected,
  userName = '',
  order = DEFAULT_SIDEBAR_ORDER,
  newBadges = NEW_FEATURE_TABS,
  meetingsExpanded = true,
  totalMeetingCount = 0,
  folders = [],
  selectedFolder,
  rowStates = {},
  aboutUpdate,
  modelsUpdate,
  appearanceChoice: appearanceChoiceProp,
}) => {
  const {colors, isDark} = useMuesliTheme();
  // Follows the rendered theme unless a video sets it explicitly (e.g. 'system').
  const appearanceChoice: AppearanceChoice = appearanceChoiceProp ?? (isDark ? 'dark' : 'light');

  const item = (tab: DashboardTab, update?: UpdateCTA) => {
    const isSelected = selected === tab;
    return (
      <div key={tab} style={{padding: `0 ${ROW_OUTER_PAD}px`}}>
        <RowFeedback selected={isSelected} state={rowStates[tab]}>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[12], padding: `${spacing[8]}px ${ROW_H_PAD}px`}}>
            <span style={{width: ICON_COLUMN, height: ICON_COLUMN, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
              <TabGlyph tab={tab} color={isSelected ? colors.accentText : colors.textSecondary} />
            </span>
            <span style={{...font(14, isSelected ? 'semibold' : 'medium'), color: isSelected ? colors.textPrimary : colors.textSecondary, whiteSpace: 'nowrap'}}>
              {SIDEBAR_LABEL[tab]}
            </span>
            <span style={{flex: 1}} />
            {newBadges.includes(tab) && <NewBadge />}
            {update && <UpdatePill label={update.label} />}
          </div>
        </RowFeedback>
      </div>
    );
  };

  return (
    <div style={{width: layout.sidebarWidth, height: '100%', background: colors.backgroundDeep, display: 'flex', flexDirection: 'column', gap: spacing[4], overflow: 'hidden', flex: 'none'}}>
      {/* sidebarHeader */}
      <div style={{display: 'flex', alignItems: 'flex-start', padding: `${layout.pageTop}px ${spacing[16]}px ${spacing[20]}px`}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: spacing[4]}}>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[12]}}>
            <MuesliMark color={colors.accent} box={22} />
            <span style={{...type.title2, color: colors.textPrimary}}>muesli</span>
          </div>
          {userName && <span style={{...type.caption, color: colors.textTertiary, paddingLeft: 34}}>Hi, {userName}</span>}
        </div>
        <span style={{flex: 1, minWidth: spacing[8]}} />
        <GlassCircleButton size={36}>
          <Symbol name="sidebar.left" size={16} weight="medium" color={colors.textSecondary} />
        </GlassCircleButton>
      </div>

      {/* searchBar */}
      <div style={{padding: `0 ${ROW_OUTER_PAD}px ${spacing[8]}px`}}>
        <Button kind="quiet" state={rowStates.search === 'hover' ? 'highlighted' : rowStates.search === 'pressed' ? 'pressed' : 'rest'} style={{width: '100%', justifyContent: 'stretch'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 32, padding: `0 ${ROW_H_PAD}px`, width: '100%', color: colors.textSecondary}}>
            <span style={{width: ICON_COLUMN, display: 'flex', justifyContent: 'center'}}>
              <Symbol name="magnifyingglass" size={13} weight="regular" color={colors.textSecondary} />
            </span>
            <span style={type.callout}>Search…</span>
            <span style={{flex: 1}} />
            <span style={type.caption}>⌘F</span>
          </div>
        </Button>
      </div>

      {/* reorderable navigation */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[4], minHeight: 0}}>
        {order.map((tab) =>
          tab === 'meetings' ? (
            <MeetingsSection
              key="meetings"
              selected={selected === 'meetings'}
              expanded={meetingsExpanded}
              total={totalMeetingCount}
              folders={folders}
              selectedFolder={selectedFolder}
              state={rowStates.meetings}
            />
          ) : (
            item(tab)
          ),
        )}
      </div>

      {item('models', modelsUpdate ? {label: 'Update'} : undefined)}
      {item('shortcuts')}
      {item('settings')}
      {item('about', aboutUpdate)}
      <div style={{padding: `${spacing[12]}px ${ROW_OUTER_PAD}px ${spacing[16]}px ${ROW_OUTER_PAD + ROW_H_PAD}px`}}>
        <div style={{paddingBottom: spacing[4]}}>
          <AppearanceSwitcher choice={appearanceChoice} />
        </div>
      </div>
    </div>
  );
};

const UpdatePill: React.FC<{label: string}> = ({label}) => {
  const {colors} = useMuesliTheme();
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 9999, background: colors.accent, color: colors.onAccent, boxShadow: `0 2px 8px ${colors.accent}59`}}>
      <Symbol name={label === 'Ready' ? 'arrow.clockwise' : 'arrow.down'} size={9} weight="bold" color={colors.onAccent} />
      <span style={{...font(11, 'bold'), whiteSpace: 'nowrap'}}>{label}</span>
    </span>
  );
};

const MeetingsSection: React.FC<{selected: boolean; expanded: boolean; total: number; folders: MeetingFolder[]; selectedFolder?: number; state?: RowState}> = ({
  selected,
  expanded,
  total,
  folders,
  selectedFolder,
  state,
}) => {
  const {colors} = useMuesliTheme();
  const actionColor = selected ? colors.textSecondary : colors.textTertiary;
  const filterRow = (icon: string, label: string, count: number, isSelected: boolean, key: React.Key, indent = 0, disclosure?: 'open' | 'closed') => (
    <div key={key} style={{paddingLeft: indent}}>
      <RowFeedback selected={isSelected}>
        <div style={{display: 'flex', alignItems: 'center', gap: spacing[12], padding: `6px ${ROW_H_PAD}px`}}>
          <span style={{width: ICON_COLUMN, display: 'flex', justifyContent: 'center', flex: 'none'}}>
            <Symbol name={icon} size={14} weight="medium" color={isSelected ? colors.accentText : colors.textTertiary} />
          </span>
          <span style={{...type.callout, color: isSelected ? colors.textPrimary : colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{label}</span>
          <span style={{flex: 1}} />
          {disclosure && <Symbol name={disclosure === 'open' ? 'chevron.down' : 'chevron.right'} size={9} weight="semibold" color={colors.textTertiary} />}
          <span style={{...type.caption, fontVariantNumeric: 'tabular-nums', color: colors.textTertiary, minWidth: 24, textAlign: 'center'}}>{formatCount(count)}</span>
        </div>
      </RowFeedback>
    </div>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <div style={{padding: `0 ${ROW_OUTER_PAD}px`}}>
        <RowFeedback selected={selected} state={state}>
          <div style={{display: 'flex', alignItems: 'stretch'}}>
            <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: spacing[12], padding: `${spacing[8]}px 0 ${spacing[8]}px ${ROW_H_PAD}px`}}>
              <span style={{width: ICON_COLUMN, display: 'flex', justifyContent: 'center', flex: 'none'}}>
                <Symbol name="person.wave.2" size={14} weight="medium" color={selected ? colors.accentText : colors.textSecondary} />
              </span>
              <span style={{...font(14, selected ? 'semibold' : 'medium'), color: selected ? colors.textPrimary : colors.textSecondary}}>Meetings</span>
            </div>
            <span style={{width: MEETINGS_ACTION_WIDTH, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Symbol name={expanded ? 'chevron.down' : 'chevron.right'} size={11} weight="semibold" color={actionColor} />
            </span>
            <span style={{width: MEETINGS_ACTION_WIDTH, paddingRight: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'content-box'}}>
              <Symbol name="folder.badge.plus" size={11} weight="medium" color={actionColor} />
            </span>
          </div>
        </RowFeedback>
      </div>
      {expanded && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 2, padding: `0 ${ROW_OUTER_PAD}px 0 ${ROW_OUTER_PAD + MEETINGS_CHILD_INDENT}px`}}>
          {filterRow('tray.2', 'All Meetings', total, selected && selectedFolder === undefined, 'all')}
          {folders.map((f, i) =>
            filterRow('folder', f.name, f.count, selected && selectedFolder === i, i, (f.depth ?? 0) * FOLDER_DEPTH_INDENT, f.hasChildren ? (f.collapsed ? 'closed' : 'open') : undefined),
          )}
        </div>
      )}
    </div>
  );
};

/** MuesliSettingControl(id: "appearance", compactAppearance: true) — Light / System / Dark quick choices. */
export const AppearanceSwitcher: React.FC<{choice: AppearanceChoice}> = ({choice}) => {
  const {colors} = useMuesliTheme();
  const choices: Array<[AppearanceChoice, string]> = [['light', 'sun.max'], ['system', 'desktopcomputer'], ['dark', 'moon']];
  return (
    <div style={{display: 'inline-flex', gap: 2, padding: 2, background: colors.backgroundRaised, borderRadius: radius.small}}>
      {choices.map(([id, icon]) => {
        const sel = id === choice;
        return (
          <Button key={id} kind={sel ? 'tinted' : 'quiet'} shape={{kind: 'rounded', radius: 4}} style={{width: 28, minHeight: 22, boxShadow: undefined}}>
            <span style={{position: 'relative', width: 28, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, boxShadow: sel ? `inset 0 0 0 1px ${colors.textSecondary}` : undefined}}>
              <Symbol name={icon} size={10} weight="medium" color={sel ? colors.accentText : colors.textSecondary} />
            </span>
          </Button>
        );
      })}
    </div>
  );
};

const CollapsedSidebar: React.FC<SidebarProps> = ({selected, order = DEFAULT_SIDEBAR_ORDER, modelsUpdate}) => {
  const {colors} = useMuesliTheme();
  const cell = (tab: DashboardTab) => {
    const isSelected = selected === tab;
    return (
      <RowFeedback key={tab} selected={isSelected}>
        <span style={{width: 40, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <TabGlyph tab={tab} collapsed color={isSelected ? colors.accentText : colors.textSecondary} />
          {tab === 'models' && modelsUpdate && <span style={{position: 'absolute', top: 6 - 3.5, right: 6 - 3.5, width: 7, height: 7, borderRadius: '50%', background: colors.accent}} />}
        </span>
      </RowFeedback>
    );
  };
  return (
    <div style={{width: layout.sidebarCollapsedWidth, height: '100%', background: colors.backgroundDeep, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8], flex: 'none'}}>
      <div style={{paddingTop: spacing[16], paddingBottom: spacing[12]}}>
        <GlassCircleButton size={36}>
          <Symbol name="sidebar.left" size={16} weight="medium" color={colors.textSecondary} />
        </GlassCircleButton>
      </div>
      <Button kind="quiet">
        <span style={{width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Symbol name="magnifyingglass" size={13} weight="regular" color={colors.textSecondary} />
        </span>
      </Button>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[8]}}>{order.map(cell)}</div>
      {cell('models')}
      {cell('shortcuts')}
      {cell('settings')}
      <div style={{paddingBottom: spacing[16]}}>{cell('about')}</div>
    </div>
  );
};
