// Gallery: Time Turner (TimeTurnerPage.swift and friends @ v0.8.6), 1120×790 dashboard content.
import React from 'react';
import {Composition} from 'remotion';
import {DashboardContent, layout, type Appearance, type SidebarProps} from '../../../src';
import {
  TimeTurnerPage,
  TimeTurnerSetupSheet,
  TimeTurnerFocusViewer,
  RecapSourcesPopover,
  RecapSettingsPopover,
  type TimeTurnerPageProps,
  type TimeTurnerSetupProps,
} from '../../../src/screens/time-turner';
import {
  TT_DAY_LABEL,
  TT_DATE_PICKER_TEXT,
  TT_GENERATED_LABEL,
  TT_PROVIDER_LINE,
  ttCaptures,
  ttHeroCapture,
  ttRecapInsights,
  ttSearchQuery,
  ttSearchResults,
  ttTodos,
  ttTime,
} from '../../../src/fixtures/time-turner';
import {KitFrame} from '../KitFrame';

const W = layout.windowWidth;
/** Content-only frame: 1120 × 758 (the 790pt window includes a 32pt titlebar). */
const H = layout.contentHeight;

const sidebar: SidebarProps = {selected: 'timeTurner', userName: 'Maya'};

const base: Omit<TimeTurnerPageProps, 'section'> = {
  controls: {enabled: true, status: 'On · this Mac'},
  dayLabel: TT_DAY_LABEL,
};

const Page: React.FC<{appearance: Appearance; accent?: string; page: TimeTurnerPageProps; sheet?: TimeTurnerSetupProps}> = ({appearance, accent, page, sheet}) => (
  <KitFrame appearance={appearance} accent={accent}>
    <div style={{position: 'relative', width: W, height: H}}>
      <DashboardContent sidebar={sidebar}>
        <TimeTurnerPage {...page} />
      </DashboardContent>
      {sheet ? (
        // Window-modal sheet: centred horizontally under the title bar. VERIFY placement on macOS 26.
        <div style={{position: 'absolute', top: 0, left: (W - 560) / 2}}>
          <TimeTurnerSetupSheet {...sheet} />
        </div>
      ) : null}
    </div>
  </KitFrame>
);

const offPage: TimeTurnerPageProps = {
  ...base,
  section: 'history',
  isToday: true,
  canGoBack: false,
  controls: {enabled: false},
  history: {captures: []},
};

const historyPage: TimeTurnerPageProps = {
  ...base,
  section: 'history',
  history: {captures: ttCaptures, playhead: ttHeroCapture.time},
};

const searchPage: TimeTurnerPageProps = {
  ...base,
  section: 'history',
  history: {
    captures: ttCaptures,
    playhead: ttTime(16, 12, 40),
    searchButtonState: 'pressed',
    search: {query: ttSearchQuery, caret: true, results: ttSearchResults, hoveredResultId: ttSearchResults[2].capture.id},
  },
};

const recapPage = (state: 'idle' | 'generating' | 'generated', reveal = 1): TimeTurnerPageProps => ({
  ...base,
  section: 'recap',
  recap: {
    state,
    generatedLabel: TT_GENERATED_LABEL,
    providerLine: TT_PROVIDER_LINE,
    idleMessage: 'Generate from this day’s selected sources using ChatGPT.',
    insights: ttRecapInsights,
    revealProgress: reveal,
    saved: true,
  },
});

const todosPage: TimeTurnerPageProps = {...base, section: 'todos', todos: {items: ttTodos, focusedId: 'todo-1'}};

