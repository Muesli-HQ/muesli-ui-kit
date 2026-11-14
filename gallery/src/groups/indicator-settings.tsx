// Gallery: dictation indicators (notch + floating), Cotypist, Settings and Models.
import React from 'react';
import {Composition} from 'remotion';
import {DashboardContent, layout, type Appearance, type SidebarProps} from '../../../src';
import {type as T} from '../../../src/typography';
import {KitFrame} from '../KitFrame';
import {NotchIndicator, NotchIndicatorBar, NOTCH_MBP_1512, notchFrame, FloatingIndicator, MuesliNotification, TodoReminderNotification, DailyRecapNotification, type NotchPhase, type FloatingPhase} from '../../../src/screens/indicator';
import {CotypistEditor, CotypistSetupGuide} from '../../../src/screens/cotypist';
import {SettingsPage, type SettingsPaneId} from '../../../src/screens/settings';
import {ModelsPage, type ModelsCategoryId} from '../../../src/screens/models';
import {
  SPEECH_LEVELS,
  COTYPIST_DEMO,
  GENERAL_SETTINGS,
  APPEARANCE_SETTINGS,
  EXPERIMENTAL_SETTINGS,
  COTYPIST_SETTINGS_DOWNLOADING,
  DICTATION_MODELS,
  COTYPIST_MODELS_STATE,
} from '../../../src/fixtures/indicator-settings';

const W = layout.windowWidth;
/** SwiftUI content area: the 790pt frame minus the measured 32pt titlebar. */
const H = layout.contentHeight;
const WALLPAPER = 'linear-gradient(160deg, #2b3a55 0%, #1a2233 45%, #3a2a3f 100%)';

const sidebar = (selected: SidebarProps['selected']): SidebarProps => ({
  selected,
  userName: 'Maya',
  totalMeetingCount: 86,
  folders: [{name: 'Customer calls', count: 31}, {name: 'Hiring', count: 9}],
  meetingsExpanded: false,
});

// ---------------- Notch ----------------

const notchRows: Array<{phase: NotchPhase; label: string; extra?: Record<string, unknown>}> = [
  {phase: 'preparing', label: 'preparing'},
  {phase: 'listening', label: 'listening (hold to talk)', extra: {edgeIntensity: 0.7}},
  {phase: 'handsFree', label: 'hands-free'},
  {phase: 'transcribing', label: 'transcribing', extra: {spinnerPhase: 0.3}},
  {phase: 'completion', label: 'completion sweep @ 40%', extra: {completionProgress: 0.4}},
  {phase: 'notice', label: 'notice (warning status)', extra: {statusMessage: 'Dictation ready. Cleanup unavailable.'}},
  {phase: 'done', label: 'done (success status)', extra: {statusMessage: 'Saved to Meetings.'}},
  {phase: 'failed', label: 'failed outcome'},
  {phase: 'meeting', label: 'meeting'},
];
const ROW_H = 110;

/** A desktop strip with a menu bar and the physical notch, as on a 1512-wide MacBook Pro. */
const NotchStrip: React.FC<{children: React.ReactNode; label: string}> = ({children, label}) => {
  const f = notchFrame(NOTCH_MBP_1512);
  return (
    <div style={{position: 'relative', width: 1512, height: ROW_H, background: WALLPAPER, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: NOTCH_MBP_1512.height, background: 'rgba(0,0,0,0.28)'}} />
      <div style={{position: 'absolute', left: f.cutoutX, top: 0, width: NOTCH_MBP_1512.cutoutWidth, height: NOTCH_MBP_1512.height, background: '#000', borderRadius: '0 0 10px 10px'}} />
      <div style={{position: 'absolute', left: 0, top: 0}}>{children}</div>
      <div style={{position: 'absolute', left: 24, bottom: 10, ...T.caption, color: 'rgba(255,255,255,0.6)'}}>{label}</div>
    </div>
  );
};

