// Fictional demo data for meeting screen recording (0.8.6). Every person, app and product is invented.
// `StudioWindowMock` is demo imagery (the window being shared in the meeting), not Muesli UI.
import React from 'react';
import type {MeetingData} from '../screens/meetings/types';
import type {ScreenSourceOption} from '../screens/meetings/ScreenSourcePicker';
import {MockAppIcon, ScreenMockup} from '../screens/time-turner/ScreenMockups';

// MARK: - The shared window: "Canvas", a fictional design tool, showing the Atlas onboarding prototype

const SANS = `-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif`;
export const STUDIO_ASPECT = 1440 / 900;

const lerp = (a: number, b: number, x: number) => a + (b - a) * Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * A fictional design tool window (1440×900, scales to fit its box). `t` 0→1 is the playback position
 * of the recorded clip: the presenter's cursor moves to the welcome screen's button, a comment pin appears,
 * and the button is widened to full width.
 */
export const StudioWindowMock: React.FC<{t?: number}> = ({t = 0}) => {
  const W = 1440;
  const H = 900;
  const grow = smooth(seg(t, 0.55, 0.8));
  const comment = seg(t, 0.28, 0.36);
  // Cursor path (canvas coordinates).
  const cx = t < 0.3 ? lerp(1010, 430, smooth(seg(t, 0, 0.3))) : t < 0.55 ? lerp(430, 470, seg(t, 0.3, 0.55)) : lerp(470, 515, smooth(seg(t, 0.55, 0.8)));
  const cy = t < 0.3 ? lerp(330, 640, smooth(seg(t, 0, 0.3))) : t < 0.55 ? lerp(640, 645, seg(t, 0.3, 0.55)) : 646;
  const phone = (x: number, label: string, body: React.ReactNode) => (
    <g transform={`translate(${x} 214)`}>
      <text x={0} y={-14} fontSize={15} fill="#A7A8AE" fontFamily={SANS}>{label}</text>
      <rect width={250} height={500} rx={28} fill="#F7F3EC" />
      {body}
    </g>
  );
  const btnW = lerp(150, 206, grow);
  const btnH = lerp(40, 50, grow);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{display: 'block'}}>
      <rect width={W} height={H} rx={20} fill="#1C1D20" />
      {/* titlebar */}
      <rect width={W} height={52} rx={20} fill="#232428" />
      <rect y={30} width={W} height={22} fill="#232428" />
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => <circle key={c} cx={26 + i * 22} cy={26} r={7} fill={c} />)}
      <text x={W / 2} y={32} textAnchor="middle" fontSize={16} fontWeight={600} fill="#E6E6EA" fontFamily={SANS}>Onboarding v3 — Prototype</text>
      <rect x={1290} y={13} width={124} height={27} rx={8} fill="#6D5CE8" />
      <text x={1352} y={31} textAnchor="middle" fontSize={14} fontWeight={600} fill="#FFFFFF" fontFamily={SANS}>Present</text>
      {/* layers */}
      <rect x={0} y={52} width={240} height={H - 52} fill="#202125" />
      <text x={22} y={88} fontSize={13} fontWeight={700} fill="#8E8F96" fontFamily={SANS} letterSpacing={1}>LAYERS</text>
      {['01 Welcome', 'Illustration', 'Headline', 'Get started', '02 Choose a plan', '03 All set'].map((s, i) => {
        const child = i >= 1 && i <= 3;
        const sel = i === 3;
        return (
          <g key={s}>
            {sel ? <rect x={10} y={104 + i * 34} width={220} height={28} rx={6} fill="#3A3570" /> : null}
            <text x={child ? 44 : 22} y={123 + i * 34} fontSize={15} fill={sel ? '#FFFFFF' : child ? '#B9BAC0' : '#E6E6EA'} fontWeight={child ? 400 : 600} fontFamily={SANS}>{s}</text>
          </g>
        );
      })}
      {/* inspector */}
      <rect x={1200} y={52} width={240} height={H - 52} fill="#202125" />
      <text x={1222} y={88} fontSize={13} fontWeight={700} fill="#8E8F96" fontFamily={SANS} letterSpacing={1}>DESIGN</text>
      {[['W', String(Math.round(btnW))], ['H', String(Math.round(btnH))]].map(([k, v], i) => (
        <g key={k} transform={`translate(${1222 + i * 104} 106)`}>
          <rect width={94} height={32} rx={7} fill="#2B2C31" />
          <text x={12} y={21} fontSize={14} fill="#8E8F96" fontFamily={SANS}>{k}</text>
          <text x={34} y={21} fontSize={14} fill="#E6E6EA" fontFamily={SANS}>{v}</text>
        </g>
      ))}
      <text x={1222} y={176} fontSize={14} fill="#8E8F96" fontFamily={SANS}>Fill</text>
      <rect x={1222} y={188} width={198} height={32} rx={7} fill="#2B2C31" />
      <rect x={1232} y={196} width={16} height={16} rx={4} fill="#2F6F4F" />
      <text x={1258} y={209} fontSize={14} fill="#E6E6EA" fontFamily={SANS}>Pine 600</text>
      <text x={1222} y={252} fontSize={14} fill="#8E8F96" fontFamily={SANS}>Corner radius</text>
      <rect x={1222} y={264} width={198} height={32} rx={7} fill="#2B2C31" />
      <text x={1234} y={285} fontSize={14} fill="#E6E6EA" fontFamily={SANS}>12</text>
      {/* canvas */}
      <rect x={240} y={52} width={960} height={H - 52} fill="#2A2B30" />
      {Array.from({length: 18}, (_, i) =>
        Array.from({length: 16}, (_, j) => <circle key={`${i}-${j}`} cx={262 + i * 54} cy={76 + j * 54} r={1.4} fill="#3B3C42" />),
      )}
      {phone(
        300,
        '01 Welcome',
        <g>
          <circle cx={125} cy={140} r={62} fill="#E9A26B" />
          <circle cx={150} cy={120} r={24} fill="#F6C99A" />
          <text x={125} y={256} textAnchor="middle" fontSize={22} fontWeight={700} fill="#1F2A24" fontFamily={SANS}>Welcome to Atlas</text>
          <rect x={45} y={276} width={160} height={9} rx={4.5} fill="#D9D2C6" />
          <rect x={65} y={294} width={120} height={9} rx={4.5} fill="#D9D2C6" />
          <rect x={125 - btnW / 2} y={430 - btnH / 2} width={btnW} height={btnH} rx={12} fill="#2F6F4F" />
          <text x={125} y={435} textAnchor="middle" fontSize={15} fontWeight={600} fill="#FFFFFF" fontFamily={SANS}>Get started</text>
          {/* selection */}
          <rect x={125 - btnW / 2 - 3} y={430 - btnH / 2 - 3} width={btnW + 6} height={btnH + 6} fill="none" stroke="#5B8CFF" strokeWidth={2} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
            <rect key={`${sx}${sy}`} x={125 + (sx * (btnW + 6)) / 2 - 4} y={430 + (sy * (btnH + 6)) / 2 - 4} width={8} height={8} fill="#FFFFFF" stroke="#5B8CFF" strokeWidth={1.5} />
          ))}
        </g>,
      )}
      {phone(
        600,
        '02 Choose a plan',
        <g>
          <text x={125} y={70} textAnchor="middle" fontSize={21} fontWeight={700} fill="#1F2A24" fontFamily={SANS}>Choose a plan</text>
          {['Seedling', 'Grove', 'Forest'].map((s, i) => (
            <g key={s} transform={`translate(24 ${100 + i * 92})`}>
              <rect width={202} height={78} rx={14} fill={i === 1 ? '#E3EFE7' : '#FFFFFF'} stroke={i === 1 ? '#2F6F4F' : '#E2DBD0'} strokeWidth={i === 1 ? 2 : 1} />
              <text x={18} y={34} fontSize={16} fontWeight={700} fill="#1F2A24" fontFamily={SANS}>{s}</text>
              <rect x={18} y={48} width={110} height={8} rx={4} fill="#D9D2C6" />
            </g>
          ))}
          <rect x={24} y={405} width={202} height={50} rx={12} fill="#2F6F4F" />
          <text x={125} y={436} textAnchor="middle" fontSize={15} fontWeight={600} fill="#FFFFFF" fontFamily={SANS}>Continue</text>
        </g>,
      )}
      {phone(
        900,
        '03 All set',
        <g>
          <circle cx={125} cy={170} r={50} fill="#2F6F4F" />
          <path d="M103 170 L119 186 L149 154" fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <text x={125} y={268} textAnchor="middle" fontSize={22} fontWeight={700} fill="#1F2A24" fontFamily={SANS}>You’re all set</text>
          <rect x={55} y={288} width={140} height={9} rx={4.5} fill="#D9D2C6" />
          <rect x={60} y={405} width={130} height={50} rx={12} fill="#2F6F4F" />
          <text x={125} y={436} textAnchor="middle" fontSize={15} fontWeight={600} fill="#FFFFFF" fontFamily={SANS}>Open app</text>
        </g>,
      )}
      {/* comment pin */}
      {comment > 0 ? (
        <g opacity={comment} transform={`translate(330 548)`}>
          <circle r={17} fill="#E46B8A" />
          <text y={5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#FFFFFF" fontFamily={SANS}>AO</text>
          <rect x={26} y={-20} width={196} height={40} rx={10} fill="#FFFFFF" stroke="#E2DBD0" />
          <text x={40} y={5} fontSize={15} fill="#1F2A24" fontFamily={SANS}>Full width, like plans?</text>
        </g>
      ) : null}
      {/* presenter cursor */}
      <path transform={`translate(${cx} ${cy})`} d="M0 0 L0 26 L7 19 L12 31 L17 29 L12 17 L22 17 Z" fill="#FFFFFF" stroke="#000000" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
};

