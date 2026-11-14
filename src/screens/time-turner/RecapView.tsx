// TimeTurnerRecapView + RecapCaptureThumbnail (TimeTurnerRecapView.swift @ v0.8.6), daily-recap template.
// Card: padding 18, backgroundRaised, radius 16, surfaceBorder stroke; VStack spacing 14.
// Sections come from TimeTurnerRecapInsight.Section (TimeTurnerRecap.swift).
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {CaptureImage} from './CaptureImage';
import {CONTROL_SYMBOL_SIZE, SMALL_CONTROL_SYMBOL_SIZE, BorderlessMenu, NativeButton, NativeSymbol, Spinner, envFont, useLabelColors, type NativeState} from './native';
import {formatTimeShort, type TimeTurnerCapture} from './model';

export type RecapSection = 'work' | 'decisions' | 'followUps';
export const RECAP_SECTION_TITLE: Record<RecapSection, string> = {work: 'Work covered', decisions: 'Decisions', followUps: 'Possible follow-ups'};
const SECTION_ORDER: RecapSection[] = ['work', 'decisions', 'followUps'];

export type RecapSource =
  | {kind: 'capture'; capture: TimeTurnerCapture; expired?: boolean}
  /** Meeting citation: Label(title, systemImage: "text.bubble"). */
  | {kind: 'meeting'; title: string}
  /** History source: Label("<kind label> · <time>", systemImage: "doc.text"). */
  | {kind: 'history'; label: string};

export interface RecapInsight {
  section: RecapSection;
  text: string;
  sources: RecapSource[];
}

export interface TimeTurnerRecapProps {
  /** idle = not generated yet; generating = "Reading selected sources…"; generated = insights shown. */
  state: 'idle' | 'loading' | 'generating' | 'generated';
  /** template.title — "Daily recap" (MuesliHistoryTask.dailyRecap). */
  title?: string;
  /** "Generated 6 Nov 2026 at 6:02 PM" (generated only). */
  generatedLabel?: string;
  /** "<provider> · <model>", e.g. "ChatGPT · gpt-6.1-sol". */
  providerLine: string;
  /** Idle caption: availability message, or "Generate from this day’s selected sources using <provider>." */
  idleMessage?: string;
  insights: RecapInsight[];
  /** 0..1: how many insights have appeared (for a reveal). The partially revealed one fades in. Default 1. */
  revealProgress?: number;
  /** Saved recaps say "Saved on this Mac", unsaved say "Temporary recap". */
  saved?: boolean;
  /** SettingsNote lines, e.g. "Up to date" or "Sources changed. Update when ready." */
  notes?: string[];
  /** Copy button shows a checkmark. */
  copied?: boolean;
  /** Generate/Update button: shown when idle, or when generated and out of date. */
  showsUpdate?: boolean;
  generateButtonState?: NativeState;
  /** Spinner phase for videos (0..1). */
  spinnerPhase?: number;
  expanded?: boolean;
  error?: string;
  /** Hover/press state of the header and follow-up buttons, for videos. */
  actionStates?: Partial<Record<RecapAction, NativeState>>;
  /** Open popover, anchored under its button (RecapSourcesPopover / RecapSettingsPopover). */
  popover?: {for: 'settings' | 'sources'; content: React.ReactNode; offsetX?: number};
  /** Source chip being clicked (insight index, source index): `.buttonStyle(.plain)` has no hover, only a pressed dim. */
  pressedSource?: [number, number];
}

/** RecapCaptureThumbnail: 144×90 image on backgroundDeep (r6), time caption, padding 6, r10 card with border. */
export const RecapCaptureThumbnail: React.FC<{capture: TimeTurnerCapture; expired?: boolean}> = ({capture, expired}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 6,
        borderRadius: 10,
        background: colors.backgroundDeep,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
        flex: 'none',
        alignItems: 'flex-start',
      }}
    >
      <div style={{width: 144, height: 90, borderRadius: 6, overflow: 'hidden', background: colors.backgroundDeep}}>
        <CaptureImage capture={capture} compact expired={expired} />
      </div>
      <span style={{...type.caption, color: colors.textSecondary}}>{formatTimeShort(capture.time)}</span>
    </div>
  );
};

const SourceChip: React.FC<{source: RecapSource; pressed?: boolean}> = ({source, pressed}) => {
  const {colors} = useMuesliTheme();
  const label = useLabelColors();
  if (source.kind === 'capture') return <div style={{opacity: pressed ? 0.7 : 1, display: 'flex'}}><RecapCaptureThumbnail capture={source.capture} expired={source.expired} /></div>;
  return (
    <div style={{...type.caption, color: label.primary, display: 'flex', alignItems: 'center', gap: 5, padding: 8, borderRadius: 8, background: colors.backgroundDeep, whiteSpace: 'nowrap', flex: 'none', opacity: pressed ? 0.7 : 1}}>
      <Symbol name={source.kind === 'meeting' ? 'text.bubble' : 'doc.text'} size={12} weight="regular" color={label.primary} />
      {source.kind === 'meeting' ? source.title : source.label}
    </div>
  );
};

export type RecapAction = 'settings' | 'sources' | 'copy' | 'stop' | 'more' | 'collapse' | 'todos';

