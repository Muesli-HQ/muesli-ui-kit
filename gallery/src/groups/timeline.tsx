// Gallery: Timeline + Dictations pages inside the dashboard (1120×758 SwiftUI content area).
import React from 'react';
import {Composition} from 'remotion';
import {DashboardContent, layout, type Appearance, type SidebarProps} from '../../../src';
import {TimelinePage} from '../../../src/screens/timeline';
import {DictationsPage} from '../../../src/screens/dictations';
import {dictationDays, FIXTURE_APPS, timelineDays, timelineStats} from '../../../src/fixtures/timeline';
import {KitFrame} from '../KitFrame';

const sidebar = (selected: SidebarProps['selected'], appearance: Appearance = 'dark'): SidebarProps => ({
  selected,
  appearanceChoice: appearance === 'light' ? 'light' : 'dark',
  userName: 'Maya',
  totalMeetingCount: 37,
  folders: [{name: 'Customer calls', count: 12}, {name: 'Standups', count: 18}],
  meetingsExpanded: false,
});

const W = layout.windowWidth;
/** SwiftUI content area (the 790pt window minus its 32pt titlebar). */
const H = layout.contentHeight;

const Timeline: React.FC<{appearance: Appearance; state?: boolean}> = ({appearance, state}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={sidebar('timeline', appearance)}>
      <TimelinePage
        days={timelineDays}
        stats={timelineStats}
        showsOriginFilter
        hoveredId={state ? 'd-cursor-refactor' : undefined}
        rows={state ? {'d-cursor-refactor': {actionStates: {copy: 'highlighted'}}, 'd-slack-launch': {copied: 'copy'}} : undefined}
        search={state ? 'onboarding' : undefined}
        searchFocused={state}
        dateFilter={state ? 'Last week' : undefined}
        scrollY={state ? 0 : undefined}
      />
    </DashboardContent>
  </KitFrame>
);

const Dictations: React.FC<{appearance: Appearance; state?: boolean}> = ({appearance, state}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={sidebar('dictations', appearance)}>
      <DictationsPage
        days={dictationDays}
        stats={{...timelineStats, totalWords: 41380}}
        hoveredId={state ? 'd-mail-reply' : undefined}
        rows={state ? {'d-notes-long': {showsFullText: true}} : undefined}
        appFilter={state ? FIXTURE_APPS.mail : undefined}
        showsOriginFilter
        showsVoiceNoteButton={state}
      />
    </DashboardContent>
  </KitFrame>
);

const Empty: React.FC = () => (
  <KitFrame appearance="dark">
    <DashboardContent sidebar={sidebar('timeline')}>
      <TimelinePage days={timelineDays} stats={timelineStats} visibleCount={0} search="quarterly forecast" />
    </DashboardContent>
  </KitFrame>
);

export const Root: React.FC = () => (
  <>
    <Composition id="Timeline-dark" component={() => <Timeline appearance="dark" />} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="Timeline-light" component={() => <Timeline appearance="light" />} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="Timeline-hover-dark" component={() => <Timeline appearance="dark" state />} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition
      id="Timeline-scrolled-dark"
      component={() => (
        <KitFrame appearance="dark">
          <DashboardContent sidebar={sidebar('timeline')}>
            <TimelinePage days={timelineDays} stats={timelineStats} scrollY={760} hoveredId="m-design-sync" rows={{'q-summary': {expanded: false}}} />
          </DashboardContent>
        </KitFrame>
      )}
      durationInFrames={1}
      fps={30}
      width={W}
      height={H}
    />
    <Composition id="Timeline-empty-dark" component={Empty} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="Dictations-dark" component={() => <Dictations appearance="dark" />} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="Dictations-light" component={() => <Dictations appearance="light" />} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="Dictations-hover-light" component={() => <Dictations appearance="light" state />} durationInFrames={1} fps={30} width={W} height={H} />
  </>
);

