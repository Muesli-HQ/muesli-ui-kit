import React from 'react';
import {Composition} from 'remotion';
import {DashboardContent, DashboardWindow, PageTitle, layout, type Appearance, type SidebarProps} from '../../src';
import {KitFrame} from './KitFrame';
import {Controls} from './Controls';
import {Root as TimelineGroup} from './groups/timeline';
import {Root as TimeTurnerGroup} from './groups/time-turner';
import {Root as VidshotsGroup} from './groups/vidshots';
import {Root as MeetingsChatGroup} from './groups/meetings-chat';
import {Root as IndicatorSettingsGroup} from './groups/indicator-settings';
import {Root as OnboardingGroup} from './groups/onboarding';

const sidebar: SidebarProps = {
  selected: 'timeline',
  userName: 'Pranav',
  totalMeetingCount: 214,
  folders: [{name: 'Customer calls', count: 48}, {name: 'Hiring', count: 17}, {name: 'Standups', count: 96}],
  meetingsExpanded: true,
};

const Detail: React.FC = () => (
  <div style={{padding: `${layout.pageTop}px ${layout.pageInset}px`}}>
    <PageTitle>Timeline</PageTitle>
  </div>
);

const W = layout.windowWidth;
const H = layout.windowHeight;
const CH = layout.contentHeight;

/** Content only (no chrome), 1:1 with the app's 1120×790 content rect — for pixel comparison. */
const Content: React.FC<{appearance: Appearance}> = ({appearance}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={sidebar}>
      <Detail />
    </DashboardContent>
  </KitFrame>
);

export const GalleryRoot: React.FC = () => (
  <>
    {(['dark', 'light', 'ultraDark'] as Appearance[]).map((a) => (
      <Composition key={a} id={`Dashboard-${a}`} component={() => <Content appearance={a} />} durationInFrames={1} fps={30} width={W} height={CH} />
    ))}
    <Composition
      id="Window-dark"
      component={() => (
        <KitFrame background="#1d2733">
          <div style={{padding: 60}}>
            <DashboardWindow sidebar={sidebar}>
              <Detail />
            </DashboardWindow>
          </div>
        </KitFrame>
      )}
      durationInFrames={1}
      fps={30}
      width={W + 120}
      height={H + 120}
    />
    <Composition id="Sidebar-collapsed" component={() => (<KitFrame><DashboardContent sidebar={{...sidebar, collapsed: true, selected: 'vidshots'}}><Detail /></DashboardContent></KitFrame>)} durationInFrames={1} fps={30} width={W} height={CH} />
    <Composition id="Controls-dark" component={() => <KitFrame><Controls /></KitFrame>} durationInFrames={1} fps={30} width={900} height={520} />
    <Composition id="Controls-light" component={() => <KitFrame appearance="light"><Controls /></KitFrame>} durationInFrames={1} fps={30} width={900} height={520} />
    <TimelineGroup />
    <TimeTurnerGroup />
    <VidshotsGroup />
    <MeetingsChatGroup />
    <IndicatorSettingsGroup />
    <OnboardingGroup />
  </>
);
