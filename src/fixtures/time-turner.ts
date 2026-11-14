// Fictional Time Turner day for demos: Maya at Fernhill Studio, Friday Nov 6, 2026.
// Fixed strings and a deterministic generator; never Date.now(). Screens are drawn mockups.
import React from 'react';
import {ScreenMockup, MockAppIcon, type ScreenMockupProps} from '../screens/time-turner/ScreenMockups';
import type {TimeTurnerApp, TimeTurnerCapture} from '../screens/time-turner/model';
import type {RecapInsight} from '../screens/time-turner/RecapView';
import type {TimeTurnerTodo} from '../screens/time-turner/TodosView';
import type {TimeTurnerSearchResult} from '../screens/time-turner/SearchPopover';

const h = React.createElement;
const hm = (hh: number, mm: number, ss = 0) => hh * 3600 + mm * 60 + ss;

export const TT_DAY_LABEL = '6 Nov 2026'; // .dateTime.day().month(.abbreviated).year() in the owner's locale ("13 Nov 2026")
export const TT_DATE_PICKER_TEXT = '6/11/2026';
export const TT_PROVIDER_LINE = 'ChatGPT · gpt-6.1-sol';
export const TT_GENERATED_LABEL = 'Generated 6 Nov 2026 at 6:02 PM';

export const ttApps = {
  safari: {id: 'com.apple.Safari', name: 'Safari', icon: h(MockAppIcon, {from: '#3BA7F5', to: '#1665D8', glyph: 'compass'})},
  mail: {id: 'com.apple.mail', name: 'Mail', icon: h(MockAppIcon, {from: '#5AB8FF', to: '#1F7AE0', glyph: 'envelope'})},
  xcode: {id: 'com.apple.dt.Xcode', name: 'Xcode', icon: h(MockAppIcon, {from: '#4C8DF6', to: '#2B4FC9', glyph: 'hammer'})},
  notes: {id: 'com.apple.Notes', name: 'Notes', icon: h(MockAppIcon, {from: '#FFD84D', to: '#F2B705', glyph: 'note'})},
  keynote: {id: 'com.apple.iWork.Keynote', name: 'Keynote', icon: h(MockAppIcon, {from: '#53A8F7', to: '#2C6FDB', glyph: 'chart'})},
  messages: {id: 'com.apple.MobileSMS', name: 'Messages', icon: h(MockAppIcon, {from: '#5EE07A', to: '#22B845', glyph: 'bubble'})},
  terminal: {id: 'com.apple.Terminal', name: 'Terminal', icon: h(MockAppIcon, {from: '#4A4A4F', to: '#1C1C1E', glyph: 'prompt'})},
} satisfies Record<string, TimeTurnerApp>;

interface Session {
  app: TimeTurnerApp;
  start: number;
  end: number;
  windowTitle: string;
  text: string;
  screen: Omit<ScreenMockupProps, 'variant'>;
}

