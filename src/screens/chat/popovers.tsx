// Chat popovers and menus (v0.8.6):
//  - MeetingChatModelPicker.swift (model popover: provider menu, AIModelSelector, AIThinkingSlider)
//  - MeetingChatCitationView.swift (citation popover)
//  - MeetingChatQuickAction.swift (the composer "+" menu items)
// The NSPopover / NSMenu chrome around them is AppKit's, not Muesli's — VERIFY material, radius,
// arrow and shadow against a macOS 26 capture.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {systemFontStack} from '../../fonts';
import {AIIcon} from './AIIcon';
import {AIModelSelector, AIThinkingSlider, useSecondaryLabel} from './aiElements';
import {lineSpaced} from '../meetings/parts';
import {SOURCE_KIND_LABEL, type ChatCitation} from './types';

/** NSPopover approximation. `arrow` = which edge carries the arrow, `arrowX` its centre from the left. */
export const NativePopover: React.FC<{width?: number; arrow?: 'top' | 'bottom' | 'none'; arrowX?: number; children: React.ReactNode}> = ({
  width,
  arrow = 'bottom',
  arrowX,
  children,
}) => {
  const {isDark} = useMuesliTheme();
  const bg = isDark ? '#2A2A2C' : '#F6F6F6';
  const border = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const arrowEl = (
    <div style={{position: 'absolute', [arrow === 'top' ? 'top' : 'bottom']: -6, left: (arrowX ?? (width ?? 200) / 2) - 7, width: 14, height: 14, background: bg, transform: 'rotate(45deg)', boxShadow: `0 0 0 0.5px ${border}`, clipPath: arrow === 'top' ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(100% 0, 100% 100%, 0 100%)'}} />
  );
  return (
    <div style={{position: 'relative', width, background: bg, borderRadius: 12, boxShadow: `0 0 0 0.5px ${border}, 0 10px 30px rgba(0,0,0,${isDark ? 0.5 : 0.18})`}}>
      {arrow !== 'none' && arrowEl}
      <div style={{position: 'relative', borderRadius: 12, overflow: 'hidden'}}>{children}</div>
    </div>
  );
};

/** NSMenu approximation (system font 13, 22pt rows). */
export const NativeMenu: React.FC<{items: string[]; highlighted?: number; width?: number}> = ({items, highlighted, width = 180}) => {
  const {isDark} = useMuesliTheme();
  return (
    <div
      style={{
        width,
        padding: 5,
        borderRadius: 10,
        background: isDark ? 'rgba(40,40,42,0.96)' : 'rgba(246,246,246,0.96)',
        boxShadow: `0 0 0 0.5px ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)'}, 0 10px 30px rgba(0,0,0,${isDark ? 0.5 : 0.2})`,
        fontFamily: systemFontStack,
        fontSize: 13,
      }}
    >
      {items.map((it, i) => (
        <div
          key={it}
          style={{
            height: 22,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            borderRadius: 5,
            color: i === highlighted ? '#FFFFFF' : isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)',
            background: i === highlighted ? (isDark ? '#0A84FF' : '#007AFF') : 'transparent',
          }}
        >
          {it}
        </div>
      ))}
    </div>
  );
};

/** MeetingChatQuickAction.label, in menu order. */
export const QUICK_ACTION_LABELS = ['My next steps', 'Decisions', 'Draft follow-up', 'Weekly recap'] as const;

export const QuickActionsMenu: React.FC<{highlighted?: number}> = ({highlighted}) => <NativeMenu items={[...QUICK_ACTION_LABELS]} highlighted={highlighted} />;

/** SummaryModelPreset.chatGPTModels @ v0.8.6. */
export const CHATGPT_MODEL_CHOICES = [
  {id: 'gpt-6.1-sol', title: 'GPT-6.1 Sol (default)'},
  {id: 'gpt-6-astra', title: 'GPT-6 Astra'},
  {id: 'gpt-6-sol', title: 'GPT-6 Sol'},
  {id: 'gpt-6-luna', title: 'GPT-6 Luna'},
];
/** ReasoningEffortPolicy capabilities for gpt-6.1-sol: Low … Maximum, default Medium. */
export const GPT61_SOL_EFFORTS = ['Low', 'Medium', 'High', 'Extra High', 'Maximum'];

export const ModelPickerPopover: React.FC<{
  provider?: string;
  choices?: {id: string; title: string}[];
  selectedId?: string;
  hoveredId?: string;
  efforts?: string[];
  selectedEffort?: number;
}> = ({provider = 'ChatGPT', choices = CHATGPT_MODEL_CHOICES, selectedId = 'gpt-6.1-sol', hoveredId, efforts = GPT61_SOL_EFFORTS, selectedEffort = 1}) => {
  const {colors} = useMuesliTheme();
  const secondary = useSecondaryLabel();
  const divider = <div style={{height: 1, background: colors.surfaceBorder}} />;
  return (
    <div style={{width: 280, display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', padding: 12}}>
        <span style={{...font(13, 'semibold'), color: colors.textPrimary, flex: 1}}>Model</span>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, ...type.caption, color: colors.textPrimary}}>
          {provider}
          <AIIcon name="chevronDown" size={10} color={colors.textPrimary} />
        </span>
      </div>
      <AIModelSelector choices={choices} selectedId={selectedId} hoveredId={hoveredId} />
      {divider}
      <div style={{padding: 12}}>
        <AIThinkingSlider choices={efforts} selected={selectedEffort} />
      </div>
      {divider}
      <div style={{display: 'flex', flexDirection: 'column', gap: 7, padding: 12}}>
        <span style={{...font(10), color: secondary}}>Shared with meeting summaries</span>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, ...type.caption, color: colors.accent}}>
          <AIIcon name="slidersHorizontal" color={colors.accent} />
          AI Settings…
        </span>
      </div>
    </div>
  );
};

