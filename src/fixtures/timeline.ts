// Fictional demo data for the Timeline and Dictations pages. Plausible people and companies only.
// Times are pre-formatted the way TimelineView.formatTime ("hh:mm a") prints them; day headers
// follow each page's Swift date format (Timeline: weekday-day-month en_US; Dictations: "EEE, d MMM").
import {APP_ICONS} from '../screens/timeline/appIcons';
import type {DayGroup, DictationEntry, PageStats, TargetApp, TimelineEntry} from '../screens/timeline/types';

export const FIXTURE_APPS = {
  slack: {name: 'Slack', icon: APP_ICONS.slack},
  mail: {name: 'Mail', icon: APP_ICONS.mail},
  notes: {name: 'Notes', icon: APP_ICONS.notes},
  messages: {name: 'Messages', icon: APP_ICONS.messages},
  safari: {name: 'Safari', icon: APP_ICONS.safari},
  chrome: {name: 'Google Chrome', icon: APP_ICONS.chrome},
  xcode: {name: 'Xcode', icon: APP_ICONS.xcode},
  /** Not installed on the capture Mac → app.dashed fallback, as in the real app. */
  cursor: {name: 'Cursor'},
} satisfies Record<string, TargetApp>;

const A = FIXTURE_APPS;

export const timelineStats: PageStats = {streakDays: 23, totalWords: 48210, averageWPM: 142, meetings: 37};

/** Today's dictations, newest first. */
const d = (id: string, time: string, text: string, app?: TargetApp, extra: Partial<DictationEntry> = {}): DictationEntry => ({
  kind: 'dictation',
  id,
  time,
  text,
  app,
  ...extra,
});

export const timelineDays: DayGroup[] = [
  {
    header: 'TODAY',
    entries: [
      d('d-slack-launch', '04:52 PM', "Shipped the onboarding fix to beta. Can someone on support keep an eye on the queue tonight? I'll check in first thing tomorrow.", A.slack),
      {
        kind: 'cotypist',
        id: 'c-mail-1',
        time: '04:31 PM',
        app: A.mail,
        acceptances: [
          {contextBefore: 'Thanks for the quick turnaround on the contract. ', text: "I've signed and returned it."},
          {contextBefore: 'Looking forward to ', text: 'kicking things off next Monday.'},
        ],
      },
      {
        kind: 'meeting',
        id: 'm-roadmap',
        time: '03:00 PM',
        title: 'Q1 roadmap review',
        status: 'completed',
        source: 'mac',
        durationSeconds: 2834,
        preview: 'Agreed to move offline sync ahead of the sharing redesign. Dana owns the migration plan; Theo to scope the API changes by Friday.',
      },
      d(
        'd-cursor-refactor',
        '02:18 PM',
        'Refactor the settings store so every toggle reads from one definition, then add a test that fails if two controls share an ID.',
        A.cursor,
      ),
      d('d-notes-ideas', '11:46 AM', 'Idea for the landing page: lead with the thirty second demo, then three short proof points, then pricing. Keep the hero copy under ten words.', A.notes),
      {
        kind: 'vidshot',
        id: 'v-bug',
        time: '11:05 AM',
        appName: 'Safari',
        durationMs: 48000,
        transcript: 'When I click export on the invoices page the spinner never stops, and the file shows up twice in Downloads. Happens every time after switching workspaces.',
        hasVideo: true,
      },
      d('d-mail-reply', '09:41 AM', "Hi Priya, thanks for sending the deck over. I'll review the pricing section this morning and send notes before our call at two.", A.mail),
    ],
  },
  {
    header: 'YESTERDAY',
    entries: [
      {
        kind: 'meeting',
        id: 'm-design-sync',
        time: '05:30 PM',
        title: 'Design sync with Northwind',
        status: 'completed',
        source: 'mac',
        durationSeconds: 1860,
        preview: 'Northwind wants a lighter navigation on mobile. Follow-ups: share the revised flows Wednesday and confirm the accessibility audit dates.',
      },
      {
        kind: 'quill',
        id: 'q-summary',
        time: '04:12 PM',
        turnCount: 2,
        turns: [
          {question: 'Summarize what changed in the billing doc since last week', answer: 'Annual plans now get two months free, the team tier starts at five seats, and invoices move to the first of the month.'},
          {question: 'Draft a two line note for the team', answer: 'Billing update: annual plans get two months free and the team tier starts at five seats. Invoices move to the 1st.'},
        ],
      },
      d('d-messages', '01:20 PM', 'Running ten minutes late, grab us a table by the window if you can.', A.messages),
      d('d-ios', '08:55 AM', 'Remember to book the venue for the offsite and ask Marco about the projector.', undefined, {source: 'ios'}),
    ],
  },
];

/** Dictations page: dictation rows only, with the "EEE, d MMM" header style for older days. */
export const dictationDays: DayGroup<DictationEntry>[] = [
  {
    header: 'TODAY',
    entries: [
      d('d-slack-launch', '04:52 PM', "Shipped the onboarding fix to beta. Can someone on support keep an eye on the queue tonight? I'll check in first thing tomorrow.", A.slack),
      d(
        'd-cursor-refactor',
        '02:18 PM',
        'Refactor the settings store so every toggle reads from one definition, then add a test that fails if two controls share an ID.',
        A.cursor,
      ),
      d(
        'd-notes-long',
        '11:46 AM',
        'Idea for the landing page: lead with the thirty second demo, then three short proof points, then pricing. Keep the hero copy under ten words. For the proof points, use the onboarding numbers from the beta cohort, the support response time, and one quote from a design lead. Pricing should show the annual discount by default.',
        A.notes,
      ),
      d('d-mail-reply', '09:41 AM', "Hi Priya, thanks for sending the deck over. I'll review the pricing section this morning and send notes before our call at two.", A.mail),
    ],
  },
  {
    header: 'YESTERDAY',
    entries: [
      d('d-chrome', '06:03 PM', 'Search for flights from Lisbon to Berlin on the twelfth, morning departures only.', A.chrome),
      d('d-messages', '01:20 PM', 'Running ten minutes late, grab us a table by the window if you can.', A.messages),
      d('d-xcode', '10:34 AM', 'Add a guard so the sync button stays disabled while a sync is already in progress.', A.xcode),
    ],
  },
  {
    header: 'SAT, 7 NOV',
    entries: [
      d('d-ios', '08:55 AM', 'Remember to book the venue for the offsite and ask Marco about the projector.', undefined, {source: 'ios'}),
    ],
  },
];

/** Every timeline entry id in display order (handy for visibleCount choreography). */
export const timelineEntryIds = timelineDays.flatMap((day) => day.entries.map((e: TimelineEntry) => e.id));