// MARK: - The meeting

const designReviewNotes = `## Meeting Summary
The team reviewed the Atlas onboarding v3 prototype. Everyone liked the new illustration; the welcome button moves to full width to match the plan screen.

## Key Discussion Points
- The **Get started** button read as secondary at 150 points wide.
- The plan picker's full-width button tested better in last week's sessions.
- The “All set” screen should link straight to the first project.

## Action Items
- [ ] Ana: carry the full-width button to all three screens by Thursday
- [ ] Kenji: update the plan cards to the new spacing`;

const designReviewTranscript = `[14:02:11] Speaker 1: Okay, I'm sharing the Canvas file now. Can everyone see the prototype?
[14:02:16] You: Yes, we can see it. Start with the welcome screen.
[14:02:24] Speaker 1: Here's the new illustration, and the headline is shorter.
[14:02:31] Speaker 2: The illustration works. The Get started button feels small, though.
[14:02:38] You: Agreed. Could it be full width, like the plan screen?
[14:02:46] Speaker 1: Trying it now. Full width, fifty points tall.
[14:02:53] Speaker 2: That's much better. It finally reads as the main action.
[14:03:01] You: Let's carry that to all three screens before Thursday.
[14:03:09] Speaker 1: I'll update the plan cards to match.`;

export const DESIGN_REVIEW: MeetingData = {
  id: 301,
  title: 'Design review: Atlas onboarding',
  startLabel: 'Nov 10, 2026 at 2:00:08 PM',
  durationSeconds: 1724,
  wordCount: 3912,
  status: 'completed',
  folder: 'Product',
  participants: ['Ana Ortiz', 'Kenji Mori', 'Priya Raman'],
  notes: designReviewNotes,
  transcript: designReviewTranscript,
};