const sessions: Session[] = [
  {
    app: ttApps.mail, start: hm(9, 1, 14), end: hm(9, 23, 40), windowTitle: 'Inbox — Fernhill',
    text: 'Priya Raman — Q4 pricing for Atlas. Can you look at the Studio tier before Monday? Conversion on Team is up, Studio is flat.',
    screen: {kind: 'mail', title: 'Inbox — Fernhill', heading: 'Q4 pricing for Atlas', lines: ['Hi Maya,', 'Can you look at the Studio tier before Monday’s review?', 'Team conversion is up to 6.8%, Studio is flat at 3.2%.', 'I think the trial length is the lever.', '— Priya']},
  },
  {
    app: ttApps.safari, start: hm(9, 24, 5), end: hm(10, 9, 30), windowTitle: 'Q4 pricing review — Fernhill Wiki',
    text: 'Q4 pricing review. Solo $9 · Team $16 · Studio $24. Trial 14 days. Q3 conversion Team 6.8%, Studio 3.2%. Proposal: extend Studio trial to 21 days.',
    screen: {kind: 'browser', title: 'Q4 pricing review — Fernhill Wiki', heading: 'Q4 pricing review', lines: ['Owner: Priya Raman · Updated Nov 5', 'Studio converts at half the Team rate in Q3.', 'Proposal: extend the Studio trial to 21 days for teams of five or more.', 'Open question: keep the $24 seat price?']},
  },
  {
    app: ttApps.messages, start: hm(10, 12, 2), end: hm(10, 19, 50), windowTitle: 'Dev Patel',
    text: 'Dev Patel: permission step still skips on first launch. Maya: I’ll take it after standup. Dev: thanks, repro is in ATL-212.',
    screen: {kind: 'chat', title: 'Dev Patel', lines: ['Permission step still skips on first launch 😬', 'I’ll take it after standup', 'Repro steps are in ATL-212', 'On it — will push a fix today']},
  },
  {
    app: ttApps.xcode, start: hm(10, 31, 0), end: hm(11, 52, 20), windowTitle: 'PermissionStep.swift — Atlas',
    text: 'struct PermissionStep: View { @State var granted = false … if hasCompletedWelcome && !granted { advance() } }',
    screen: {kind: 'code', title: 'PermissionStep.swift — Atlas', dark: true, lines: ['struct PermissionStep: View {', '    @State private var granted = false', '    let onContinue: () -> Void', '    var body: some View {', '        VStack(spacing: 16) {', '            if hasCompletedWelcome && !granted {', '                PermissionPrompt(onAllow: request)', '            }', '        }', '    }', '}']},
  },
  {
    app: ttApps.notes, start: hm(12, 41, 30), end: hm(13, 4, 10), windowTitle: 'Launch checklist',
    text: 'Launch checklist — Atlas 2.4. Permission-step fix in release notes. Update pricing page. Record onboarding demo. Email beta testers.',
    screen: {kind: 'notes', title: 'Launch checklist', heading: 'Atlas 2.4 launch', lines: ['Update pricing page copy', 'Permission-step fix → release notes', 'Record onboarding demo', 'Email beta testers', 'Check App Store screenshots']},
  },
  {
    app: ttApps.keynote, start: hm(13, 5, 0), end: hm(14, 8, 40), windowTitle: 'Atlas Q4 Roadmap.key',
    text: 'Atlas Q4 Roadmap. Pricing: keep Studio at $24/seat. Trial 21 days for teams of 5+. Onboarding: permission step rebuild.',
    screen: {kind: 'slides', title: 'Atlas Q4 Roadmap.key', heading: 'Q4 pricing decisions', lines: ['Keep Studio at $24 per seat', '21-day trial for teams of five or more', 'Revisit Solo after holiday cohort']},
  },
  {
    app: ttApps.terminal, start: hm(14, 21, 10), end: hm(15, 38, 0), windowTitle: 'atlas — zsh',
    text: 'swift test --filter PermissionStepTests. Test Suite PermissionStepTests passed. 14 tests, 0 failures.',
    screen: {kind: 'terminal', title: 'atlas — zsh', dark: true, lines: ['swift test --filter PermissionStepTests', 'Building for debugging...', '[42/42] Compiling AtlasOnboarding PermissionStep.swift', 'git commit -m "Fix skipped permission step on first launch"', 'Test Suite PermissionStepTests passed', 'Executed 14 tests, with 0 failures']},
  },
  {
    app: ttApps.safari, start: hm(15, 58, 40), end: hm(16, 31, 15), windowTitle: 'Onboarding funnel — Atlas Analytics',
    text: 'Onboarding funnel. Opened app 100%. Granted permissions 64%. Created workspace 47%. Invited team 38%.',
    screen: {kind: 'analytics', title: 'Onboarding funnel — Atlas Analytics', heading: 'Onboarding funnel · last 7 days', lines: ['Biggest drop: permission step (−36%)', 'Fix ships in Atlas 2.4', 'Compare with Oct cohort']},
  },
  {
    app: ttApps.mail, start: hm(17, 9, 30), end: hm(17, 41, 5), windowTitle: 'Re: Q4 pricing for Atlas',
    text: 'Re: Q4 pricing for Atlas. Draft — Hi Priya, agreed on keeping Studio at $24. I’ll send the updated pricing table before Monday’s review.',
    screen: {kind: 'mail', title: 'Re: Q4 pricing for Atlas', heading: 'Re: Q4 pricing for Atlas', lines: ['Hi Priya,', 'Agreed on keeping Studio at $24 per seat.', 'I’ll send the updated pricing table before Monday’s review.', 'The permission-step fix should help Studio trials too.', '— Maya']},
  },
];

