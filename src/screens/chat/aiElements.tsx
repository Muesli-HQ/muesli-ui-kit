// AIElementsSwift @ v0.8.6 (native/AIElementsSwift/Sources/AIElementsSwift), themed as
// MeetingChatView applies it: surface backgroundRaised, border surfaceBorder, accent/focus accentText,
// muted textSecondary, heading title3, subheading headline, text font Nunito Sans.
// Ports: AIMessage, AIPromptInput, AIResponse (+ AIMarkdownBlock), AIDisclosure, AISourcePassage,
// AIAttachment, AIAttachmentPreview, AIShimmer, AITool, AIModelSelector, AIThinkingSlider.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {monoFontStack} from '../../fonts';
import {AIIcon, type AIIconName} from './AIIcon';
import {renderInline} from '../meetings/inline';
import {lineSpaced, oneLine, clamp, opacityOf} from '../meetings/parts';

/** `.foregroundStyle(.secondary)` — NSColor.secondaryLabelColor. VERIFY exact alpha on macOS 26. */
export function useSecondaryLabel() {
  const {isDark} = useMuesliTheme();
  return isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
}

// MARK: - AIMessage

/** User: Spacer(minLength 24) + content padded 14 × 10 on surface, radius 14. Assistant: full width. */
export const AIMessage: React.FC<{role: 'user' | 'assistant'; children: React.ReactNode}> = ({role, children}) => {
  const {colors} = useMuesliTheme();
  if (role === 'assistant') return <div style={{width: '100%'}}>{children}</div>;
  return (
    <div style={{display: 'flex', justifyContent: 'flex-end', paddingLeft: 24}}>
      <div style={{padding: '10px 14px', background: colors.backgroundRaised, borderRadius: 14, minWidth: 0}}>{children}</div>
    </div>
  );
};

// MARK: - AIPromptInput

export const AIPromptInput: React.FC<{
  focused?: boolean;
  compact?: boolean;
  header?: React.ReactNode;
  editor: React.ReactNode;
  footer?: React.ReactNode;
}> = ({focused = false, compact = false, header, editor, footer}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        // VStack(spacing: isCompact ? 0 : 6). VERIFY: an empty header VStack still takes a spacing slot.
        gap: compact ? 0 : 6,
        padding: `${compact ? 4 : 14}px 14px`,
        background: colors.backgroundRaised,
        borderRadius: 24,
        boxShadow: `inset 0 0 0 ${focused ? 2 : 1}px ${focused ? colors.accentText : colors.surfaceBorder}`,
      }}
    >
      {!compact && <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>{header}</div>}
      {editor}
      {!compact && footer}
    </div>
  );
};

// MARK: - AIShimmer

/**
 * A status label with a highlight sweep (primary @ 0.38, 65% of the width, 1.8s linear loop after 0.25s).
 * `sweep` is the loop phase 0…1, so a video can drive it per frame. Omit it for the resting label.
 */
