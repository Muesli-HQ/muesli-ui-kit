// Fictional Meetings + Chat demo data. Every person, company and number here is invented.
// Fixed strings only (no Date.now()): "today" is Monday, Nov 9, 2026 in these fixtures.
import type {MeetingData, UpcomingEventGroup} from '../screens/meetings/types';
import type {RelatedMeeting} from '../screens/meetings/MeetingNotes';
import type {ChatCitation, ChatFile, ChatSession, ChatSourceChoice, ChatTurn, ChatActivity} from '../screens/chat/types';

export const MEETING_USER_NAME = 'Maya';

export const MEETING_FOLDERS = [
  {name: 'Customer calls', count: 48},
  {name: 'Product', count: 63},
  {name: 'Hiring', count: 17},
];

// MARK: - Meetings

const roadmapNotes = `## Meeting Summary
The team agreed to ship offline mode in the 2.4 release and move the Android redesign to Q2. Sam flagged the sync engine migration as the main schedule risk.

## Key Discussion Points
- Offline mode is feature-complete behind a flag; the beta **crash rate** is 0.4%.
- The Android redesign needs two more weeks of research before estimates are reliable.
- Support volume on billing questions doubled after the pricing change.

## Decisions Made
- Ship offline mode in **2.4**, targeting January 14.
- Move the Android redesign to Q2.

## Action Items
- [ ] Sam: write the sync engine migration plan by Nov 12
- [ ] Ana: draft billing FAQ updates with Support
- [x] Jordan: share the beta crash report

## Notable Quotes
- "If the migration slips, offline mode slips with it." — Sam`;

const roadmapTranscript = `[10:02:31] You: Okay, let's start with offline mode since that's the big one for 2.4.
[10:02:44] Speaker 1: It's feature-complete behind the flag. Beta crash rate is sitting at 0.4 percent.
[10:03:02] Speaker 2: That's higher than I'd like. Can we get it under 0.2 before we ship?
[10:03:15] You: Let's make that the bar. Jordan, can you share the crash report after this?
[10:03:21] Speaker 2: Already on it, I'll post it in the channel.
[10:09:12] Speaker 1: Most of the crashes are in the conflict resolver when two devices edit the same note.
[10:14:05] You: Then I think we commit to 2.4 for offline mode and push the Android redesign to Q2.
[10:14:18] Speaker 2: Agreed. Research needs two more weeks anyway.
[10:21:47] Speaker 1: The one thing I'm worried about is the sync engine migration. If the migration slips, offline mode slips with it.
[10:22:03] You: Can you write up the migration plan by Thursday?
[10:22:09] Speaker 1: Yes, I'll have it by the twelfth.`;

const larkspurNotes = `## Meeting Summary
Kickoff for the Larkspur Health pilot: 40 clinicians across two sites starting December 1. Their IT team needs a security review and an audit of offline access before rollout.

## Key Discussion Points
- Pilot scope: 40 clinicians, Cedar Park and Riverside clinics.
- IT requires SSO and an audit log export before go-live.
- Offline access must be reviewed by their security lead, Lena.

## Decisions Made
- Pilot starts **December 1** if the security review clears.

## Action Items
- [ ] Maya: send the security questionnaire by Nov 9
- [ ] Tom: confirm clinician list for both sites
- [ ] Priya: schedule the data walkthrough`;

const larkspurTranscript = `[14:02:10] Speaker 1: Thanks for making time. We're excited to get this in front of clinicians.
[14:02:26] You: Likewise. Let's confirm scope first: forty clinicians across two sites?
[14:02:39] Speaker 1: Right, Cedar Park and Riverside. December first if everything lines up.
[14:31:20] Speaker 2: Before rollout, our security lead needs to audit offline access. Anything stored on the device is in scope.
[14:31:48] You: Understood. I'll send over our security questionnaire today.`;

