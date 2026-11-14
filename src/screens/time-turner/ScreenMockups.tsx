// Fictional "focused window" screenshots and app icons for Time Turner fixtures.
// These stand in for the user's own screen history (never real captures). Each mockup is an SVG
// that scales to fit its box like `Image(nsImage:).resizable().scaledToFit()`.
// Not ported from Swift: this is demo imagery, not Muesli UI.
import React from 'react';

const SANS = `-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif`;
const MONO = `ui-monospace, 'SF Mono', Menlo, monospace`;

export type ScreenKind = 'browser' | 'mail' | 'code' | 'notes' | 'slides' | 'chat' | 'terminal' | 'analytics';

export interface ScreenMockupProps {
  kind: ScreenKind;
  /** Window title shown in the mock chrome. */
  title: string;
  /** Headline inside the document/page. */
  heading?: string;
  /** Body lines (rendered as text where the layout has room). */
  lines?: string[];
  /** Dark-appearance app window. */
  dark?: boolean;
  /** 0..n: shifts content (scroll position) so consecutive captures differ slightly. */
  variant?: number;
  /** Aspect of the captured window (width/height). */
  aspect?: number;
}

const W = 1440;

export const ScreenMockup: React.FC<ScreenMockupProps> = ({kind, title, heading = '', lines = [], dark = false, variant = 0, aspect = 1.6}) => {
  const H = Math.round(W / aspect);
  const bg = dark ? '#1E1F22' : '#FFFFFF';
  const chrome = dark ? '#2B2C30' : '#F3F3F5';
  const ink = dark ? '#E8E8EA' : '#1D1D1F';
  const sub = dark ? '#9A9AA0' : '#6E6E73';
  const rule = dark ? '#3A3B40' : '#E3E3E8';
  const bar = dark ? '#3A3B40' : '#E6E6EB';
  const scroll = (variant % 4) * 6;
  const text = (x: number, y: number, s: string, size = 22, color = ink, weight = 400, family = SANS) => (
    <text x={x} y={y} fontSize={size} fill={color} fontWeight={weight} fontFamily={family}>
      {s}
    </text>
  );
  const ghost = (x: number, y: number, w: number, h = 14) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={bar} />;
  const top = 76;
  let body: React.ReactNode = null;

  if (kind === 'browser' || kind === 'analytics') {
    body = (
      <g>
        <rect x={0} y={top} width={W} height={56} fill={chrome} />
        <rect x={420} y={top + 12} width={600} height={32} rx={10} fill={dark ? '#1E1F22' : '#FFFFFF'} stroke={rule} />
        {text(450, top + 35, 'wiki.fernhill.studio/atlas/pricing', 17, sub)}
        <rect x={0} y={top + 56} width={260} height={H} fill={dark ? '#24252A' : '#F7F7F9'} />
        {['Atlas', 'Pricing', 'Onboarding', 'Roadmap', 'Releases', 'Research'].map((s, i) => text(36, top + 110 + i * 40, s, 19, i === 1 ? ink : sub, i === 1 ? 600 : 400))}
        <g transform={`translate(0 ${-scroll})`}>
          {text(320, top + 140, heading, 40, ink, 700)}
          {kind === 'analytics' ? (
            <g>
              {[0.82, 0.64, 0.47, 0.38, 0.29].map((v, i) => (
                <g key={i}>
                  <rect x={320} y={top + 200 + i * 66} width={(W - 420) * v} height={44} rx={8} fill={['#4F7CF7', '#5C88F8', '#6B94F9', '#7BA0FA', '#8CACFB'][i]} />
                  {text(336, top + 229 + i * 66, ['Opened app', 'Granted permissions', 'Created workspace', 'Invited team', 'First project'][i], 18, '#FFFFFF', 600)}
                </g>
              ))}
              {lines.slice(0, 3).map((l, i) => text(320, top + 580 + i * 36, l, 20, sub))}
            </g>
          ) : (
            <g>
              {lines.map((l, i) => text(320, top + 200 + i * 36, l, 21, i % 4 === 0 ? ink : sub))}
              <rect x={320} y={top + 220 + lines.length * 36} width={W - 420} height={200} rx={10} fill="none" stroke={rule} />
              {['Tier', 'Seat price', 'Trial', 'Q3 conv.'].map((s, i) => text(344 + i * 250, top + 260 + lines.length * 36, s, 18, sub, 600))}
              {[
                ['Solo', '$9', '14 days', '4.1%'],
                ['Team', '$16', '14 days', '6.8%'],
                ['Studio', '$24', '21 days', '3.2%'],
              ].map((r, j) => r.map((s, i) => text(344 + i * 250, top + 310 + lines.length * 36 + j * 40, s, 19, ink)))}
            </g>
          )}
        </g>
      </g>
    );
  } else if (kind === 'mail') {
    body = (
      <g>
        <rect x={0} y={top} width={420} height={H} fill={dark ? '#24252A' : '#F7F7F9'} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i} transform={`translate(0 ${i * 96})`}>
            <rect x={12} y={top + 12} width={396} height={84} rx={10} fill={i === 1 ? (dark ? '#2F4A7A' : '#DCE6FB') : 'none'} />
            {text(36, top + 44, ['Dev Patel', 'Priya Raman', 'Atlas Support', 'Jonah Weiss', 'Calendar', 'Lena Ortiz', 'Billing'][i], 19, ink, 600)}
            {ghost(36, top + 62, 220 + ((i * 37) % 120), 12)}
          </g>
        ))}
        {text(470, top + 70, heading, 30, ink, 700)}
        {text(470, top + 108, 'Priya Raman · to me', 18, sub)}
        <line x1={470} x2={W - 50} y1={top + 130} y2={top + 130} stroke={rule} />
        {lines.map((l, i) => text(470, top + 180 + i * 36 - scroll / 2, l, 21, ink))}
      </g>
    );
  } else if (kind === 'code' || kind === 'terminal') {
    const codeBg = '#1F2023';
    body = (
      <g>
        <rect x={0} y={top} width={W} height={H} fill={codeBg} />
        {kind === 'code' ? <rect x={0} y={top} width={280} height={H} fill="#26272B" /> : null}
        {kind === 'code'
          ? ['Atlas', '  Onboarding', '    OnboardingFlow.swift', '    PermissionStep.swift', '    WelcomeView.swift', '  Billing', '  Tests'].map((s, i) =>
              text(24, top + 44 + i * 34, s, 17, i === 2 ? '#FFFFFF' : '#9A9AA0', i === 2 ? 600 : 400),
            )
          : null}
        <g transform={`translate(${kind === 'code' ? 300 : 30} ${-scroll})`}>
          {Array.from({length: 22}, (_, i) => {
            const l = lines[i % Math.max(1, lines.length)] ?? '';
            const colorsCycle = ['#FC5FA3', '#D0BF69', '#67B7A4', '#E8E8EA', '#A167E6', '#E8E8EA'];
            return (
              <g key={i}>
                {kind === 'code' ? text(0, top + 50 + i * 32, String(i + 41), 16, '#5D5E63', 400, MONO) : null}
                {text(kind === 'code' ? 56 : 0, top + 50 + i * 32, kind === 'terminal' && i % 3 === 0 ? `maya@studio atlas % ${l}` : l, 18, kind === 'terminal' ? (i % 3 === 0 ? '#E8E8EA' : '#9A9AA0') : colorsCycle[i % colorsCycle.length], 400, MONO)}
              </g>
            );
          })}
        </g>
      </g>
    );
  } else if (kind === 'notes') {
    body = (
      <g>
        <rect x={0} y={top} width={300} height={H} fill={dark ? '#24252A' : '#F5F2E8'} />
        {['Launch checklist', 'Release notes 2.4', 'Pricing questions', '1:1 Dev'].map((s, i) => (
          <g key={i}>
            <rect x={12} y={top + 16 + i * 74} width={276} height={64} rx={8} fill={i === 0 ? '#F5C542' : 'none'} opacity={i === 0 ? 0.55 : 1} />
            {text(28, top + 54 + i * 74, s, 19, ink, 600)}
          </g>
        ))}
        {text(360, top + 80, heading, 36, ink, 700)}
        {lines.map((l, i) => (
          <g key={i}>
            <circle cx={374} cy={top + 140 + i * 44 - 7} r={9} fill="none" stroke={i < 2 ? '#E0A100' : sub} strokeWidth={2} />
            {text(396, top + 140 + i * 44, l, 22, ink)}
          </g>
        ))}
      </g>
    );
  } else if (kind === 'slides') {
    body = (
      <g>
        <rect x={0} y={top} width={220} height={H} fill={chrome} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={30} y={top + 24 + i * 110} width={160} height={90} rx={4} fill="#2C3E66" stroke={i === 2 ? '#4F7CF7' : 'none'} strokeWidth={4} />
        ))}
        <rect x={0} y={top} width={W} height={H} fill={dark ? '#141416' : '#E8E8EC'} transform="translate(220 0)" />
        <rect x={300} y={top + 60} width={W - 380} height={(W - 380) * 0.5625} rx={6} fill="#2C3E66" />
        {text(360, top + 170, heading, 48, '#FFFFFF', 700)}
        {lines.map((l, i) => text(360, top + 250 + i * 48, '•  ' + l, 26, '#D6DFFE'))}
      </g>
    );
  } else if (kind === 'chat') {
    body = (
      <g>
        <rect x={0} y={top} width={340} height={H} fill={dark ? '#24252A' : '#F7F7F9'} />
        {['Dev Patel', 'Priya Raman', 'Design crit', 'Lena Ortiz'].map((s, i) => (
          <g key={i}>
            <rect x={12} y={top + 14 + i * 80} width={316} height={68} rx={10} fill={i === 0 ? '#0A84FF' : 'none'} />
            <circle cx={50} cy={top + 48 + i * 80} r={20} fill={['#F59E0B', '#34D399', '#8B5CF6', '#EF4444'][i]} />
            {text(84, top + 55 + i * 80, s, 19, i === 0 ? '#FFFFFF' : ink, 600)}
          </g>
        ))}
        {lines.map((l, i) => {
          const mine = i % 2 === 1;
          const w = Math.min(640, 30 + l.length * 10.5);
          const y = top + 60 + i * 84 - scroll / 2;
          return (
            <g key={i}>
              <rect x={mine ? W - 40 - w : 380} y={y} width={w} height={56} rx={22} fill={mine ? '#0A84FF' : dark ? '#3A3B40' : '#E9E9EB'} />
              {text((mine ? W - 40 - w : 380) + 20, y + 36, l, 19, mine ? '#FFFFFF' : ink)}
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{display: 'block'}}>
      <defs>
        <clipPath id={`win-${kind}-${variant}`}>
          <rect width={W} height={H} rx={20} />
        </clipPath>
      </defs>
      <g clipPath={`url(#win-${kind}-${variant})`}>
        <rect width={W} height={H} fill={bg} />
        {body}
        <rect width={W} height={top} fill={chrome} />
        <line x1={0} x2={W} y1={top} y2={top} stroke={rule} />
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
          <circle key={c} cx={34 + i * 30} cy={38} r={10} fill={c} />
        ))}
        {text(W / 2 - title.length * 5.2, 46, title, 19, sub, 600)}
      </g>
      <rect width={W} height={H} rx={20} fill="none" stroke={dark ? '#45464C' : '#D2D2D7'} strokeWidth={2} />
    </svg>
  );
};