export const AIShimmer: React.FC<{text: string; sweep?: number; style?: React.CSSProperties}> = ({text, sweep, style}) => {
  const {colors} = useMuesliTheme();
  const highlight = opacityOf(colors.textPrimary.replace(/,[\d.]+\)$/, ',1)'), 0.38);
  // offset from -0.65w to +1.0w across the loop
  const x = sweep === undefined ? null : -65 + sweep * 165;
  return (
    <span style={{position: 'relative', display: 'inline-block', ...style}}>
      {text}
      {x !== null && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            color: 'transparent',
            whiteSpace: 'nowrap',
            backgroundImage: `linear-gradient(90deg, transparent 0%, ${highlight} 50%, transparent 100%)`,
            backgroundSize: '65% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${x / 0.35}% 0`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

// MARK: - AIResponse

type Block = {kind: 'line'; text: string} | {kind: 'code'; text: string};

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const out: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const fence = lines[i].trim().match(/^(`{3,}|~{3,})/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) code.push(lines[i++]);
      out.push({kind: 'code', text: code.join('\n')});
      continue;
    }
    out.push({kind: 'line', text: lines[i]});
  }
  return out;
}

export interface AIResponseProps {
  markdown: string;
  /** Turns `[label](href)` links into nodes (citations). */
  renderLink?: (text: string, href: string, key: number) => React.ReactNode | undefined;
  /** Base font: MeetingChatAnswerView sets `.font(MuesliTheme.reading())`. */
  baseSize?: number;
  color?: string;
}

/** VStack(spacing 7) of Markdown lines, `.lineSpacing(4)`. */
export const AIResponse: React.FC<AIResponseProps> = ({markdown, renderLink, baseSize = 15, color}) => {
  const {colors} = useMuesliTheme();
  const secondary = useSecondaryLabel();
  const fg = color ?? colors.textPrimary;
  const inline = (t: string) => renderInline(t, {linkColor: colors.accent, renderLink});
  const text: React.CSSProperties = {...font(baseSize), color: fg, ...lineSpaced(baseSize, 4)};
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 7, width: '100%'}}>
      {parseBlocks(markdown).map((b, i) => {
        if (b.kind === 'code') {
          return (
            <div key={i} style={{background: colors.backgroundRaised, borderRadius: 8, padding: 12, fontFamily: monoFontStack, fontSize: 12, color: fg, whiteSpace: 'pre', overflow: 'hidden'}}>
              {b.text}
            </div>
          );
        }
        const raw = b.text;
        const line = raw.trim();
        const indent = Math.min(Math.floor((raw.length - raw.trimStart().length) / 2), 4);
        if (line === '') return <div key={i} style={{height: 5}} />;
        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
          return (
            <div key={i} style={{...(heading[1].length === 1 ? type.title3 : type.headline), color: fg, paddingTop: 8}}>
              {inline(heading[2])}
            </div>
          );
        }
        const list = line.match(/^((?:[-*+] \[[ xX]\] |[-*+] |\d+[.)]\s+))(.*)$/);
        if (list) {
          const marker = list[1].trim();
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 8, paddingLeft: indent * 16}}>
              <span style={{...text, color: secondary, minWidth: 14, textAlign: 'right', flex: 'none', marginTop: 0, marginBottom: 0}}>{marker.length === 1 ? '•' : marker}</span>
              <span style={{...text, flex: 1, minWidth: 0}}>{inline(list[2])}</span>
            </div>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <div key={i} style={{display: 'flex', gap: 10, padding: '4px 0'}}>
              <div style={{width: 3, borderRadius: 2, background: colors.surfaceBorder, flex: 'none'}} />
              <span style={{...text, color: secondary}}>{inline(line.slice(2))}</span>
            </div>
          );
        }
        return (
          <div key={i} style={text}>
            {inline(raw)}
          </div>
        );
      })}
    </div>
  );
};

// MARK: - AIDisclosure (AIElementsDisclosureStyle)

export const AIDisclosure: React.FC<{title: string; icon?: AIIconName; expanded?: boolean; children?: React.ReactNode}> = ({title, icon, expanded = false, children}) => {
  const {colors} = useMuesliTheme();
  const muted = colors.textSecondary;
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color: muted}}>
          {icon && <AIIcon name={icon} size={13} color={muted} />}
          <span style={font(12, 'medium')}>{title}</span>
        </span>
        <AIIcon name="chevronDown" size={14} color={muted} style={{transform: expanded ? 'rotate(180deg)' : undefined}} />
      </div>
      {expanded && <div style={{paddingTop: 8}}>{children}</div>}
    </div>
  );
};

// MARK: - AISourcePassage

export const AISourcePassage: React.FC<{number: number; metadata: string; preview: string; hovered?: boolean}> = ({number, metadata, preview}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0'}}>
      <span
        style={{
          minWidth: 22,
          height: 22,
          boxSizing: 'border-box',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: monoFontStack,
          fontSize: 11,
          color: colors.textPrimary,
          background: colors.backgroundRaised,
          borderRadius: 5,
          boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
          flex: 'none',
        }}
      >
        {number}
      </span>
      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4}}>
        <span style={{...font(11, 'medium'), color: colors.textSecondary}}>{metadata}</span>
        <span style={{...font(12), color: colors.textPrimary, ...clamp(3)}}>{preview}</span>
      </div>
      <AIIcon name="arrowUpRight" size={12} color={colors.textSecondary} />
    </div>
  );
};

// MARK: - AIAttachment (meeting chip)

export const AIAttachment: React.FC<{title: string; icon?: AIIconName}> = ({title, icon = 'fileText'}) => {
  const {colors} = useMuesliTheme();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 5px 4px 9px',
        background: colors.backgroundRaised,
        borderRadius: 7,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
        color: colors.textPrimary,
        flex: 'none',
        maxWidth: 320,
      }}
    >
      <AIIcon name={icon} size={12} color={colors.textSecondary} />
      <span style={{...font(12), ...oneLine}}>{title}</span>
      <span style={{width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
        <AIIcon name="x" size={11} color={colors.textSecondary} />
      </span>
    </span>
  );
};

// MARK: - AIAttachmentPreview (file card)

export const AIAttachmentPreview: React.FC<{
  title: string;
  detail: string;
  icon?: AIIconName;
  thumbnail?: string;
  showsPreview?: boolean;
  removable?: boolean;
}> = ({title, detail, icon = 'fileText', thumbnail, showsPreview = true, removable = false}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        width: 160,
        padding: 8,
        boxSizing: 'content-box',
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: colors.backgroundRaised,
        borderRadius: 9,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
      }}
    >
      {showsPreview && (
        <div style={{width: 160, height: 96, flex: 'none', borderRadius: 6, overflow: 'hidden', background: colors.backgroundRaised, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {thumbnail ? <img src={thumbnail} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block'}} /> : <AIIcon name={icon} size={28} color={colors.textSecondary} />}
        </div>
      )}
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 4}}>
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2}}>
          <span style={{...font(13), color: colors.textPrimary, ...clamp(2), wordBreak: 'break-all'}}>{title}</span>
          <span style={{...font(12), color: colors.textSecondary, ...oneLine}}>{detail}</span>
        </div>
        {removable && (
          <span style={{width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
            <AIIcon name="x" size={11} color={colors.textSecondary} />
          </span>
        )}
      </div>
    </div>
  );
};

// MARK: - AITool (research step card)

export const AITool: React.FC<{title: string; state: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'}> = ({title, state}) => {
  const {colors} = useMuesliTheme();
  const label = {pending: 'Pending', running: 'Running', completed: 'Completed', failed: 'Failed', cancelled: 'Cancelled'}[state];
  const indicator: [AIIconName, string] =
    state === 'pending' ? ['circle', colors.textSecondary]
    : state === 'running' ? ['clock', colors.accentText]
    : state === 'completed' ? ['circleCheckBig', colors.textSecondary]
    : state === 'failed' ? ['circleX', '#FF453A'] // `.red` — VERIFY systemRed
    : ['circleX', colors.textSecondary];
  const iconName = indicator[0];
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: colors.backgroundRaised, borderRadius: 10, boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`}}>
      <AIIcon name="wrench" size={14} color={colors.textSecondary} />
      <span style={{...font(12, 'medium'), color: colors.textPrimary}}>{title}</span>
      <div style={{flex: 1, minWidth: 8}} />
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
        <span style={{width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
          <AIIcon name={iconName} size={14} color={indicator[1]} />
        </span>
        <span style={{...font(11), color: colors.textSecondary}}>{label}</span>
      </span>
      <AIIcon name="chevronDown" size={14} color={colors.textSecondary} />
    </div>
  );
};

// MARK: - AIModelSelector / AIThinkingSlider (model popover)

export const AIModelSelector: React.FC<{choices: {id: string; title: string}[]; selectedId: string; hoveredId?: string}> = ({choices, selectedId, hoveredId}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{height: Math.min(220, choices.length * 32), overflow: 'hidden'}}>
      {choices.map((c) => (
        <div
          key={c.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 32,
            padding: '0 12px',
            background: c.id === selectedId ? colors.backgroundRaised : c.id === hoveredId ? colors.backgroundHover : 'transparent',
            color: colors.textPrimary,
          }}
        >
          <span style={{...font(12), ...oneLine, flex: 1}}>{c.title}</span>
          {c.id === selectedId && <AIIcon name="check" size={12} color={colors.textPrimary} />}
        </div>
      ))}
    </div>
  );
};