export const MEETINGS: MeetingData[] = [
  {
    id: 104,
    title: 'Larkspur Health — security questionnaire',
    startLabel: 'Nov 9, 2026 at 11:15:30 AM',
    durationSeconds: 1265,
    wordCount: 2140,
    status: 'processing',
    folder: 'Customer calls',
    isFollowUp: true,
    notes: '',
    transcript: '[11:15:42] You: Let\'s go through the questionnaire section by section.',
    participants: ['Lena Fischer', 'Tom Okafor'],
  },
  {
    id: 101,
    title: 'Larkspur Health — pilot kickoff',
    startLabel: 'Nov 6, 2026 at 2:00:41 PM',
    durationSeconds: 2772,
    wordCount: 6120,
    status: 'completed',
    folder: 'Customer calls',
    source: 'recording',
    hasFollowUps: true,
    notes: larkspurNotes,
    transcript: larkspurTranscript,
    participants: ['Priya Raman', 'Tom Okafor', 'Lena Fischer'],
  },
  {
    id: 102,
    title: 'Q1 roadmap sync',
    startLabel: 'Nov 5, 2026 at 10:02:14 AM',
    durationSeconds: 2320,
    wordCount: 5084,
    status: 'completed',
    folder: 'Product',
    source: 'recording',
    notes: roadmapNotes,
    transcript: roadmapTranscript,
    participants: ['Jordan Lee', 'Sam Whitaker', 'Ana Ortiz', 'Kenji Mori'],
  },
  {
    id: 103,
    title: 'Design review: Chat composer',
    startLabel: 'Nov 4, 2026 at 4:30:05 PM',
    durationSeconds: 1620,
    wordCount: 3310,
    status: 'completed',
    folder: 'Product',
    notes: `## Meeting Summary\nWe reviewed the new composer: attachments sit above the editor and the model picker moves into the footer. Kenji will prototype the @-mention list.`,
    transcript: '',
    participants: ['Kenji Mori', 'Ana Ortiz'],
  },
  {
    id: 105,
    title: 'Hiring sync — Senior iOS engineer',
    startLabel: 'Nov 3, 2026 at 9:30:00 AM',
    durationSeconds: 1325,
    wordCount: 2710,
    status: 'completed',
    folder: 'Hiring',
    notes: `## Meeting Summary\nThree candidates moved to onsite. The panel wants a stronger systems-design signal before making an offer.`,
    transcript: '',
    participants: ['Rosa Delgado', 'Jordan Lee'],
  },
  {
    id: 106,
    title: 'Weekly standup',
    startLabel: 'Nov 2, 2026 at 9:00:12 AM',
    durationSeconds: 900,
    wordCount: 1490,
    status: 'completed',
    source: 'imported',
    notes: `## Meeting Summary\nRelease branch is cut. QA starts Tuesday; the billing fix ships as a hotfix.`,
    transcript: '',
    participants: ['Sam Whitaker'],
  },
];

export const ROADMAP_MEETING = MEETINGS.find((m) => m.id === 102)!;
export const LARKSPUR_MEETING = MEETINGS.find((m) => m.id === 101)!;

export const UPCOMING: UpcomingEventGroup[] = [
  {dayNumber: '9', dayLabel: 'Today', dayOfWeek: 'Mon', isToday: true, events: [{title: 'Larkspur Health — data walkthrough', timeRange: '15:00 – 15:45', joinable: true}]},
  {
    dayNumber: '10',
    dayLabel: 'Tomorrow',
    dayOfWeek: 'Tue',
    isToday: false,
    events: [
      {title: 'Q1 roadmap sync', timeRange: '10:00 – 10:45', joinable: true},
      {title: '1:1 with Jordan', timeRange: '13:30 – 14:00'},
    ],
  },
];

export const ROADMAP_RELATED: RelatedMeeting[] = [
  {title: 'Design review: Chat composer', sharedNames: ['Ana Ortiz', 'Kenji Mori'], startLabel: 'Nov 4, 2026 at 4:30:05 PM'},
  {title: 'Weekly standup', sharedNames: ['Sam Whitaker'], startLabel: 'Nov 2, 2026 at 9:00:12 AM'},
];

// MARK: - Chat

export const CHAT_SESSIONS: ChatSession[] = [
  {id: 's1', title: 'Offline mode launch decisions', dateLabel: 'Nov 9'},
  {id: 's2', title: 'Larkspur pilot follow-up email', dateLabel: 'Nov 6'},
  {id: 's3', title: 'What did I promise this week?', dateLabel: 'Nov 5'},
  {id: 's4', title: 'Hiring pipeline recap', dateLabel: 'Nov 3'},
  {id: 's5', title: 'Billing support questions since the price change', dateLabel: 'Oct 29'},
];

