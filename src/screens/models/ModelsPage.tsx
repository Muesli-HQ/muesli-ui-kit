// ModelsView.swift @ v0.8.6 — the Models page: title, intro, category picker, and the Dictation and Cotypist
// categories (modelCard, familyCard, cotypistModelCard, downloadProgressView, brandLogo, actionButtons).
// Catalog strings: BackendOption (Models.swift) and CotypistModel (CotypistEngine.swift). Live Meetings,
// Cleanup and Quill categories, Bodhan cards and the Experimental disclosure are not ported yet.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type, font} from '../../typography';
import {spacing, radius, layout, withAlpha} from '../../tokens/theme';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {MacSegmented, MacPopUp, MacProgressBar} from '../settings/controls';
import {SettingsSectionHeading, OPENAI_LOGO_PATH} from '../settings';
import nvidiaLogo from './logos/nvidia-logo.png';
import qwenLogo from './logos/qwen-logo.png';
import cohereLogo from './logos/cohere-logo.png';
import fermionLogo from './logos/fermion-logo.png';

export type ModelsCategoryId = 'dictation' | 'streaming' | 'postProcessing' | 'quill' | 'cotypist';
export const MODELS_CATEGORIES: Array<{id: ModelsCategoryId; title: string}> = [
  {id: 'dictation', title: 'Dictation'},
  {id: 'streaming', title: 'Live Meetings'},
  {id: 'postProcessing', title: 'Cleanup'},
  {id: 'quill', title: 'Quill'},
  {id: 'cotypist', title: 'Cotypist'},
];

// ---------- Catalog (Models.swift BackendOption / CotypistEngine.swift CotypistModel) ----------

export interface BackendOptionInfo {
  label: string;
  sizeLabel: string;
  description: string;
  recommended?: boolean;
}

export const BACKENDS = {
  appleSpeech: {label: 'Apple Speech', sizeLabel: 'System managed', description: "Apple's private, on-device speech model for macOS 26. It is designed for dictation, meetings, distant speakers, and long recordings, while macOS manages the language assets and updates."},
  parakeetUnified: {label: 'Parakeet Unified', sizeLabel: '~565 MB', description: 'The best English dictation. Lowest error rate, newest architecture, instant. For other languages, choose Parakeet v3.', recommended: true},
  parakeetMultilingual: {label: 'Parakeet v3', sizeLabel: '~450 MB', description: 'Fast, reliable dictation in 25 languages.'},
  parakeetRedux: {label: 'Parakeet Redux', sizeLabel: '~220 MB', description: 'A smaller download for dictation in 25 languages.'},
  parakeetEnglish: {label: 'Parakeet v2', sizeLabel: '~450 MB', description: 'A quick, dependable English-only option. Choose it if you mainly dictate in English and prefer the older Parakeet model.'},
  phonon25: {label: 'Phonon-2.5', sizeLabel: '~290 MB', description: 'Compact multilingual transcription in 25 languages.'},
  whisperTiny: {label: 'Whisper Tiny Multilingual', sizeLabel: '~153 MB', description: 'The quickest Whisper download and lightest multilingual option for occasional notes. It gives up some accuracy on accents, noise, and longer speech. Auto-detect language by default, or choose one yourself.'},
  whisperTinyEnglish: {label: 'Whisper Tiny English', sizeLabel: '~153 MB', description: 'The quickest English-only Whisper option for lightweight notes. Choose it when you always speak English and do not need automatic language detection.'},
  whisperSmall: {label: 'Whisper Small Multilingual', sizeLabel: '~250 MB', description: "A balanced multilingual Whisper option for everyday notes. It handles accents and background noise better than Tiny while keeping the download modest. Auto-detect language by default, or choose one yourself."},
  whisperSmallEnglish: {label: 'Whisper Small English', sizeLabel: '~250 MB', description: 'A balanced English-only Whisper option for everyday dictation. It handles accents and background noise better than Tiny when you do not need other languages.'},
  whisperMediumEnglish: {label: 'Whisper Medium English', sizeLabel: '~1.5 GB', description: 'A larger English-only Whisper option for difficult accents and noisier recordings. It favors accuracy over download size and speed.'},
  whisperLargeTurbo: {label: 'Whisper Large Turbo Multilingual', sizeLabel: '~626 MB', description: "Whisper's strongest multilingual option. Better for mixed languages and difficult audio, with a larger download and more processing time than Small. Auto-detect language by default, or pin a language."},
  medASR: {label: 'MedASR', sizeLabel: '~212 MB', description: 'English medical dictation from Google, running locally.'},
  cohereTranscribe: {label: 'Cohere Transcribe', sizeLabel: '~3.8 GB', description: 'The most deliberate option for difficult accents and tricky audio. It supports 14 languages and can be more accurate than faster models, but the download is large and you only see the result after you stop speaking.'},
} satisfies Record<string, BackendOptionInfo>;
export type BackendId = keyof typeof BACKENDS;