const NotchStates: React.FC = () => (
  <KitFrame>
    {notchRows.map((r) => (
      <NotchStrip key={r.phase} label={r.label}>
        <NotchIndicator phase={r.phase} levels={SPEECH_LEVELS} {...(r.extra ?? {})} />
      </NotchStrip>
    ))}
  </KitFrame>
);

/** 4× close-up of the bar for detail checks. */
const NotchCloseup: React.FC = () => (
  <KitFrame background="#3a4256">
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, padding: 24, transformOrigin: '0 0', transform: 'scale(2.4)'}}>
      {(['listening', 'handsFree', 'transcribing', 'completion', 'notice'] as NotchPhase[]).map((p) => (
        <NotchIndicatorBar key={p} phase={p} levels={SPEECH_LEVELS} completionProgress={0.4} edgeIntensity={p === 'listening' ? 0.7 : 0.18} spinnerPhase={0.3} />
      ))}
    </div>
  </KitFrame>
);

// ---------------- Floating ----------------

const floatingCells: Array<{phase: FloatingPhase; label: string; extra?: Record<string, unknown>}> = [
  {phase: 'idle', label: 'Classic · idle'},
  {phase: 'idleHover', label: 'Classic · idle hover'},
  {phase: 'minimalIdle', label: 'Minimal · idle (Middle Right)'},
  {phase: 'minimalHover', label: 'Minimal · hover'},
  {phase: 'preparing', label: 'preparing (waiting)', extra: {waitingTime: 0.4}},
  {phase: 'connecting', label: 'connecting'},
  {phase: 'recording', label: 'recording'},
  {phase: 'transcribing', label: 'transcribing'},
  {phase: 'warning', label: 'warning', extra: {message: 'Model preparation failed. Try again.', noticeIcon: '!'}},
  {phase: 'success', label: 'success', extra: {message: 'Copied to clipboard'}},
];

const FloatingStates: React.FC = () => (
  <KitFrame background={WALLPAPER}>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 40px', padding: 36}}>
      {floatingCells.map((c) => (
        <div key={c.phase} style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start'}}>
          <span style={{...T.caption, color: 'rgba(255,255,255,0.6)'}}>{c.label}</span>
          <FloatingIndicator phase={c.phase} levels={SPEECH_LEVELS} {...(c.extra ?? {})} />
        </div>
      ))}
    </div>
  </KitFrame>
);

// ---------------- Cotypist ----------------

