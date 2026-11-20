// OnboardingView.swift + OnboardingFlow.swift + OnboardingWindowController.swift @ v0.8.6: the first-run window.
// Window: 640×520 content, titled, transparent titlebar, hidden title, always dark (.preferredColorScheme(.dark)).
// Body: the step view (fills) · Divider · bottom bar (padding h32 v16): step dots (7pt, spacing 6; accent = current,
// textTertiary = others) · Spacer · [Back] [secondary] [primary].
// Steps (OnboardingFlow.orderedSteps): welcome, model, then hotkey + permissions + dictation test when the use case
// includes push-to-talk (Dictation / Voice Notes), or permissions alone for Meetings; meetings add meeting summary +
// calendar access.
// VERIFY against captures: titlebar lights (styleMask .titled only), the AppKit rounded-bezel name field, rounded-design
// captions (approximated with Nunito), the indeterminate preparation bar.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type, font} from '../../typography';
import {spacing, radius, withAlpha} from '../../tokens/theme';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {MacWindow} from '../../chrome/MacWindow';
import {MacSpinner} from '../settings/controls';
import muesliLogo from '../cotypist/muesli-app-icon.png';

export type OnboardingStep = 'welcome' | 'model' | 'hotkey' | 'permissions' | 'dictationTest' | 'meetingSummary' | 'calendarAccess';
export interface OnboardingUseCase {
  voiceNotes: boolean;
  dictation: boolean;
  meetings: boolean;
}
export const ONBOARDING_SIZE = {w: 640, h: 520} as const;

const pushToTalk = (u: OnboardingUseCase) => u.dictation || u.voiceNotes;
const isEverything = (u: OnboardingUseCase) => u.voiceNotes && u.dictation && u.meetings;

/** OnboardingFlow.orderedSteps(for:). */
export const onboardingSteps = (u: OnboardingUseCase): OnboardingStep[] => {
  const s: OnboardingStep[] = ['welcome', 'model'];
  if (pushToTalk(u)) s.push('hotkey', 'permissions', 'dictationTest');
  else if (u.meetings) s.push('permissions');
  if (u.meetings) s.push('meetingSummary', 'calendarAccess');
  return s;
};

/** permissionSteps: the permission union for the selected capabilities (useCoreAudioTap → "System Audio"). */
export const onboardingPermissions = (u: OnboardingUseCase, useCoreAudioTap = true) => {
  const p: Array<{icon: string; name: string; description: string}> = [
    {icon: 'mic.fill', name: 'Microphone', description: 'Record audio for voice notes, dictation, and meetings'},
  ];
  if (pushToTalk(u)) {
    if (u.dictation) p.push({icon: 'hand.raised.fill', name: 'Accessibility', description: 'Paste transcribed text into other apps'});
    p.push({icon: 'keyboard.fill', name: 'Input Monitoring', description: 'Detect hotkey for push-to-talk recording'});
  }
  if (u.meetings) {
    p.push(
      useCoreAudioTap
        ? {icon: 'speaker.wave.2.fill', name: 'System Audio', description: 'Capture meeting audio from other participants'}
        : {icon: 'rectangle.dashed.badge.record', name: 'Screen & System Audio', description: 'Capture meeting audio from other participants'},
    );
  }
  return p;
};

export interface OnboardingModelOption {
  label: string;
  sizeLabel: string;
  description: string;
  recommended?: boolean;
  incompatibility?: string;
}
/** BackendOption.onboardingDefault (.parakeetUnified). */
export const ONBOARDING_DEFAULT_MODEL: OnboardingModelOption = {
  label: 'Parakeet Unified',
  sizeLabel: '~565 MB',
  description: 'The best English dictation. Lowest error rate, newest architecture, instant. For other languages, choose Parakeet v3.',
  recommended: true,
};

