// Gallery: Meetings + Chat (v0.8.6) inside the 1120×790 dashboard content rect.
import React from 'react';
import {Composition} from 'remotion';
import {DashboardContent, MuesliThemeProvider, layout, type Appearance, type SidebarProps} from '../../../src';
import {KitFrame} from '../KitFrame';
import {MeetingsBrowser, MeetingDetail, MeetingMedia, LiveMeetingDetail, ScreenSourcePicker} from '../../../src/screens/meetings';
import {
  DESIGN_REVIEW,
  DESIGN_REVIEW_LIVE,
  DESIGN_REVIEW_LIVE_TRANSCRIPT,
  DESIGN_REVIEW_LIVE_PARTIAL_YOU,
  SCREEN_SOURCES,
  STUDIO_ASPECT,
  STUDIO_SOURCE_ID,
  STUDIO_SOURCE_NAME,
  StudioWindowMock,
} from '../../../src/fixtures/meeting-recording';
import {MeetingChat, DockedChatLayout, ModelPickerPopover, NativePopover, QuickActionsMenu, CitationPopover} from '../../../src/screens/chat';
import {
  MEETINGS,
  MEETING_FOLDERS,
  MEETING_USER_NAME,
  UPCOMING,
  ROADMAP_MEETING,
  ROADMAP_RELATED,
  CHAT_SESSIONS,
  CHAT_TURNS,
  CHAT_PENDING_TURN,
  CHAT_ACTIVITIES,
  CHAT_PDF,
  CHAT_FILE_QUESTION,
  CHAT_CITATIONS,
  CHAT_SOURCE_CHOICES,
} from '../../../src/fixtures/meetings';

const W = layout.windowWidth;
/** SwiftUI content below the 32pt titlebar (measured). */
const H = layout.contentHeight;

const sidebar = (selected: SidebarProps['selected'], selectedFolder?: number): SidebarProps => ({
  selected,
  userName: MEETING_USER_NAME,
  totalMeetingCount: 128,
  folders: MEETING_FOLDERS,
  meetingsExpanded: true,
  selectedFolder,
});

const Frame: React.FC<{appearance: Appearance; side: SidebarProps; children: React.ReactNode}> = ({appearance, side, children}) => (
  <KitFrame appearance={appearance}>
    <DashboardContent sidebar={side}>{children}</DashboardContent>
  </KitFrame>
);

const dockedCompact = <MeetingChat docked sessions={CHAT_SESSIONS} />;

// MARK: - Meetings

const Browser: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings')}>
    <DockedChatLayout page={<MeetingsBrowser meetings={MEETINGS} upcoming={UPCOMING} hoveredMeetingId={102} scrollY={0} />} chat={dockedCompact} />
  </Frame>
);

const BrowserScrolled: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout
      page={<MeetingsBrowser meetings={MEETINGS.filter((m) => m.folder === 'Product')} folder="Product" selectedMeetingId={102} newMeetingHovered sort="oldestFirst" filter="lastMonth" />}
      chat={dockedCompact}
    />
  </Frame>
);

const DetailNotes: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout
      page={<MeetingDetail meeting={ROADMAP_MEETING} mode="notes" recording={{currentSeconds: 862}} related={ROADMAP_RELATED} />}
      chat={dockedCompact}
    />
  </Frame>
);

const DetailTranscript: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout
      page={
        <MeetingDetail
          meeting={ROADMAP_MEETING}
          mode="transcript"
          backLabel="Back to Chat"
          referencedPassage={{kindLabel: 'Transcript', excerpt: CHAT_CITATIONS[2].excerpt}}
          highlightedMessage={8}
          contentScrollY={0}
        />
      }
      chat={dockedCompact}
    />
  </Frame>
);

// MARK: - Meeting screen recording (0.8.6)

const liveProps = {meeting: DESIGN_REVIEW_LIVE, elapsedSeconds: 404, liveTranscript: DESIGN_REVIEW_LIVE_TRANSCRIPT, partialYou: DESIGN_REVIEW_LIVE_PARTIAL_YOU};

/** Details popover open on an in-progress meeting: "Record Screen…" under the pointer. */
const LiveDetailsRecordScreen: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout page={<LiveMeetingDetail {...liveProps} mode="live" detailsOpen recordScreenState="hover" />} chat={dockedCompact} />
  </Frame>
);

/** The source-picker sheet attached to the dashboard window (sheet x = (1120 − 748) / 2, just below the titlebar). */
const ScreenPickerSheet: React.FC<{a: Appearance; displays?: boolean}> = ({a, displays}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout page={<LiveMeetingDetail {...liveProps} mode="live" media={{screen: {kind: 'awaitingConfirmation'}}} />} chat={dockedCompact} />
  </Frame>
);
const ScreenPicker: React.FC<{a: Appearance; displays?: boolean}> = ({a, displays}) => (
  <div style={{position: 'relative', width: W, height: H}}>
    <ScreenPickerSheet a={a} />
    <KitFrame appearance={a}>
      <div style={{position: 'absolute', left: (W - 748) / 2, top: 0}}>
        <ScreenSourcePicker sources={SCREEN_SOURCES} displays={displays} selectedId={displays ? 'display-1' : STUDIO_SOURCE_ID} announce={!displays} recordState={displays ? 'rest' : 'hover'} />
      </div>
    </KitFrame>
  </div>
);