/**
 * AIThinkingSlider: "Thinking level" 13 / value 12 medium muted, a native discrete Slider tinted
 * accentText, and first/last labels at 10pt. VERIFY: the macOS 26 NSSlider track/knob is approximated.
 */
export const AIThinkingSlider: React.FC<{choices: string[]; selected: number}> = ({choices, selected}) => {
  const {colors, isDark} = useMuesliTheme();
  const t = choices.length > 1 ? selected / (choices.length - 1) : 0;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 7}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <span style={{...font(13), color: colors.textPrimary, flex: 1}}>Thinking level</span>
        <span style={{...font(12, 'medium'), color: colors.textSecondary}}>{choices[selected]}</span>
      </div>
      <div style={{position: 'relative', height: 20}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 8, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'}} />
        <div style={{position: 'absolute', left: 0, width: `${t * 100}%`, top: 8, height: 4, borderRadius: 2, background: colors.accentText}} />
        <div
          style={{
            position: 'absolute',
            top: 1,
            left: `calc(${t * 100}% - ${t * 18}px)`,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 0.5px 2px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(0,0,0,0.1)',
          }}
        />
      </div>
      <div style={{display: 'flex', ...font(10), color: colors.textSecondary}}>
        <span style={{flex: 1}}>{choices[0]}</span>
        <span>{choices[choices.length - 1]}</span>
      </div>
    </div>
  );
};