export interface OnboardingProps {
  step: OnboardingStep;
  useCase: OnboardingUseCase;
  /** Welcome: the name typed so far, and whether the field shows its caret. */
  userName?: string;
  nameCaret?: boolean;
  /** Use-case card being pressed (plain button: no hover). */
  pressedUseCase?: keyof OnboardingUseCase | 'everything';
  model?: {selected?: string; downloaded?: boolean; showMore?: boolean; alternatives?: OnboardingModelOption[]};
  /** HotkeyConfig.label (default "Right Option"); recording = waiting for a modifier key. */
  hotkey?: {label: string; recording?: boolean; isToggle?: boolean};
  /** Permissions: how many of the list are granted (the next one is shown); `confirming` = the just-granted one flashes
   *  green with "Granted"; `buttonState` = the label after the first click ("Open Settings") or while macOS prompts. */
  permissions?: {granted: number; confirming?: boolean; buttonState?: 'grant' | 'openSettings' | 'waiting'; useCoreAudioTap?: boolean; buttonPressed?: boolean};
  dictationTest?: {phase: 'downloading' | 'preparing' | 'ready' | 'listening' | 'success'; progress?: number; status?: string; result?: string};
  summary?: {provider: 'ChatGPT' | 'OpenAI' | 'Anthropic' | 'OpenRouter' | 'Ollama'; signedIn?: boolean};
  /** Calendar step: access granted; `calendarIcon` = Calendar.app's icon (NSWorkspace), else an SF Symbol stands in. */
  calendar?: {granted: boolean; calendarIcon?: string};
  primaryState?: ControlState;
  secondaryState?: ControlState;
  backState?: ControlState;
}

// ---------------- pieces ----------------

const PrimaryButton: React.FC<{title: string; enabled?: boolean; state?: ControlState}> = ({title, enabled = true, state = 'rest'}) => (
  <Button kind="primary" state={enabled ? state : 'disabled'} style={{padding: `${spacing[8]}px ${spacing[20]}px`}}>
    <span style={{...font(14, 'medium'), whiteSpace: 'nowrap'}}>{title}</span>
  </Button>
);
/** Back, Skip, Not now, Set up later: neutral actions with their chrome inside the label. */
const SkipButton: React.FC<{title?: string; state?: ControlState}> = ({title = 'Skip', state = 'rest'}) => {
  const {colors} = useMuesliTheme();
  return (
    <Button kind="secondary" state={state} style={{padding: `${spacing[8]}px ${spacing[16]}px`}}>
      <span style={{...type.body, color: colors.textSecondary, whiteSpace: 'nowrap'}}>{title}</span>
    </Button>
  );
};

const Centered: React.FC<{gap: number; children: React.ReactNode; style?: React.CSSProperties}> = ({gap, children, style}) => (
  <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap, textAlign: 'center', ...style}}>{children}</div>
);

const UseCaseCard: React.FC<{icon: string; title: string; subtitle: string; selected: boolean; pressed?: boolean}> = ({icon, title, subtitle, selected, pressed}) => {
  const {colors} = useMuesliTheme();
  const fg = selected ? colors.onAccent : colors.textSecondary;
  return (
    <div
      style={{
        position: 'relative',
        width: 132,
        height: 74,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        borderRadius: radius.small,
        background: selected ? colors.accent : colors.backgroundRaised,
        boxShadow: `inset 0 0 0 1px ${selected ? colors.accent : colors.surfaceBorder}`,
        color: fg,
        opacity: pressed ? 0.8 : 1,
      }}
    >
      <Symbol name={icon} size={20} weight="medium" color={fg} />
      <span style={{...font(12, 'semibold'), color: fg}}>{title}</span>
      <span style={{...font(10), color: selected ? colors.onAccent : colors.textTertiary, whiteSpace: 'nowrap'}}>{subtitle}</span>
      {selected ? (
        <span style={{position: 'absolute', left: 7, top: 7, display: 'flex'}}>
          <Symbol name="checkmark.circle.fill" size={14} weight="semibold" color={colors.onAccent} />
        </span>
      ) : null}
    </div>
  );
};