const LiveRecordingScreen: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout page={<LiveMeetingDetail {...liveProps} mode="live" media={{screen: {kind: 'recording', sourceName: STUDIO_SOURCE_NAME}}} />} chat={dockedCompact} />
  </Frame>
);

const LiveScreenPaused: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout
      page={<LiveMeetingDetail {...liveProps} mode="notes" manualNotes={'Welcome screen\n- Get started button too small → try full width'} media={{screen: {kind: 'recording', sourceName: STUDIO_SOURCE_NAME, paused: true, pausedByUser: true}}} />}
      chat={dockedCompact}
    />
  </Frame>
);

const DetailScreenVideo: React.FC<{a: Appearance; mode: 'notes' | 'transcript'}> = ({a, mode}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout
      page={
        <MeetingDetail
          meeting={DESIGN_REVIEW}
          mode={mode}
          media={<MeetingMedia video={{frame: <StudioWindowMock t={0.62} />, aspect: STUDIO_ASPECT, currentSeconds: 158, durationSeconds: DESIGN_REVIEW.durationSeconds, playing: true}} />}
        />
      }
      chat={dockedCompact}
    />
  </Frame>
);

const DetailScreenVideoParts: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout
      page={
        <MeetingDetail
          meeting={DESIGN_REVIEW}
          mode="notes"
          media={
            <MeetingMedia
              clips={['Part 1 · 2:00 PM', 'Part 2 · 2:19 PM']}
              hasSeparateAudio
              mode="video"
              video={{frame: <StudioWindowMock t={0.2} />, aspect: STUDIO_ASPECT, currentSeconds: 0, durationSeconds: 1104, playing: false, height: 260}}
            />
          }
        />
      }
      chat={dockedCompact}
    />
  </Frame>
);

// MARK: - Chat

const ChatIndex: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat sessions={CHAT_SESSIONS} hoveredSessionId="s2" composer={{focused: true, text: 'What did I promise Larkspur'}} />
  </Frame>
);

const ChatConversation: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat
      sessions={CHAT_SESSIONS}
      selectedSessionId="s1"
      turns={CHAT_TURNS}
      expandedSourcesTurnId="t1"
      hoveredMessage={{turnId: 't1', role: 'assistant'}}
      scrollY={0}
    />
  </Frame>
);

const ChatSourcesScrolled: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat
      sessions={CHAT_SESSIONS}
      selectedSessionId="s1"
      turns={CHAT_TURNS}
      expandedSourcesTurnId="t1"
      hoveredMessage={{turnId: 't1', role: 'assistant'}}
      scrollY={300}
      conversationOverlay={
        <div style={{position: 'absolute', left: 120, top: 40}}>
          <NativePopover width={440} arrow="top" arrowX={250}>
            <CitationPopover citation={CHAT_CITATIONS[2]} />
          </NativePopover>
        </div>
      }
    />
  </Frame>
);

const ChatPending: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat
      sessions={[{id: 's0', title: 'Offline mode launch decisions', dateLabel: 'Nov 9'}, ...CHAT_SESSIONS.slice(1)]}
      selectedSessionId="s0"
      turns={[CHAT_PENDING_TURN]}
      phase="Search meetings"
      activities={CHAT_ACTIVITIES}
      activitiesExpanded
      shimmerSweep={0.45}
      composer={{busy: true}}
    />
  </Frame>
);

const ChatStreaming: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat sessions={CHAT_SESSIONS} selectedSessionId="s1" turns={CHAT_TURNS} activities={CHAT_ACTIVITIES.map((x) => ({...x, state: 'completed' as const}))} revealedChars={260} />
  </Frame>
);

const ChatAttachment: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat
      sessions={CHAT_SESSIONS}
      composer={{focused: true, text: CHAT_FILE_QUESTION, files: [CHAT_PDF], attachedMeetings: ['Larkspur Health — pilot kickoff'], hovered: 'send'}}
    />
  </Frame>
);

const ChatModelPicker: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat
      sessions={CHAT_SESSIONS}
      composer={{focused: true, text: 'Summarize this week', hovered: 'model'}}
      composerOverlayRight={100}
      composerOverlay={
        <div style={{marginBottom: -4}}>
          <NativePopover width={280} arrow="bottom" arrowX={200}>
            <ModelPickerPopover />
          </NativePopover>
        </div>
      }
    />
  </Frame>
);

const ChatMention: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat
      sessions={CHAT_SESSIONS}
      composer={{focused: true, text: 'Compare the proposal with @lark', mention: {query: 'lark', matches: CHAT_SOURCE_CHOICES.slice(1), index: 0}}}
    />
  </Frame>
);