/** The same meeting while it is being recorded (status .recording, no notes yet). */
export const DESIGN_REVIEW_LIVE: MeetingData = {...DESIGN_REVIEW, status: 'recording', notes: '', wordCount: 0};

/** Live transcript (committed so far) and the provisional tails, as `LiveTranscriptView` receives them. */
export const DESIGN_REVIEW_LIVE_TRANSCRIPT = designReviewTranscript.split('\n').slice(0, 4).join('\n');
export const DESIGN_REVIEW_LIVE_PARTIAL_YOU = 'Agreed. Could it be full width, like the';
export const DESIGN_REVIEW_LIVE_PARTIAL_OTHERS = '';

/** `sourceName` = "\(title) — \(subtitle)" (VisualMemoryController.requestRecording). */
export const STUDIO_SOURCE_NAME = 'Canvas — Onboarding v3 — Prototype';

const thumb = (node: React.ReactNode) => node;
const icon = (from: string, to: string, glyph: React.ComponentProps<typeof MockAppIcon>['glyph']) => <MockAppIcon from={from} to={to} glyph={glyph} />;

/**
 * The picker's sources: on-screen windows of regular apps (sorted by app name), then each display
 * ("Display N", "W × H"). Muesli's own windows are excluded.
 */
export const SCREEN_SOURCES: ScreenSourceOption[] = [
  {id: 'window-41', title: 'Atlas', subtitle: 'Fernhill wiki — Pricing', isDisplay: false, icon: icon('#4A90E2', '#2F5DB8', 'compass'), thumbnail: thumb(<ScreenMockup kind="browser" title="Atlas" heading="Pricing" lines={['Plans and limits', 'Billing FAQ']} />)},
  {id: 'window-52', title: 'Canvas', subtitle: 'Onboarding v3 — Prototype', isDisplay: false, icon: icon('#8B7CF6', '#5B48D6', 'graph'), thumbnail: thumb(<StudioWindowMock t={0} />)},
  {id: 'window-17', title: 'Huddle', subtitle: 'Design review', isDisplay: false, icon: icon('#34C38F', '#1E8E64', 'bubble'), thumbnail: thumb(<ScreenMockup kind="chat" title="Huddle" heading="Design review" lines={['Ana Ortiz is presenting', 'Kenji Mori', 'Priya Raman']} dark />)},
  {id: 'window-23', title: 'Ledger', subtitle: 'Q4 activation metrics', isDisplay: false, icon: icon('#F5A623', '#D9771A', 'chart'), thumbnail: thumb(<ScreenMockup kind="analytics" title="Ledger" heading="Activation" lines={[]} />)},
  {id: 'window-60', title: 'Notebook', subtitle: 'Review agenda', isDisplay: false, icon: icon('#FFCC4D', '#E0A800', 'note'), thumbnail: thumb(<ScreenMockup kind="notes" title="Notebook" heading="Review agenda" lines={['Welcome screen', 'Plan picker', 'All set']} />)},
  {id: 'window-8', title: 'Postbox', subtitle: 'Inbox — 3 unread', isDisplay: false, icon: icon('#5AC8FA', '#2D8FD5', 'envelope'), thumbnail: thumb(<ScreenMockup kind="mail" title="Postbox" heading="Inbox" lines={['Onboarding copy review', 'Plan pricing update', 'Thursday handoff']} />)},
  {id: 'display-1', title: 'Display 1', subtitle: '1512 × 982', isDisplay: true, thumbnail: thumb(<StudioWindowMock t={0} />)},
  {id: 'display-2', title: 'Display 2', subtitle: '2560 × 1440', isDisplay: true, thumbnail: thumb(<ScreenMockup kind="slides" title="Deck" heading="Onboarding v3" lines={[]} />)},
];
export const STUDIO_SOURCE_ID = 'window-52';