const CotypistScene: React.FC<{dark: boolean}> = ({dark}) => (
  <KitFrame appearance={dark ? 'dark' : 'light'} background={dark ? '#101216' : '#d9dde5'}>
    <div style={{display: 'flex', gap: 32, padding: 32}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
        <CotypistEditor appearance={dark ? 'dark' : 'light'} width={600} height={150} title={COTYPIST_DEMO.title} before={COTYPIST_DEMO.before} typed={COTYPIST_DEMO.typed} suggestion={COTYPIST_DEMO.suggestion} />
        <CotypistEditor appearance={dark ? 'dark' : 'light'} width={600} height={150} title="After ⌥→ ×2" before={COTYPIST_DEMO.before} typed={COTYPIST_DEMO.typed} suggestion={COTYPIST_DEMO.suggestion} acceptedWords={2} />
        <CotypistEditor appearance={dark ? 'dark' : 'light'} width={600} height={150} title="After Tab" before={COTYPIST_DEMO.before} typed={COTYPIST_DEMO.typed} suggestion={COTYPIST_DEMO.suggestion} acceptedAll />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
        <CotypistSetupGuide />
        <CotypistSetupGuide suggestsRelogin />
      </div>
    </div>
  </KitFrame>
);

// ---------------- Settings / Models ----------------

const SettingsComp: React.FC<{appearance: Appearance; pane: SettingsPaneId; scrollY?: number; downloading?: boolean}> = ({appearance, pane, scrollY, downloading}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={sidebar('settings')}>
      <SettingsPage
        pane={pane}
        scrollY={scrollY}
        general={GENERAL_SETTINGS}
        appearance={appearance === 'light' ? {...APPEARANCE_SETTINGS, theme: 'light'} : APPEARANCE_SETTINGS}
        experimental={downloading ? {...EXPERIMENTAL_SETTINGS, cotypist: COTYPIST_SETTINGS_DOWNLOADING} : EXPERIMENTAL_SETTINGS}
      />
    </DashboardContent>
  </KitFrame>
);

const ModelsComp: React.FC<{appearance: Appearance; category: ModelsCategoryId; scrollY?: number}> = ({appearance, category, scrollY}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={sidebar('models')}>
      <ModelsPage category={category} scrollY={scrollY} dictation={DICTATION_MODELS} cotypist={COTYPIST_MODELS_STATE} />
    </DashboardContent>
  </KitFrame>
);

/** Scroll offset that brings the Cotypist section into view on the Experimental pane. */
const COTYPIST_SCROLL = 1000;

/** MeetingNotificationController panels (MuesliNotification.tsx): to-do reminder, scheduled recap, meeting detection. */
const NotificationStates: React.FC = () => (
  <KitFrame appearance="dark" background="linear-gradient(135deg, #3B4A6B, #6B4F6E)">
    <div style={{padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 18, width: 520, boxSizing: 'border-box'}}>
      <TodoReminderNotification todoTitle="Send Priya the updated Atlas pricing table" />
      <TodoReminderNotification todoTitle="Add the permission-step fix to the Atlas 2.4 release notes" countdown={0.45} actionState="pressed" />
      <DailyRecapNotification dayLabel="6 Nov 2026" countdown={0.8} />
      <MuesliNotification title="Design review: Atlas onboarding" subtitle="Starts now · Google Meet" split={{label: 'Join & Transcribe'}} countdown={0.6} />
    </div>
  </KitFrame>
);

export const Root: React.FC = () => (
  <>
    <Composition id="Notch-states" component={NotchStates} durationInFrames={1} fps={30} width={1512} height={ROW_H * notchRows.length} />
    <Composition id="Notch-closeup" component={NotchCloseup} durationInFrames={1} fps={30} width={960} height={760} />
    <Composition id="Notification-states" component={NotificationStates} durationInFrames={1} fps={30} width={520} height={400} />
    <Composition id="Floating-states" component={FloatingStates} durationInFrames={1} fps={30} width={760} height={560} />
    <Composition id="Cotypist-light" component={() => <CotypistScene dark={false} />} durationInFrames={1} fps={30} width={1000} height={660} />
    <Composition id="Cotypist-dark" component={() => <CotypistScene dark />} durationInFrames={1} fps={30} width={1000} height={660} />
    {(['dark', 'light'] as Appearance[]).map((a) => (
      <React.Fragment key={a}>
        <Composition id={`Settings-experimental-${a}`} component={() => <SettingsComp appearance={a} pane="experimental" />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Settings-cotypist-${a}`} component={() => <SettingsComp appearance={a} pane="experimental" scrollY={COTYPIST_SCROLL} />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Settings-appearance-${a}`} component={() => <SettingsComp appearance={a} pane="appearance" />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Settings-general-${a}`} component={() => <SettingsComp appearance={a} pane="general" />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Models-dictation-${a}`} component={() => <ModelsComp appearance={a} category="dictation" />} durationInFrames={1} fps={30} width={W} height={H} />
        <Composition id={`Models-cotypist-${a}`} component={() => <ModelsComp appearance={a} category="cotypist" />} durationInFrames={1} fps={30} width={W} height={H} />
      </React.Fragment>
    ))}
    <Composition id="Settings-cotypist-setup-dark" component={() => <SettingsComp appearance="dark" pane="experimental" scrollY={COTYPIST_SCROLL} downloading />} durationInFrames={1} fps={30} width={W} height={H} />
  </>
);