const ChatMenu: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetingChat')}>
    <MeetingChat
      sessions={CHAT_SESSIONS}
      composer={{focused: true, hovered: 'plus'}}
      composerOverlayRight={50}
      composerOverlay={<div style={{marginBottom: 4}}><QuickActionsMenu highlighted={2} /></div>}
    />
  </Frame>
);

const DockedExpanded: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout
      page={<MeetingDetail meeting={ROADMAP_MEETING} mode="notes" recording={{currentSeconds: 862}} />}
      chat={
        <MeetingChat
          docked
          expanded
          sessions={CHAT_SESSIONS}
          selectedSessionId="s1"
          turns={CHAT_TURNS}
          scrollY={0}
          composer={{attachedMeetings: ['Q1 roadmap sync'], focused: true}}
        />
      }
    />
  </Frame>
);

const DockedTyping: React.FC<{a: Appearance}> = ({a}) => (
  <Frame appearance={a} side={sidebar('meetings', 1)}>
    <DockedChatLayout
      page={<MeetingDetail meeting={ROADMAP_MEETING} mode="notes" recording={{currentSeconds: 862}} />}
      chat={<MeetingChat docked sessions={CHAT_SESSIONS} composer={{attachedMeetings: ['Q1 roadmap sync'], focused: true, text: 'What are my action items from this?'}} />}
    />
  </Frame>
);

// MARK: - Reference comparison (structure of references/muesli-dev-2026-11-09/dark; fictional data,
// the capture's custom accent #3662E3 so colours can be diffed)

const REF_ACCENT = '#3662E3';
const RefFrame: React.FC<{side: SidebarProps; children: React.ReactNode}> = ({side, children}) => (
  <KitFrame appearance="dark">
    <MuesliThemeProvider appearance="dark" accent={REF_ACCENT}>
      <DashboardContent sidebar={side}>{children}</DashboardContent>
    </MuesliThemeProvider>
  </KitFrame>
);
const plainMeetings = MEETINGS.map((m) => ({...m, folder: undefined, source: undefined, status: 'completed' as const, isFollowUp: false, hasFollowUps: false, notes: m.notes || ROADMAP_MEETING.notes}));
const RefBrowser: React.FC = () => (
  <RefFrame side={sidebar('meetings')}>
    <DockedChatLayout page={<MeetingsBrowser meetings={plainMeetings} origin="all" />} chat={dockedCompact} />
  </RefFrame>
);
const RefChat: React.FC = () => (
  <RefFrame side={sidebar('meetingChat')}>
    <MeetingChat sessions={CHAT_SESSIONS.slice(0, 2)} />
  </RefFrame>
);

const comps: Array<[string, React.FC<{a: Appearance}>, Appearance[]]> = [
  ['Meetings-browser', Browser, ['dark', 'light']],
  ['Meetings-folder', BrowserScrolled, ['dark']],
  ['Meetings-detail-notes', DetailNotes, ['dark', 'light']],
  ['Meetings-detail-transcript', DetailTranscript, ['dark', 'light']],
  ['Meetings-live-details-record-screen', LiveDetailsRecordScreen, ['dark', 'light']],
  ['Meetings-screen-picker', ScreenPicker, ['dark', 'light']],
  ['Meetings-screen-picker-displays', ({a}) => <ScreenPicker a={a} displays />, ['dark']],
  ['Meetings-live-recording-screen', LiveRecordingScreen, ['dark', 'light']],
  ['Meetings-live-screen-paused', LiveScreenPaused, ['dark']],
  ['Meetings-detail-screen-video', ({a}) => <DetailScreenVideo a={a} mode="transcript" />, ['dark', 'light']],
  ['Meetings-detail-screen-video-notes', ({a}) => <DetailScreenVideo a={a} mode="notes" />, ['dark']],
  ['Meetings-detail-screen-video-parts', DetailScreenVideoParts, ['dark']],
  ['Chat-index', ChatIndex, ['dark', 'light']],
  ['Chat-conversation', ChatConversation, ['dark', 'light']],
  ['Chat-citation', ChatSourcesScrolled, ['dark']],
  ['Chat-pending', ChatPending, ['dark']],
  ['Chat-streaming', ChatStreaming, ['dark']],
  ['Chat-attachment', ChatAttachment, ['dark', 'light']],
  ['Chat-model-picker', ChatModelPicker, ['dark', 'light']],
  ['Chat-mention', ChatMention, ['dark']],
  ['Chat-quick-actions', ChatMenu, ['dark']],
  ['Chat-docked-expanded', DockedExpanded, ['dark', 'light']],
  ['Chat-docked-typing', DockedTyping, ['dark']],
];

export const Root: React.FC = () => (
  <>
    <Composition id="Ref-meetings-dark" component={RefBrowser} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="Ref-chat-dark" component={RefChat} durationInFrames={1} fps={30} width={W} height={H} />
    {comps.flatMap(([id, C, apps]) =>
      apps.map((a) => <Composition key={`${id}-${a}`} id={`${id}-${a}`} component={() => <C a={a} />} durationInFrames={1} fps={30} width={W} height={H} />),
    )}
  </>
);