export const CitationPopover: React.FC<{citation: ChatCitation; available?: boolean; changed?: boolean; openState?: 'rest' | 'pressed'}> = ({
  citation,
  available = true,
  changed = false,
  openState = 'rest',
}) => {
  const {colors, isDark} = useMuesliTheme();
  const secondary = useSecondaryLabel();
  const kind = SOURCE_KIND_LABEL[citation.kind];
  return (
    <div style={{width: 440, boxSizing: 'border-box', padding: 20, display: 'flex', flexDirection: 'column', gap: 12}}>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, ...type.captionMedium, color: secondary}}>
        <AIIcon name="fileText" size={14} color={secondary} />
        {kind}
      </span>
      <span style={{...type.title3, color: colors.textPrimary}}>{citation.title}</span>
      <span style={{...type.caption, color: colors.textSecondary}}>{`${citation.dateTimeLabel} · ${kind}${citation.timestamp ? ` · ${citation.timestamp}` : ''}`}</span>
      <div style={{background: colors.backgroundDeep, borderRadius: 10, padding: 14, maxHeight: 300, overflow: 'hidden'}}>
        <div style={{...type.reading, color: colors.textPrimary, ...lineSpaced(15, 5)}}>{citation.excerpt}</div>
      </div>
      {changed && <span style={{...type.caption, color: isDark ? '#FF9F0A' : '#FF9500'}}>This source changed since the answer was written.</span>}
      {!available && <span style={{...type.caption, color: colors.textPrimary}}>This source is no longer available.</span>}
      {/* `.buttonStyle(.borderedProminent)` in the dashboard tint. VERIFY native height/radius on macOS 26. */}
      <div style={{display: 'flex'}}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 12px',
            height: 28,
            borderRadius: 9999,
            background: colors.accent,
            color: colors.onAccent,
            opacity: available ? (openState === 'pressed' ? 0.85 : 1) : 0.45,
            ...type.body,
          }}
        >
          <AIIcon name="arrowUpRight" size={14} color={colors.onAccent} />
          Open in meeting
        </span>
      </div>
    </div>
  );
};