/** A stylised, fictional app icon (macOS-style rounded square). Fills its box. */
export const MockAppIcon: React.FC<{from: string; to: string; glyph: 'compass' | 'envelope' | 'hammer' | 'note' | 'chart' | 'bubble' | 'prompt' | 'graph'}> = ({from, to, glyph}) => {
  const id = `g-${from.slice(1)}-${to.slice(1)}-${glyph}`;
  const w = '#FFFFFF';
  const g: Record<string, React.ReactNode> = {
    compass: (
      <g>
        <circle cx={50} cy={50} r={26} fill="none" stroke={w} strokeWidth={5} />
        <path d="M60 40 L54 54 L40 60 L46 46 Z" fill={w} />
      </g>
    ),
    envelope: (
      <g fill="none" stroke={w} strokeWidth={5} strokeLinejoin="round">
        <rect x={24} y={32} width={52} height={36} rx={5} />
        <path d="M26 35 L50 54 L74 35" />
      </g>
    ),
    hammer: (
      <g fill={w}>
        <rect x={30} y={30} width={40} height={14} rx={3} />
        <rect x={46} y={42} width={9} height={32} rx={3} />
      </g>
    ),
    note: (
      <g>
        <rect x={28} y={24} width={44} height={52} rx={5} fill={w} />
        {[38, 48, 58].map((y) => (
          <rect key={y} x={35} y={y} width={30} height={4} rx={2} fill={from} />
        ))}
      </g>
    ),
    chart: (
      <g fill={w}>
        <rect x={28} y={50} width={10} height={22} rx={2} />
        <rect x={45} y={38} width={10} height={34} rx={2} />
        <rect x={62} y={28} width={10} height={44} rx={2} />
      </g>
    ),
    bubble: <path d="M50 26 C66 26 77 36 77 48 C77 60 66 70 50 70 C46 70 42 69 39 68 L27 74 L31 63 C26 59 23 54 23 48 C23 36 34 26 50 26 Z" fill={w} />,
    prompt: (
      <g fill="none" stroke={w} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 38 L42 50 L30 62" />
        <path d="M48 64 L70 64" />
      </g>
    ),
    graph: (
      <g fill="none" stroke={w} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 66 L42 50 L54 58 L74 34" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display: 'block'}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x={6} y={6} width={88} height={88} rx={20} fill={`url(#${id})`} />
      {g[glyph]}
    </svg>
  );
};