/** Deterministic LCG so the fixture is identical on every render. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildCaptures(): TimeTurnerCapture[] {
  const rand = lcg(20261106);
  const out: TimeTurnerCapture[] = [];
  sessions.forEach((session, si) => {
    let t = session.start;
    let n = 0;
    while (t <= session.end) {
      const variant = n;
      out.push({
        id: `tt-${si}-${n}`,
        time: t,
        app: session.app,
        windowTitle: session.windowTitle,
        text: session.text,
        image: h(ScreenMockup, {...session.screen, variant}),
      });
      n += 1;
      t += Math.round(20 + rand() * 50);
    }
  });
  return out;
}

/** The whole day, oldest first. */
export const ttCaptures: TimeTurnerCapture[] = buildCaptures();

/** Nearest capture to a wall-clock time. */
export const ttCaptureAt = (hh: number, mm: number, ss = 0): TimeTurnerCapture => {
  const t = hm(hh, mm, ss);
  return ttCaptures.reduce((best, c) => (Math.abs(c.time - t) < Math.abs(best.time - t) ? c : best), ttCaptures[0]);
};
export const ttTime = hm;

/** Hero moment: the pricing wiki page mid-morning. */
export const ttHeroCapture = ttCaptureAt(9, 47, 12);

export const ttSearchQuery = 'pricing';
export const ttSearchResults: TimeTurnerSearchResult[] = [
  ttCaptureAt(17, 22),
  ttCaptureAt(13, 31),
  ttCaptureAt(9, 47, 12),
  ttCaptureAt(9, 12),
].map((capture) => ({capture, dayLabel: TT_DAY_LABEL}));

export const ttRecapInsights: RecapInsight[] = [
  {
    section: 'work',
    text: 'Reviewed the Q4 pricing proposal for Atlas and compared the Team and Studio tiers against Q3 conversion.',
    sources: [{kind: 'capture', capture: ttCaptureAt(9, 47, 12)}, {kind: 'capture', capture: ttCaptureAt(9, 12)}],
  },
  {
    section: 'work',
    text: 'Fixed the onboarding permission step that was skipped on first launch; PermissionStepTests pass.',
    sources: [{kind: 'capture', capture: ttCaptureAt(11, 2)}, {kind: 'capture', capture: ttCaptureAt(14, 41)}],
  },
  {
    section: 'decisions',
    text: 'Keep the Studio tier at $24 per seat and extend its trial to 21 days for teams of five or more.',
    sources: [{kind: 'capture', capture: ttCaptureAt(13, 31)}, {kind: 'meeting', title: 'Pricing sync with Priya'}],
  },
  {
    section: 'followUps',
    text: 'Send Priya the updated Atlas pricing table before Monday’s review.',
    sources: [{kind: 'capture', capture: ttCaptureAt(17, 22)}],
  },
  {
    section: 'followUps',
    text: 'Add the permission-step fix to the Atlas 2.4 release notes.',
    sources: [{kind: 'capture', capture: ttCaptureAt(12, 52)}],
  },
];

export const ttTodos: TimeTurnerTodo[] = [
  {id: 'todo-1', title: 'Send Priya the updated Atlas pricing table', createdLabel: '6 Nov 2026 at 6:02 PM', reminderLabel: '7 Nov 2026 at 6:02 AM', completed: false},
  {id: 'todo-2', title: 'Add the permission-step fix to the Atlas 2.4 release notes', createdLabel: '6 Nov 2026 at 6:02 PM', completed: false},
  {id: 'todo-3', title: 'Record the onboarding demo for beta testers', createdLabel: '5 Nov 2026 at 6:00 PM', completed: false},
  {id: 'todo-4', title: 'Reply to Dev about ATL-212 repro steps', createdLabel: '5 Nov 2026 at 6:00 PM', completed: true},
];