export const PARAKEET_FAMILY: BackendId[] = ['parakeetUnified', 'parakeetMultilingual', 'parakeetRedux', 'parakeetEnglish'];
export const WHISPER_FAMILY: BackendId[] = ['whisperTiny', 'whisperTinyEnglish', 'whisperSmall', 'whisperSmallEnglish', 'whisperMediumEnglish', 'whisperLargeTurbo'];

export type CotypistModelId = 'qwen35_0_8b' | 'qwen35_2b' | 'gemma4E2B';
/** sizeLabel = "~" + ByteCountFormatter(.file) of the pinned release files. */
export const COTYPIST_MODELS: Record<CotypistModelId, {label: string; summary: string; sizeLabel: string; logo: Logo; recommended: boolean}> = {
  qwen35_0_8b: {label: 'Qwen 3.5 0.8B', summary: 'As accurate as Gemma on real writing at a ninth of the size, and about twice as fast.', sizeLabel: '~444.1 MB', logo: 'qwen-logo', recommended: true},
  qwen35_2b: {label: 'Qwen 3.5 2B', summary: "The most accurate in testing, at about Gemma's speed and a third of its size.", sizeLabel: '~1.08 GB', logo: 'qwen-logo', recommended: false},
  gemma4E2B: {label: 'Gemma 4 E2B', summary: "Cotypist's first model. Accurate, but the largest and slowest of the three.", sizeLabel: '~3.61 GB', logo: 'google-logo', recommended: false},
};

// ---------- Logos ----------

export type Logo = 'apple-system-logo' | 'openai-logo' | 'nvidia-logo' | 'qwen-logo' | 'google-logo' | 'cohere-logo' | 'fermion-logo';
const IMAGE_LOGOS: Partial<Record<Logo, string>> = {'nvidia-logo': nvidiaLogo, 'qwen-logo': qwenLogo, 'cohere-logo': cohereLogo, 'fermion-logo': fermionLogo};