// Popovers / menus (RecapPopovers.tsx). `offsetX` = the popover's arrow position, so the arrow sits on the button.
const recapSourcesPage: TimeTurnerPageProps = (() => {
  const p = recapPage('idle');
  return {...p, recap: {...p.recap!, actionStates: {sources: 'pressed'}, popover: {for: 'sources', offsetX: 250, content: <RecapSourcesPopover arrowX={250} included={{meetings: true, dictations: true}} />}}};
})();
const recapSettingsPage: TimeTurnerPageProps = (() => {
  const p = recapPage('generated');
  return {...p, recap: {...p.recap!, actionStates: {settings: 'pressed'}, popover: {for: 'settings', offsetX: 400, content: <RecapSettingsPopover arrowX={400} backend="ChatGPT" model="GPT-6.1 Sol (default)" schedule="today" hour={18} />}}};
})();
const recapCopiedPage: TimeTurnerPageProps = (() => {
  const p = recapPage('generated');
  return {...p, recap: {...p.recap!, copied: true}};
})();
const todosRemindPage: TimeTurnerPageProps = {...base, section: 'todos', todos: {items: ttTodos, reminderMenu: {id: 'todo-2', highlighted: 1}}};

type Entry = {id: string; appearance: Appearance; accent?: string; page: TimeTurnerPageProps; sheet?: TimeTurnerSetupProps};
const entries: Entry[] = [
  {id: 'TimeTurner-off-dark', appearance: 'dark', page: offPage},
  {id: 'TimeTurner-setup-dark', appearance: 'dark', page: offPage, sheet: {step: 0}},
  {id: 'TimeTurner-setup-light', appearance: 'light', page: offPage, sheet: {step: 0}},
  {id: 'TimeTurner-setup-permissions-dark', appearance: 'dark', page: offPage, sheet: {step: 1, screenRecordingGranted: true}},
  {id: 'TimeTurner-history-dark', appearance: 'dark', page: historyPage},
  // Matches the reference capture's state and its custom accent, for 1:1 comparison.
  {id: 'TimeTurner-history-paused-dark', appearance: 'dark', accent: '#3662E3', page: {...historyPage, controls: {enabled: true, paused: true}, history: {captures: ttCaptures, playhead: ttTime(17, 58, 0)}}},
  {id: 'TimeTurner-history-light', appearance: 'light', page: historyPage},
  {id: 'TimeTurner-search-dark', appearance: 'dark', page: searchPage},
  {id: 'TimeTurner-recap-dark', appearance: 'dark', page: recapPage('generated')},
  {id: 'TimeTurner-recap-light', appearance: 'light', page: recapPage('generated')},
  {id: 'TimeTurner-recap-idle-dark', appearance: 'dark', page: recapPage('idle')},
  {id: 'TimeTurner-recap-generating-dark', appearance: 'dark', page: recapPage('generating')},
  {id: 'TimeTurner-todos-dark', appearance: 'dark', page: todosPage},
  {id: 'TimeTurner-todos-light', appearance: 'light', page: todosPage},
  {id: 'TimeTurner-recap-sources-dark', appearance: 'dark', page: recapSourcesPage},
  {id: 'TimeTurner-recap-settings-dark', appearance: 'dark', page: recapSettingsPage},
  {id: 'TimeTurner-recap-copied-dark', appearance: 'dark', page: recapCopiedPage},
  {id: 'TimeTurner-todos-remind-menu-dark', appearance: 'dark', page: todosRemindPage},
];

const Focus: React.FC<{appearance: Appearance}> = ({appearance}) => (
  <KitFrame appearance={appearance}>
    <TimeTurnerFocusViewer
      screenWidth={W}
      screenHeight={H}
      captures={ttCaptures}
      playhead={ttHeroCapture.time}
      dayLabel={TT_DAY_LABEL}
      datePickerText={TT_DATE_PICKER_TEXT}
      showsText
    >
      <DashboardContent sidebar={sidebar}>
        <TimeTurnerPage {...historyPage} />
      </DashboardContent>
    </TimeTurnerFocusViewer>
  </KitFrame>
);

export const Root: React.FC = () => (
  <>
    {entries.map((e) => (
      <Composition key={e.id} id={e.id} component={() => <Page appearance={e.appearance} accent={e.accent} page={e.page} sheet={e.sheet} />} durationInFrames={1} fps={30} width={W} height={H} />
    ))}
    <Composition id="TimeTurner-focus-dark" component={() => <Focus appearance="dark" />} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="TimeTurner-focus-light" component={() => <Focus appearance="light" />} durationInFrames={1} fps={30} width={W} height={H} />
  </>
);