/** OnboardingTextField: NSTextField .roundedBezel, Nunito 14, 280×32. VERIFY bezel look in dark. */
const NameField: React.FC<{value: string; caret?: boolean}> = ({value, caret}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        width: 280,
        height: 32,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        borderRadius: 6,
        background: 'rgba(255,255,255,0.06)',
        boxShadow: `inset 0 0 0 1px ${caret ? withAlpha(colors.accent, 0.8) : 'rgba(255,255,255,0.14)'}${caret ? `, 0 0 0 3px ${withAlpha(colors.accent, 0.35)}` : ''}`,
        ...font(14),
        color: value ? colors.textPrimary : colors.textTertiary,
        textAlign: 'left',
      }}
    >
      {value || (caret ? '' : 'Enter your name')}
      {caret ? <span style={{width: 1, height: 17, background: colors.textPrimary, marginLeft: 1}} /> : null}
    </div>
  );
};

const ModelCard: React.FC<{o: OnboardingModelOption; selected: boolean}> = ({o, selected}) => {
  const {colors} = useMuesliTheme();
  const ok = !o.incompatibility;
  return (
    <div
      style={{
        display: 'flex',
        gap: spacing[12],
        padding: spacing[12],
        borderRadius: radius.medium,
        background: colors.backgroundRaised,
        boxShadow: `inset 0 0 0 ${selected ? 1.5 : 1}px ${selected ? colors.accent : colors.surfaceBorder}`,
        textAlign: 'left',
        alignItems: 'center',
      }}
    >
      <span style={{width: 16, height: 16, borderRadius: 8, flex: 'none', boxSizing: 'border-box', background: selected ? colors.accent : 'transparent', border: `1.5px solid ${selected ? colors.accent : colors.textTertiary}`}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <span style={{...type.headline, color: ok ? colors.textPrimary : colors.textTertiary}}>{o.label}</span>
          {o.recommended ? (
            <span style={{...font(9, 'semibold'), color: colors.onAccent, background: colors.accent, borderRadius: 3, padding: '1px 5px'}}>Recommended</span>
          ) : null}
          <span style={{...type.caption, color: colors.textTertiary}}>{o.sizeLabel}</span>
        </div>
        <span style={{...type.caption, color: ok ? colors.textSecondary : colors.textTertiary}}>{o.description}</span>
        {o.incompatibility ? (
          <span style={{...type.caption, color: colors.textTertiary, display: 'inline-flex', alignItems: 'center', gap: 4}}>
            <Symbol name="exclamationmark.triangle" size={11} weight="regular" color={colors.textTertiary} />
            {o.incompatibility}
          </span>
        ) : null}
      </div>
    </div>
  );
};

/** OpenAILogoShape (the OpenAI blossom), 14×14. */
const OpenAILogo: React.FC<{color: string}> = ({color}) => (
  <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden style={{flex: 'none'}}>
    <path
      fill={color}
      d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .75 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.43a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zM3.6 18.3a4.47 4.47 0 0 1-.53-3.01l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06l-4.83 2.79a4.5 4.5 0 0 1-6.15-1.65zM2.34 7.9a4.48 4.48 0 0 1 2.37-1.97v5.68a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.87zm16.6 3.86-5.83-3.39 2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.41-.66zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.31 12.86 6.29 11.7a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.39.68zm1.1-2.37 2.6-1.5 2.61 1.5v3l-2.6 1.5-2.6-1.5z"
    />
  </svg>
);

// ---------------- steps ----------------

const Welcome: React.FC<{p: OnboardingProps}> = ({p}) => {
  const {colors} = useMuesliTheme();
  const u = p.useCase;
  return (
    <Centered gap={spacing[16]}>
      <img src={muesliLogo} style={{width: 64, height: 64}} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8]}}>
        <span style={{...type.title1, color: colors.textPrimary}}>Welcome to muesli</span>
        <span style={{...type.body, color: colors.textSecondary}}>Local-first dictation and meeting transcription for macOS.</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: spacing[8]}}>
        <span style={{...type.caption, color: colors.textTertiary}}>Your name</span>
        <NameField value={p.userName ?? ''} caret={p.nameCaret} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8]}}>
        <span style={{...type.caption, color: colors.textTertiary}}>What will you use muesli for?</span>
        <div style={{display: 'grid', gridTemplateColumns: '132px 132px', gap: spacing[8]}}>
          <UseCaseCard icon="waveform" title="Voice Notes" subtitle="Record in muesli" selected={u.voiceNotes} pressed={p.pressedUseCase === 'voiceNotes'} />
          <UseCaseCard icon="keyboard.fill" title="Dictation" subtitle="Paste into apps" selected={u.dictation} pressed={p.pressedUseCase === 'dictation'} />
          <UseCaseCard icon="person.2.fill" title="Meetings" subtitle="Notes and summaries" selected={u.meetings} pressed={p.pressedUseCase === 'meetings'} />
          <UseCaseCard icon="rectangle.3.group.fill" title="Everything" subtitle="All workflows" selected={isEverything(u)} pressed={p.pressedUseCase === 'everything'} />
        </div>
      </div>
    </Centered>
  );
};