export const CHAT_CITATIONS: ChatCitation[] = [
  {key: 'c1', meetingId: 102, title: 'Q1 roadmap sync', dateLabel: 'Nov 5, 2026', dateTimeLabel: 'Nov 5, 2026 at 10:02 AM', kind: 'generatedNotes', excerpt: 'Ship offline mode in 2.4, targeting January 14.'},
  {key: 'c2', meetingId: 102, title: 'Q1 roadmap sync', dateLabel: 'Nov 5, 2026', dateTimeLabel: 'Nov 5, 2026 at 10:02 AM', kind: 'transcript', timestamp: '10:14:05', excerpt: 'Then I think we commit to 2.4 for offline mode and push the Android redesign to Q2.'},
  {key: 'c3', meetingId: 102, title: 'Q1 roadmap sync', dateLabel: 'Nov 5, 2026', dateTimeLabel: 'Nov 5, 2026 at 10:02 AM', kind: 'transcript', timestamp: '10:21:47', excerpt: "The one thing I'm worried about is the sync engine migration. If the migration slips, offline mode slips with it."},
  {key: 'c4', meetingId: 102, title: 'Q1 roadmap sync', dateLabel: 'Nov 5, 2026', dateTimeLabel: 'Nov 5, 2026 at 10:02 AM', kind: 'transcript', timestamp: '10:03:02', excerpt: "That's higher than I'd like. Can we get it under 0.2 before we ship?"},
  {key: 'c5', meetingId: 101, title: 'Larkspur Health — pilot kickoff', dateLabel: 'Nov 6, 2026', dateTimeLabel: 'Nov 6, 2026 at 2:00 PM', kind: 'transcript', timestamp: '14:31:20', excerpt: 'Before rollout, our security lead needs to audit offline access. Anything stored on the device is in scope.'},
];

export const CHAT_ANSWER = `The team agreed to ship **offline mode in the 2.4 release**, targeting January 14 [[c1]]. The Android redesign moves to Q2 so engineers can stay on the launch [[c2]].

## What could delay it
- **Sync engine migration**: Sam called it the main schedule risk: "If the migration slips, offline mode slips with it." [[c3]]
- **Beta stability**: the crash rate is 0.4%, and Jordan wants it under 0.2% before release [[c4]].
- **Larkspur pilot**: their security lead must audit offline access before rollout [[c5]].

Next step: Sam owes the migration plan by **Nov 12** [[c1]].`;

export const CHAT_QUESTION = 'What did we decide about the offline mode launch, and what could delay it?';

export const CHAT_ACTIVITIES: ChatActivity[] = [
  {title: 'Search meetings', detail: 'offline mode launch decision', state: 'completed'},
  {title: 'Read meeting', detail: 'Q1 roadmap sync', state: 'completed'},
  {title: 'Search meetings', detail: 'offline access security review', state: 'running'},
];

/** A fixture page thumbnail (first page of a PDF), as an inline SVG. */
const pdfPage = (() => {
  const lines = Array.from({length: 9}, (_, i) => `<rect x="14" y="${44 + i * 9}" width="${i % 3 === 2 ? 70 : 104}" height="3" rx="1.5" fill="#C9CED6"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="136" height="176" viewBox="0 0 136 176"><rect width="136" height="176" fill="#FFFFFF"/><rect x="14" y="16" width="62" height="7" rx="2" fill="#2F6F5E"/><rect x="14" y="28" width="90" height="4" rx="2" fill="#8C95A3"/>${lines}<rect x="14" y="132" width="108" height="30" rx="3" fill="#E8F1EE"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
})();

export const CHAT_PDF: ChatFile = {id: 'f1', name: 'Larkspur-pilot-proposal.pdf', kind: 'pdf', sizeLabel: '2.4 MB', thumbnail: pdfPage};
export const CHAT_MARKDOWN_FILE: ChatFile = {id: 'f2', name: 'security-notes.md', kind: 'markdown', sizeLabel: '6 KB'};

export const CHAT_TURNS: ChatTurn[] = [
  {id: 't1', question: CHAT_QUESTION, answer: CHAT_ANSWER, citations: CHAT_CITATIONS, state: 'completed'},
];

export const CHAT_PENDING_TURN: ChatTurn = {id: 't1', question: CHAT_QUESTION, citations: [], state: 'finding'};

export const CHAT_FILE_QUESTION = 'Does the attached proposal cover what Larkspur asked for on the kickoff call?';

export const CHAT_SOURCE_CHOICES: ChatSourceChoice[] = [
  {id: 102, title: 'Q1 roadmap sync', dateLabel: 'Nov 5, 2026'},
  {id: 101, title: 'Larkspur Health — pilot kickoff', dateLabel: 'Nov 6, 2026'},
  {id: 104, title: 'Larkspur Health — security questionnaire', dateLabel: 'Nov 9, 2026'},
];