/** assets/google-logo.svg */
const GoogleG: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/** brandLogo: 32×32. SF apple.logo / OpenAILogoShape in textPrimary; bundled images 24×24 on a white 32×32 tile (radius 8). */
export const BrandLogo: React.FC<{logo?: Logo}> = ({logo}) => {
  const {colors} = useMuesliTheme();
  if (!logo) return null;
  let inner: React.ReactNode;
  if (logo === 'apple-system-logo') inner = <Symbol name="apple.logo" size={23} weight="medium" color={colors.textPrimary} />;
  else if (logo === 'openai-logo')
    inner = (
      <svg width={23} height={23} viewBox="0 0 24 24" aria-hidden>
        <path d={OPENAI_LOGO_PATH} fill={colors.textPrimary} fillRule="evenodd" />
      </svg>
    );
  else
    inner = (
      <div style={{width: 32, height: 32, borderRadius: 8, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {logo === 'google-logo' ? <GoogleG size={24} /> : <img src={IMAGE_LOGOS[logo]} style={{width: 24, height: 24, objectFit: 'contain'}} />}
      </div>
    );
  return <div style={{width: 32, height: 32, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{inner}</div>;
};

// ---------- Shared bits ----------

export interface DownloadSnapshot {
  fraction: number;
  phase?: 'downloading' | 'preparing' | 'paused' | 'failed';
  currentFile?: string;
  message?: string;
  completedFiles?: number;
  totalFiles?: number;
  completedBytes?: number;
  totalBytes?: number;
  bytesPerSecond?: number;
  etaSeconds?: number;
}

/** ModelDownloadDisplayFormatting.bytes / rate / eta */
const fmtBytes = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b >= 1e3 ? `${(b / 1e3).toFixed(1)} KB` : `${b} B`);
const fmtRate = (r: number) => (r <= 0 ? '' : r >= 1e9 ? `${(r / 1e9).toFixed(1)} GB/s` : r >= 1e6 ? `${(r / 1e6).toFixed(1)} MB/s` : `${(r / 1e3).toFixed(1)} KB/s`);
const fmtEta = (s: number) => {
  const t = Math.round(s);
  if (t < 60) return `${t}s`;
  const m = Math.floor(t / 60);
  if (m < 60) return `${m}m ${String(t % 60).padStart(2, '0')}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};
const PHASE_LABEL = {downloading: 'Downloading', preparing: 'Preparing', paused: 'Download paused', failed: 'Failed'} as const;

/** downloadProgressView (snapshot form). */
export const DownloadProgress: React.FC<{s: DownloadSnapshot}> = ({s}) => {
  const {colors} = useMuesliTheme();
  const phase = s.phase ?? 'downloading';
  const details: string[] = [];
  if (s.totalFiles && s.totalFiles > 0) {
    const done = Math.min(Math.max(s.completedFiles ?? 0, 0), s.totalFiles);
    const left = s.totalFiles - done;
    details.push(`${done} of ${s.totalFiles} ${s.totalFiles === 1 ? 'file' : 'files'}`);
    if (left > 0) details.push(`${left} ${left === 1 ? 'file' : 'files'} left`);
  }
  if (s.totalBytes && s.totalBytes > 0) {
    const done = s.completedBytes ?? 0;
    details.push(`${fmtBytes(done)} / ${fmtBytes(s.totalBytes)}`);
    if (done < s.totalBytes) details.push(`${fmtBytes(s.totalBytes - done)} left`);
  }
  if (phase === 'downloading') {
    if (s.bytesPerSecond && s.bytesPerSecond > 0) details.push(fmtRate(s.bytesPerSecond));
    if (s.etaSeconds !== undefined) details.push(`${fmtEta(s.etaSeconds)} left`);
  } else if (s.message) details.push(s.message);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      {phase !== 'preparing' ? <MacProgressBar value={s.fraction} /> : null}
      {s.currentFile ? (
        <span style={{...type.captionMedium, color: colors.textSecondary}}>
          {PHASE_LABEL[phase]}: {s.currentFile.split('/').pop()}
        </span>
      ) : (
        <span style={{...type.captionMedium, color: phase === 'failed' ? colors.destructiveText : colors.textSecondary}}>{s.message ?? PHASE_LABEL[phase]}</span>
      )}
      {details.length ? <span style={{...type.metadata, color: colors.textSecondary}}>{details.join(' · ')}</span> : null}
    </div>
  );
};

/** modelCardButton: 12 medium, padding h12 v4, .tinted (prominent) or .secondary, bordered: false. */
export const ModelCardButton: React.FC<{title: string; prominent?: boolean; state?: ControlState}> = ({title, prominent = true, state = 'rest'}) => (
  <Button kind={prominent ? 'tinted' : 'secondary'} bordered={false} state={state} style={{padding: `4px ${spacing[12]}px`}}>
    <span style={{...font(12, 'medium')}}>{title}</span>
  </Button>
);

/** modelDeleteButton: trash 12 destructiveText in a 28×28 .quiet button. */
export const ModelDeleteButton: React.FC<{state?: ControlState}> = ({state = 'rest'}) => {
  const {colors} = useMuesliTheme();
  return (
    <Button kind="quiet" state={state} style={{width: 28, height: 28}}>
      <Symbol name="trash" size={12} weight="regular" color={colors.destructiveText} />
    </Button>
  );
};

const Badge: React.FC<{kind: 'active' | 'downloaded' | 'incompatible'; label: string}> = ({kind, label}) => {
  const {colors} = useMuesliTheme();
  return kind === 'active' ? (
    <span style={{...font(11, 'semibold'), color: colors.successText, padding: '3px 8px', background: withAlpha(colors.success, 0.15), borderRadius: 4, flex: 'none', whiteSpace: 'nowrap'}}>{label}</span>
  ) : (
    <span style={{...type.metadata, color: colors.textTertiary, padding: '3px 8px', background: colors.surfacePrimary, borderRadius: 4, flex: 'none', whiteSpace: 'nowrap'}}>{label}</span>
  );
};

const RecommendedTag: React.FC = () => {
  const {colors} = useMuesliTheme();
  return <span style={{...type.metadata, color: colors.onAccent, padding: '2px 6px', background: colors.accent, borderRadius: 4, flex: 'none'}}>Recommended</span>;
};

const Card: React.FC<{highlighted: boolean; children: React.ReactNode}> = ({highlighted, children}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[12],
        padding: spacing[16],
        background: colors.backgroundRaised,
        borderRadius: radius.medium,
        boxShadow: `inset 0 0 0 ${highlighted ? 1.5 : 1}px ${highlighted ? withAlpha(colors.accent, 0.5) : colors.surfaceBorder}`,
      }}
    >
      {children}
    </div>
  );
};

/** Markdown attribution line (caption, textTertiary); [links] draw in the tint colour. VERIFY link colour. */
const Attribution: React.FC<{parts: string[]}> = ({parts}) => {
  const {colors} = useMuesliTheme();
  return (
    <span style={{...type.caption, color: colors.textTertiary}}>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 ? ' · ' : ''}
          {p.startsWith('[') ? <span style={{color: colors.accent}}>{p.slice(1, -1)}</span> : p}
        </React.Fragment>
      ))}
    </span>
  );
};

// ---------- Dictation cards ----------

export type ModelStatus = 'notDownloaded' | 'downloading' | 'downloaded' | 'active';
export interface ModelCardState {
  status: ModelStatus;
  download?: DownloadSnapshot;
  /** Hover/press for the main action button. */
  actionState?: ControlState;
}

const ActionButtons: React.FC<{st: ModelCardState; systemManaged?: boolean}> = ({st, systemManaged}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
    {st.status === 'downloading' ? (
      <ModelCardButton title="Pause" prominent={false} state={st.actionState} />
    ) : st.status === 'downloaded' || st.status === 'active' ? (
      <>
        {st.status !== 'active' ? <ModelCardButton title="Set Active" state={st.actionState} /> : null}
        {!systemManaged ? <ModelDeleteButton /> : null}
      </>
    ) : (
      <ModelCardButton title="Download" state={st.actionState} />
    )}
  </div>
);

/** modelCard(option:logo:…) */
export const ModelCard: React.FC<{option: BackendId; logo?: Logo; st: ModelCardState; downloadedLabel?: string; systemManaged?: boolean; attribution?: string[]; language?: string}> = ({
  option,
  logo,
  st,
  downloadedLabel = 'Downloaded',
  systemManaged,
  attribution,
  language,
}) => {
  const {colors} = useMuesliTheme();
  const o: BackendOptionInfo = BACKENDS[option];
  return (
    <Card highlighted={st.status === 'active'}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[12]}}>
        <BrandLogo logo={logo} />
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing[4]}}>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
            <span style={{...type.headline, color: colors.textPrimary}}>{o.label}</span>
            {o.recommended ? <RecommendedTag /> : null}
            <span style={{...type.caption, color: colors.textTertiary}}>{o.sizeLabel}</span>
          </div>
          <span style={{...type.caption, color: colors.textSecondary}}>{o.description}</span>
        </div>
        {st.status === 'active' ? <Badge kind="active" label="Active" /> : st.status === 'downloaded' ? <Badge kind="downloaded" label={downloadedLabel} /> : null}
      </div>
      {attribution ? <Attribution parts={attribution} /> : null}
      {language !== undefined ? (
        <div style={{display: 'flex', alignItems: 'center', gap: spacing[12]}}>
          <span style={{...type.caption, color: colors.textTertiary, width: 64, flex: 'none'}}>Language</span>
          <MacPopUp value={language} width={220} />
        </div>
      ) : null}
      {st.status === 'downloading' && st.download ? <DownloadProgress s={st.download} /> : null}
      <ActionButtons st={st} systemManaged={systemManaged} />
    </Card>
  );
};

/** familyCard(title:subtitle:defaultBadge:logo:selection:options:) */
export const FamilyCard: React.FC<{title: string; subtitle: string; defaultBadge: string; logo?: Logo; variant: BackendId; st: ModelCardState; showLanguage?: string}> = ({
  title,
  subtitle,
  defaultBadge,
  logo,
  variant,
  st,
  showLanguage,
}) => {
  const {colors} = useMuesliTheme();
  const o: BackendOptionInfo = BACKENDS[variant];
  return (
    <Card highlighted={st.status === 'active'}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[12]}}>
        <BrandLogo logo={logo} />
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing[4]}}>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
            <span style={{...type.headline, color: colors.textPrimary}}>{title}</span>
            <span style={{...type.metadata, color: colors.accentText, padding: '4px 8px', background: colors.accentSubtle, borderRadius: 9999}}>{defaultBadge}</span>
          </div>
          <span style={{...type.caption, color: colors.textSecondary}}>{subtitle}</span>
        </div>
        {st.status === 'active' ? <Badge kind="active" label="Active" /> : st.status === 'downloaded' ? <Badge kind="downloaded" label="Downloaded" /> : null}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: spacing[12]}}>
        <span style={{...type.caption, color: colors.textSecondary, width: 52, flex: 'none'}}>Variant</span>
        {/* Picker(.menu) hugs its title inside .frame(maxWidth: 220, alignment: .leading) — measured from reference. */}
        <div style={{width: 220, flex: 'none', display: 'flex'}}>
          <MacPopUp value={o.label} hug />
        </div>
        <span style={{...type.caption, color: colors.textTertiary}}>{o.sizeLabel}</span>
      </div>
      <span style={{...type.caption, color: colors.textSecondary}}>{o.description}</span>
      {showLanguage !== undefined ? (
        <>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[12]}}>
            <span style={{...type.caption, color: colors.textTertiary, width: 64, flex: 'none'}}>Language</span>
            <MacPopUp value={showLanguage} width={220} />
          </div>
          {variant.startsWith('parakeet') ? <span style={{...type.caption, color: colors.textTertiary}}>Filters writing script; Parakeet v2 ignores this setting.</span> : null}
        </>
      ) : null}
      {st.status === 'downloading' && st.download ? <DownloadProgress s={st.download} /> : null}
      <ActionButtons st={st} />
    </Card>
  );
};

// ---------- Cotypist cards ----------

export type CotypistModelCardState =
  | {kind: 'ready'}
  | {kind: 'missing'}
  | {kind: 'downloading'; download: DownloadSnapshot}
  | {kind: 'failed'; message: string}
  | {kind: 'unavailable'};

export const CotypistModelCard: React.FC<{model: CotypistModelId; state: CotypistModelCardState; selected: boolean; actionState?: ControlState}> = ({model, state, selected, actionState}) => {
  const {colors} = useMuesliTheme();
  const m = COTYPIST_MODELS[model];
  const inUse = selected && state.kind === 'ready';
  return (
    <Card highlighted={inUse}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: spacing[12]}}>
        <BrandLogo logo={m.logo} />
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing[4]}}>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
            <span style={{...type.headline, color: colors.textPrimary}}>{m.label}</span>
            {m.recommended ? <RecommendedTag /> : null}
            <span style={{...type.caption, color: colors.textTertiary}}>{m.sizeLabel}</span>
          </div>
          <span style={{...type.caption, color: colors.textSecondary}}>{m.summary}</span>
        </div>
        {inUse ? <Badge kind="active" label="Cotypist Active" /> : state.kind === 'ready' ? <Badge kind="downloaded" label="Downloaded" /> : null}
      </div>
      {state.kind === 'downloading' ? <DownloadProgress s={state.download} /> : null}
      {state.kind === 'failed' ? <span style={{...type.caption, color: colors.destructiveText}}>Download failed: {state.message}</span> : null}
      {/* The action HStack is always present (empty for the selected, ready model). */}
      <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], minHeight: inUse ? 0 : undefined}}>
        {state.kind === 'downloading' ? (
          <ModelCardButton title="Pause" prominent={false} state={actionState} />
        ) : state.kind === 'ready' ? (
          !selected ? (
            <>
              <ModelCardButton title="Use for Cotypist" state={actionState} />
              <ModelDeleteButton />
            </>
          ) : null
        ) : state.kind === 'missing' || state.kind === 'failed' ? (
          <ModelCardButton title="Download" state={actionState} />
        ) : (
          <span style={{...type.caption, color: colors.textTertiary}}>Coming soon</span>
        )}
      </div>
    </Card>
  );
};

// ---------- Page ----------

export interface DictationModelsState {
  appleSpeech: ModelCardState;
  /** apple_speech_language label, e.g. "System Language - English (United Kingdom)" (AppleSpeechAnalyzerBackend). */
  appleSpeechLanguage?: string;
  parakeetVariant: BackendId;
  parakeet: ModelCardState;
  whisperVariant: BackendId;
  whisper: ModelCardState;
  phonon25: ModelCardState;
  medASR: ModelCardState;
  cohereTranscribe: ModelCardState;
}

export interface CotypistModelsState {
  selected: CotypistModelId;
  models: Record<CotypistModelId, CotypistModelCardState>;
  actionStates?: Partial<Record<CotypistModelId, ControlState>>;
}

export interface ModelsPageProps {
  category: ModelsCategoryId;
  scrollY?: number;
  dictation?: DictationModelsState;
  cotypist?: CotypistModelsState;
  /** CotypistSetup.isAvailable: the Cotypist category and intro wording only appear in builds that bundle it. */
  cotypistAvailable?: boolean;
}

/** ModelsView: ScrollView { VStack(spacing 24) { title1 "Models"; body intro; segmented (max 600, centred); content } }. */
export const ModelsPage: React.FC<ModelsPageProps> = ({category, scrollY = 0, dictation, cotypist, cotypistAvailable = true}) => {
  const {colors} = useMuesliTheme();
  const cats = MODELS_CATEGORIES.filter((c) => c.id !== 'cotypist' || cotypistAvailable);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: colors.backgroundBase}}>
      <div style={{transform: `translateY(${-scrollY}px)`, padding: `${layout.pageTop}px ${spacing[32]}px ${spacing[32]}px`, display: 'flex', flexDirection: 'column', gap: spacing[24]}}>
        <div style={{...type.title1, color: colors.textPrimary}}>Models</div>
        <div style={{...type.body, color: colors.textSecondary}}>
          {cotypistAvailable
            ? 'Choose the dictation, live meeting, cleanup, Quill, and Cotypist models that fit how you speak and work.'
            : 'Choose the dictation, live meeting, cleanup, and Quill models that fit how you speak and work.'}
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          {/* .frame(maxWidth: 600) only caps it: measured from reference, the control hugs its titles (5 × 105pt). */}
          <MacSegmented options={cats.map((c) => c.title)} selected={cats.findIndex((c) => c.id === category)} style={{maxWidth: 600}} />
        </div>
        {category === 'dictation' && dictation ? (
          <>
            <ModelCard option="appleSpeech" logo="apple-system-logo" st={dictation.appleSpeech} downloadedLabel="Available" systemManaged language={dictation.appleSpeechLanguage} />
            <FamilyCard
              title="Parakeet Family"
              subtitle="The most responsive choices for everyday dictation, with multilingual and English-only options."
              defaultBadge="Recommended: Unified"
              logo="nvidia-logo"
              variant={dictation.parakeetVariant}
              st={dictation.parakeet}
              showLanguage={dictation.parakeetVariant === 'parakeetUnified' ? undefined : 'Auto-detect'}
            />
            <FamilyCard
              title="Whisper"
              subtitle="Dependable alternatives when you prefer Whisper's transcription style or need broader multilingual coverage."
              defaultBadge="Default: Small"
              logo="openai-logo"
              variant={dictation.whisperVariant}
              st={dictation.whisper}
              showLanguage={dictation.whisperVariant.endsWith('English') ? undefined : 'Auto-detect'}
            />
            <ModelCard
              option="phonon25"
              logo="fermion-logo"
              st={dictation.phonon25}
              attribution={['[Fermion Research]', '[Core ML conversion]', '[CC BY 4.0]']}
            />
            <ModelCard option="medASR" logo="google-logo" st={dictation.medASR} attribution={['[Google]', 'English', '[Model terms]']} />
            <ModelCard option="cohereTranscribe" logo="cohere-logo" st={dictation.cohereTranscribe} />
          </>
        ) : null}
        {category === 'cotypist' && cotypist ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: spacing[12]}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: spacing[4], paddingTop: spacing[8]}}>
              <SettingsSectionHeading title="Cotypist" />
              <span style={{...type.caption, color: colors.textSecondary, paddingLeft: 2}}>The model that suggests your next words as you type. All run on this Mac; smaller ones answer faster.</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: spacing[12]}}>
              {(Object.keys(COTYPIST_MODELS) as CotypistModelId[]).map((id) => (
                <CotypistModelCard key={id} model={id} state={cotypist.models[id]} selected={cotypist.selected === id} actionState={cotypist.actionStates?.[id]} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