const Model: React.FC<{p: OnboardingProps}> = ({p}) => {
  const {colors} = useMuesliTheme();
  const m = p.model ?? {};
  const selected = m.selected ?? ONBOARDING_DEFAULT_MODEL.label;
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[16], overflow: 'hidden'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8], paddingTop: spacing[24], textAlign: 'center'}}>
        <span style={{...type.title1, color: colors.textPrimary}}>Choose your transcription model</span>
        <span style={{...type.body, color: colors.textSecondary}}>Start with a fast local model. Larger models can download while you continue setup.</span>
      </div>
      <div style={{alignSelf: 'stretch', padding: `0 ${spacing[32]}px`, display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
        <ModelCard o={ONBOARDING_DEFAULT_MODEL} selected={selected === ONBOARDING_DEFAULT_MODEL.label} />
        <div style={{display: 'flex', justifyContent: 'center', paddingTop: spacing[4]}}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 28, padding: '0 8px', ...type.caption, color: colors.textTertiary}}>
            Other models
            <Symbol name={m.showMore ? 'chevron.up' : 'chevron.down'} size={9} weight="semibold" color={colors.textTertiary} />
          </span>
        </div>
        {m.showMore ? (
          <>
            {(m.alternatives ?? []).map((o) => (
              <ModelCard key={o.label} o={o} selected={selected === o.label} />
            ))}
            <span style={{...font(11, 'medium'), color: colors.textTertiary, textAlign: 'center', paddingTop: spacing[4]}}>More models are available after onboarding.</span>
          </>
        ) : null}
      </div>
    </div>
  );
};

const Hotkey: React.FC<{p: OnboardingProps}> = ({p}) => {
  const {colors} = useMuesliTheme();
  const h = p.hotkey ?? {label: 'Right Option'};
  return (
    <Centered gap={spacing[24]} style={{padding: `0 ${spacing[32]}px`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8]}}>
        <span style={{...type.title1, color: colors.textPrimary}}>Dictation Shortcut</span>
        <span style={{...type.body, color: colors.textSecondary}}>
          {h.isToggle
            ? 'Press your key combination to record, then press it again to transcribe.'
            : 'Choose the key you’ll hold to dictate. Press and hold the key to record, release to transcribe.'}
        </span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[16]}}>
        <span
          style={{
            ...font(24, 'semibold'),
            color: colors.textPrimary,
            padding: `${spacing[16]}px ${spacing[32]}px`,
            borderRadius: radius.medium,
            background: colors.backgroundRaised,
            boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
          }}
        >
          {h.label}
        </span>
        <Button kind={h.recording ? 'tinted' : 'secondary'} state="rest" style={{padding: `${spacing[8]}px ${spacing[16]}px`, boxShadow: h.recording ? `inset 0 0 0 1px ${withAlpha(colors.accent, 0.3)}` : undefined}}>
          <span style={{...type.body, whiteSpace: 'nowrap'}}>{h.recording ? 'Press a modifier key...' : 'Change Shortcut'}</span>
        </Button>
      </div>
      <span style={{...type.caption, color: colors.textTertiary}}>Supported: Left Cmd, Right Cmd, Fn, Ctrl, Option, Shift</span>
    </Centered>
  );
};