export const TimeTurnerRecapView: React.FC<TimeTurnerRecapProps> = ({
  state,
  title = 'Daily recap',
  generatedLabel,
  providerLine,
  idleMessage,
  insights,
  revealProgress = 1,
  saved = true,
  notes = [],
  copied = false,
  showsUpdate,
  generateButtonState = 'rest',
  spinnerPhase = 0,
  expanded = true,
  error,
  actionStates = {},
  popover,
  pressedSource,
}) => {
  const {colors} = useMuesliTheme();
  const label = useLabelColors();
  const generated = state === 'generated';
  const generating = state === 'generating';
  const showGenerate = !generating && (showsUpdate ?? !generated);

  const revealed = Math.max(0, Math.min(1, revealProgress)) * insights.length;
  const opacityFor = (i: number) => Math.max(0, Math.min(1, revealed - i));

  const iconButton = (name: string, action: RecapAction) => (
    <div style={{position: 'relative', display: 'flex'}}>
      <NativeButton iconOnly state={actionStates[action] ?? 'rest'}>
        <NativeSymbol name={name} size={CONTROL_SYMBOL_SIZE} color={colors.textPrimary} />
      </NativeButton>
      {popover && popover.for === action ? (
        // NSPopover below the button, arrow on the button's centre; offsetX shifts the body left.
        <div style={{position: 'absolute', top: '100%', left: '50%', marginTop: 12, transform: `translateX(${-(popover.offsetX ?? 40)}px)`, zIndex: 30}}>
          {popover.content}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        padding: 18,
        background: colors.backgroundRaised,
        borderRadius: 16,
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        ...envFont,
        color: colors.textPrimary,
        boxSizing: 'border-box',
      }}
    >
      {/* HStack { heading; Spacer(); actions } */}
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Symbol name="text.page" size={14} weight="regular" color={colors.accent} />
            <span style={type.headline}>{title}</span>
          </div>
          {generated && generatedLabel ? <span style={{...type.caption, color: label.secondary}}>{generatedLabel}</span> : null}
          <span style={{...type.caption, color: label.secondary}}>{providerLine}</span>
        </div>
        <span style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          {iconButton('gearshape', 'settings')}
          {iconButton('square.stack', 'sources')}
          {generated ? iconButton(copied ? 'checkmark' : 'doc.on.doc', 'copy') : null}
          {generating ? iconButton('stop.fill', 'stop') : null}
          {showGenerate ? (
            <NativeButton prominent state={state === 'loading' ? 'disabled' : generateButtonState}>
              <Symbol name="sparkles" size={CONTROL_SYMBOL_SIZE} weight="regular" color={colors.onAccent} />
              <span>{generated ? 'Update' : 'Generate'}</span>
            </NativeButton>
          ) : null}
          {generated ? <BorderlessMenu symbol="ellipsis" /> : null}
          {generated ? iconButton(expanded ? 'chevron.up' : 'chevron.down', 'collapse') : null}
        </div>
      </div>

      {notes.map((n) => (
        <div key={n} style={{...type.caption, color: colors.textSecondary}}>{n}</div>
      ))}
      {state === 'loading' ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, ...type.body}}>
          <Spinner size={20} phase={spinnerPhase} />
          Loading recap…
        </div>
      ) : null}
      {state === 'idle' ? <div style={{...type.caption, color: label.secondary}}>{idleMessage}</div> : null}
      {generating ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <Spinner size={16} phase={spinnerPhase} />
          <span style={type.caption}>Reading selected sources…</span>
        </div>
      ) : null}
      {error ? <div style={{...type.caption, color: '#FF9F0A'}}>{error}</div> : null}

      {generated && expanded ? (
        <>
          {insights.length === 0 ? <div style={{...type.body, color: label.secondary}}>No supported takeaways in the sampled history.</div> : null}
          {SECTION_ORDER.map((section) => {
            const items = insights.map((ins, i) => ({ins, i})).filter(({ins}) => ins.section === section);
            const visible = items.filter(({i}) => opacityFor(i) > 0);
            if (!visible.length) return null;
            return (
              <div key={section} style={{display: 'flex', flexDirection: 'column', gap: 10, opacity: opacityFor(items[0].i)}}>
                <div style={{display: 'flex', alignItems: 'center', minHeight: 20}}>
                  <span style={type.headline}>{RECAP_SECTION_TITLE[section]}</span>
                  {section === 'followUps' && saved ? (
                    <>
                      <span style={{flex: 1}} />
                      <NativeButton iconOnly size="small" state={actionStates.todos ?? 'rest'}>
                        <NativeSymbol name="checklist" size={SMALL_CONTROL_SYMBOL_SIZE} color={colors.textPrimary} />
                      </NativeButton>
                    </>
                  ) : null}
                </div>
                {visible.map(({ins, i}) => (
                  <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 7, opacity: i === items[0].i ? 1 : opacityFor(i)}}>
                    <div style={type.body}>{ins.text}</div>
                    {ins.sources.length ? (
                      <div style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}>
                        {ins.sources.map((s, k) => (
                          <SourceChip key={k} source={s} pressed={!!pressedSource && pressedSource[0] === i && pressedSource[1] === k} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            );
          })}
          <div style={{...type.caption, color: label.secondary, opacity: revealProgress >= 1 ? 1 : 0}}>
            {saved ? 'Based on sampled excerpts · Saved on this Mac' : 'Based on sampled excerpts · Temporary recap'}
          </div>
        </>
      ) : null}
    </div>
  );
};