const Permissions: React.FC<{p: OnboardingProps}> = ({p}) => {
  const {colors} = useMuesliTheme();
  const list = onboardingPermissions(p.useCase, p.permissions?.useCoreAudioTap ?? true);
  const granted = p.permissions?.granted ?? 0;
  const confirming = !!p.permissions?.confirming && granted > 0;
  const idx = confirming ? granted - 1 : granted;
  if (idx >= list.length) {
    return (
      <Centered gap={spacing[8]}>
        <Symbol name="checkmark.circle.fill" size={48} weight="regular" color={colors.success} />
        <span style={{...type.title1, color: colors.textPrimary}}>All permissions granted</span>
      </Centered>
    );
  }
  const step = list[idx];
  const bs = p.permissions?.buttonState ?? 'grant';
  const title = confirming ? 'Granted' : bs === 'waiting' ? 'Waiting for macOS...' : bs === 'openSettings' ? 'Open Settings' : 'Grant Permission';
  const dot = (i: number) => (i < idx || (confirming && i === idx) ? colors.success : i === idx ? colors.accent : colors.surfaceBorder);
  return (
    <Centered gap={spacing[24]} style={{padding: `0 ${spacing[32]}px`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8]}}>
        <span style={{...font(11, 'semibold'), color: colors.textTertiary, textTransform: 'uppercase'}}>
          Permission {idx + 1} of {list.length}
        </span>
        <span style={{...type.title1, color: colors.textPrimary}}>{step.name}</span>
        <span style={{...type.body, color: colors.textSecondary}}>{step.description}</span>
      </div>
      <span style={{height: 64, display: 'flex', alignItems: 'center'}}>
        <Symbol name={step.icon} size={48} weight="light" color={confirming ? colors.success : colors.accent} />
      </span>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: `${spacing[12]}px ${spacing[24]}px`,
          borderRadius: radius.small,
          background: confirming ? colors.success : colors.accent,
          color: confirming ? colors.onSuccess : colors.onAccent,
          ...font(14, 'semibold'),
          opacity: p.permissions?.buttonPressed ? 0.8 : bs === 'waiting' ? 0.6 : 1,
        }}
      >
        {confirming ? <Symbol name="checkmark" size={12} weight="bold" color={colors.onSuccess} /> : null}
        {title}
      </div>
      <div style={{display: 'flex', gap: 6}}>
        {list.map((_, i) => (
          <span key={i} style={{width: 8, height: 8, borderRadius: 4, background: dot(i)}} />
        ))}
      </div>
      <span style={{...type.caption, color: colors.textSecondary, maxWidth: 520}}>
        You can set up permissions later in Settings. Features that need access stay unavailable until you allow them.
      </span>
      {bs === 'waiting' ? (
        <span style={{...font(11), color: colors.textTertiary}}>Respond to the macOS permission prompt</span>
      ) : (
        <span style={{...font(11), color: colors.accentText}}>Not seeing a prompt? Open System Settings</span>
      )}
    </Centered>
  );
};

const DictationTest: React.FC<{p: OnboardingProps}> = ({p}) => {
  const {colors} = useMuesliTheme();
  const t = p.dictationTest ?? {phase: 'ready'};
  const h = p.hotkey ?? {label: 'Right Option'};
  const ready = t.phase === 'ready' || t.phase === 'listening' || t.phase === 'success';
  const voiceOnly = p.useCase.voiceNotes && !p.useCase.dictation;
  const B = (s: string) => <strong style={{fontWeight: 700}}>{s}</strong>;
  return (
    <Centered gap={spacing[24]} style={{padding: `0 ${spacing[32]}px`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8]}}>
        <span style={{...type.title1, color: colors.textPrimary}}>{voiceOnly ? 'Test Voice Note' : 'Test Dictation'}</span>
        <span style={{...type.body, color: colors.textSecondary, whiteSpace: 'pre-line'}}>
          {ready ? (
            h.isToggle ? (
              <>Press {B(h.label)} to start, then press it again when done.{'\n'}Your words should appear below.</>
            ) : voiceOnly ? (
              <>Hold {B(h.label)} to record a voice note, then release.{'\n'}Your words should appear below.</>
            ) : (
              <>Hold {B(h.label)} and say something, then release.{'\n'}Your words should appear below.</>
            )
          ) : t.phase === 'preparing' ? (
            <>Optimizing {B(p.model?.selected ?? ONBOARDING_DEFAULT_MODEL.label)} for this Mac.{'\n'}{voiceOnly ? 'Voice note test' : 'Dictation'} will unlock when it is ready.</>
          ) : (
            <>Preparing {B(p.model?.selected ?? ONBOARDING_DEFAULT_MODEL.label)} for your first test.{'\n'}{voiceOnly ? 'Voice note test' : 'Dictation'} will unlock when the model is ready.</>
          )}
        </span>
        {ready ? <span style={{...font(13, 'medium'), color: colors.accentText, paddingTop: 2}}>Try saying: "testing this one out"</span> : null}
      </div>
      {!ready ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8]}}>
          {/* ProgressView(value:) linear bar, 260 wide. VERIFY system look. */}
          <div style={{width: 260, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
            <div style={{width: `${Math.round((t.progress ?? 0) * 100)}%`, height: '100%', background: colors.toggleAccent, borderRadius: 3}} />
          </div>
          <span style={{...font(11, 'medium'), color: colors.textTertiary}}>{t.status ?? `${Math.round((t.progress ?? 0) * 100)}% complete`}</span>
          <span style={{...type.caption, color: colors.textTertiary}}>The dictation test is disabled until download and warmup complete.</span>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[16]}}>
          <div
            style={{
              width: 400,
              minHeight: 60,
              boxSizing: 'content-box',
              padding: spacing[16],
              borderRadius: radius.medium,
              background: colors.backgroundRaised,
              boxShadow: `inset 0 0 0 1px ${t.result ? withAlpha(colors.success, 0.5) : colors.surfaceBorder}`,
              textAlign: 'left',
              ...(t.result ? {font: '14px ui-monospace, SFMono-Regular, Menlo, monospace', color: colors.textPrimary} : {...font(13, 'regular', {italic: true}), color: colors.textTertiary}),
            }}
          >
            {t.result ?? 'Your transcription will appear here...'}
          </div>
          {t.phase === 'listening' ? (
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, ...type.caption, color: colors.textSecondary}}>
              <MacSpinner size={12} phase={t.progress ?? 0} />
              {h.isToggle ? `Listening... press ${h.label} again when done` : `Listening... release ${h.label} when done`}
            </span>
          ) : t.phase === 'success' ? (
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, ...type.body, color: colors.success}}>
              <Symbol name="checkmark.circle.fill" size={14} weight="regular" color={colors.success} />
              Dictation is working!
            </span>
          ) : (
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, ...type.body, color: colors.textTertiary}}>
              <Symbol name="keyboard" size={14} weight="regular" color={colors.textTertiary} />
              {`${h.isToggle ? 'Press' : 'Hold'} ${h.label} to start`}
            </span>
          )}
        </div>
      )}
    </Centered>
  );
};

const MeetingSummary: React.FC<{p: OnboardingProps}> = ({p}) => {
  const {colors} = useMuesliTheme();
  const s = p.summary ?? {provider: 'ChatGPT'};
  const tabs = ['ChatGPT', 'OpenAI', 'Anthropic', 'OpenRouter', 'Ollama'] as const;
  return (
    <Centered gap={spacing[24]} style={{padding: `0 ${spacing[32]}px`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[8]}}>
        <span style={{...type.title1, color: colors.textPrimary}}>Meeting Summaries</span>
        <span style={{...type.body, color: colors.textSecondary, whiteSpace: 'pre-line'}}>
          {'Connect an LLM provider for AI-powered meeting notes.\nRemote summaries may send transcripts, notes, screen context, and participant names off-device.'}
        </span>
      </div>
      {/* Provider tabs: 80pt each (Claude Code appears only when installed → 480 wide). */}
      <div style={{display: 'flex', borderRadius: radius.small, background: colors.backgroundRaised, boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`}}>
        {tabs.map((t) => (
          <span
            key={t}
            style={{
              width: 80,
              padding: `${spacing[8]}px 0`,
              textAlign: 'center',
              borderRadius: radius.small,
              background: s.provider === t ? colors.surfacePrimary : 'transparent',
              ...font(12, s.provider === t ? 'semibold' : 'regular'),
              color: s.provider === t ? colors.textPrimary : colors.textSecondary,
            }}
          >
            {t}
          </span>
        ))}
      </div>
      {s.provider === 'ChatGPT' ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[24]}}>
          <span style={{...type.caption, color: colors.textSecondary}}>Use your ChatGPT Plus or Pro subscription.</span>
          {s.signedIn ? (
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: radius.small, background: colors.success, ...font(13, 'medium'), color: colors.onSuccess}}>
              <OpenAILogo color={colors.onSuccess} />
              Signed in with ChatGPT
            </span>
          ) : (
            <Button kind="secondary" state="rest" style={{padding: '8px 16px', gap: 6}}>
              <OpenAILogo color={colors.textPrimary} />
              <span style={{...font(13, 'medium'), whiteSpace: 'nowrap'}}>Sign in with ChatGPT</span>
            </Button>
          )}
        </div>
      ) : null}
    </Centered>
  );
};

const CalendarAccess: React.FC<{p: OnboardingProps}> = ({p}) => {
  const {colors} = useMuesliTheme();
  const c = p.calendar ?? {granted: false};
  return (
    <Centered gap={spacing[24]} style={{padding: `0 ${spacing[32]}px`}}>
      {c.calendarIcon ? <img src={c.calendarIcon} style={{width: 80, height: 80}} /> : <Symbol name="calendar" size={64} weight="regular" color={colors.textSecondary} />}
      <span style={{...type.title1, color: colors.textPrimary}}>Bring your meetings into muesli</span>
      <span style={{...type.body, color: colors.textSecondary}}>Allow access to macOS Calendar to see upcoming meetings and get reminders.</span>
      {c.granted ? (
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, ...type.body, color: colors.success}}>
          <Symbol name="checkmark.circle.fill" size={14} weight="regular" color={colors.success} />
          Calendar access allowed
        </span>
      ) : (
        <Button kind="secondary" state="rest" style={{padding: '6px 14px'}}>
          <span style={{...type.body, whiteSpace: 'nowrap'}}>Allow Calendar Access</span>
        </Button>
      )}
      <span style={{...type.body, color: colors.accentText}}>Set up calendar accounts…</span>
      <div style={{alignSelf: 'stretch', height: 1, background: colors.surfaceBorder}} />
      <span style={{...type.caption, color: colors.textSecondary}}>Already use Google or Exchange? Add the account in macOS Internet Accounts and turn on Calendars.</span>
    </Centered>
  );
};

// ---------------- bottom bar + window ----------------

const BottomBar: React.FC<{p: OnboardingProps; steps: OnboardingStep[]}> = ({p, steps}) => {
  const {colors} = useMuesliTheme();
  const i = steps.indexOf(p.step);
  const last = i === steps.length - 1;
  const testSucceeded = p.dictationTest?.phase === 'success';
  const canGoBack = i > 0 && !(p.step === 'dictationTest' && testSucceeded);
  const allGranted = (p.permissions?.granted ?? 0) >= onboardingPermissions(p.useCase, p.permissions?.useCoreAudioTap ?? true).length;
  const ps = p.primaryState;
  const ss = p.secondaryState;
  let actions: React.ReactNode;
  switch (p.step) {
    case 'welcome':
      actions = <PrimaryButton title="Continue" enabled={!!(p.userName ?? '').trim()} state={ps} />;
      break;
    case 'model':
      actions = <PrimaryButton title={p.model?.downloaded ? 'Continue' : 'Download & Continue'} state={ps} />;
      break;
    case 'hotkey':
      actions = <PrimaryButton title="Continue" state={ps} />;
      break;
    case 'permissions':
      actions = (
        <>
          <SkipButton title="Set up later" state={ss} />
          <PrimaryButton title={last ? 'Finish' : 'Continue'} enabled={allGranted} state={ps} />
        </>
      );
      break;
    case 'dictationTest': {
      const title = p.useCase.meetings ? 'Continue' : 'Finish';
      actions = testSucceeded ? (
        <PrimaryButton title={title} state={ps} />
      ) : (
        <>
          <SkipButton state={ss} />
          <PrimaryButton title={title} enabled={false} />
        </>
      );
      break;
    }
    case 'meetingSummary':
      actions = (
        <>
          <SkipButton state={ss} />
          <PrimaryButton title="Continue" state={ps} />
        </>
      );
      break;
    case 'calendarAccess':
      actions = (
        <>
          <SkipButton title="Not now" state={ss} />
          <PrimaryButton title="Finish" state={ps} />
        </>
      );
      break;
  }
  return (
    <div style={{display: 'flex', alignItems: 'center', padding: `${spacing[16]}px ${spacing[32]}px`, flex: 'none'}}>
      <div style={{display: 'flex', gap: 6}}>
        {steps.map((s) => (
          <span key={s} style={{width: 7, height: 7, borderRadius: 3.5, background: s === p.step ? colors.accent : colors.textTertiary}} />
        ))}
      </div>
      <span style={{flex: 1}} />
      <div style={{display: 'flex', alignItems: 'center', gap: spacing[12]}}>
        {canGoBack ? <SkipButton title="Back" state={p.backState} /> : null}
        {actions}
      </div>
    </div>
  );
};

/** The onboarding content (640×520) without window chrome. */
export const OnboardingContent: React.FC<OnboardingProps> = (p) => {
  const {colors} = useMuesliTheme();
  const steps = onboardingSteps(p.useCase);
  const body = {
    welcome: <Welcome p={p} />,
    model: <Model p={p} />,
    hotkey: <Hotkey p={p} />,
    permissions: <Permissions p={p} />,
    dictationTest: <DictationTest p={p} />,
    meetingSummary: <MeetingSummary p={p} />,
    calendarAccess: <CalendarAccess p={p} />,
  }[p.step];
  return (
    <div style={{width: ONBOARDING_SIZE.w, height: ONBOARDING_SIZE.h, display: 'flex', flexDirection: 'column', background: colors.backgroundBase, ...type.body, color: colors.textPrimary}}>
      <div style={{flex: 1, minHeight: 0}}>{body}</div>
      <div style={{height: 1, background: colors.surfaceBorder, flex: 'none'}} />
      <BottomBar p={p} steps={steps} />
    </div>
  );
};

/** OnboardingWindowController: the titled 640×520 window ("Welcome to muesli", title hidden). Render inside a dark theme. */
export const OnboardingWindow: React.FC<OnboardingProps & {focused?: boolean; shadow?: boolean}> = ({focused = true, shadow = true, ...p}) => (
  <MacWindow width={ONBOARDING_SIZE.w} height={ONBOARDING_SIZE.h + 32} focused={focused} shadow={shadow}>
    <OnboardingContent {...p} />
  </MacWindow>
);
