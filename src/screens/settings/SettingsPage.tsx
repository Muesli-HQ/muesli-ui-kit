// SettingsView.swift @ v0.8.6 — the Settings page (title, pane picker, panes) with the General, Appearance and
// Experimental panes ported. Labels: SettingsView.swift + MuesliSettingsDefinitions.swift + Models.swift enums.
// Experimental also includes TimeTurnerSettingsView.swift (off state). Dictations and Meetings panes live in
// DictationMeetingsPanes.tsx.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type, font} from '../../typography';
import {spacing, radius, layout, withAlpha, accentPalette} from '../../tokens/theme';
import {Symbol, MuesliMark, VidshotIcon} from '../../icons/Icon';
import {Button} from '../../primitives/Button';
import {
  MacSwitch,
  MacPopUp,
  MacSegmented,
  MacSlider,
  MacPushButton,
  MacProgressBar,
  MacNumberField,
  MacStepper,
  SettingsDivider,
  systemSecondaryLabel,
} from './controls';
import {SettingsSection, SettingsRow, SettingsNote, SettingsLayout, CompactActionButton, AccentActionButton, ActionButton} from './SettingsLayout';
import {RecordingIndicatorStylePicker, type RecordingIndicatorStyle} from './RecordingIndicatorStylePicker';
import {DictationsPane, MeetingsPane, type DictationSettingsState, type MeetingsSettingsState} from './DictationMeetingsPanes';

export type SettingsPaneId = 'general' | 'dictation' | 'meetings' | 'appearance' | 'experimental';
export const SETTINGS_PANES: Array<{id: SettingsPaneId; title: string}> = [
  {id: 'general', title: 'General'},
  {id: 'dictation', title: 'Dictations'},
  {id: 'meetings', title: 'Meetings'},
  {id: 'appearance', title: 'Appearance'},
  {id: 'experimental', title: 'Experimental'},
];

// ---------------- State ----------------

export interface GeneralSettingsState {
  launchAtLogin: boolean;
  openDashboardOnLaunch: boolean;
  /** systemAudio is shown only when config.useCoreAudioTap is on. */
  permissions: {microphone: boolean; accessibility: boolean; inputMonitoring: boolean; screenRecording: boolean; systemAudio?: boolean; calendars: boolean};
  /** LocalStorageUsageView: bytes per category. */
  sync?: SyncState;
  storage: {models: number; meetingAudio: number; meetingVideo: number; feedbackCaptures: number; database: number; waveformCache: number; other: number; freeBytes: number};
}

/** iCloud Sync card state (SettingsView.syncSettingsPane). */
export interface SyncState {
  status: string;
  action: string;
  actionSymbol: string;
  /** ICloudLinkedDeviceRow: platform "iPhone" (iphone.gen3) or "iPad" (ipad). */
  linkedDevice?: {name: string; platform: 'iPhone' | 'iPad'};
}
export const SYNC_NOT_CONFIGURED: SyncState = {status: 'Set up private iCloud text sync.', action: 'Set up sync', actionSymbol: 'icloud'};

export type AppAppearanceMode = 'light' | 'system' | 'dark' | 'ultra_dark';
export interface AppearanceSettingsState {
  indicatorStyle: RecordingIndicatorStyle;
  showFloatingIndicator: boolean;
  /** IndicatorAnchor label, e.g. "Middle Right" (default). */
  indicatorPosition: string;
  showHotkeyOnHover: boolean;
  theme: AppAppearanceMode;
  /** MenuBarIconRenderer option id (default "muesli"). */
  menuBarIcon: string;
  showHotkeyInMenuBar: boolean;
  /** MuesliSettings.accentPresets hex (default "1e1e2e"). */
  accentHex: string;
  soundEnabled: boolean;
  showNextMeeting: boolean;
}

export type CotypistSetupState = 'off' | 'addingInputSource' | 'on';
export type CotypistModelState = {kind: 'ready'} | {kind: 'missing'} | {kind: 'downloading'; fraction: number} | {kind: 'failed'; message: string} | {kind: 'unavailable'};
export interface CotypistSettingsState {
  state: CotypistSetupState;
  suggestsRelogin?: boolean;
  /** Shown while the feature is unseen (NewFeatureBadge .cotypist). */
  showNewBadge?: boolean;
  modelLabel: string;
  modelSizeLabel: string;
  modelState: CotypistModelState;
  /** CotypistSuggestionLength label. */
  length: string;
  /** CotypistFrequency index 0…2 (Fewer, more accurate · Balanced · More often). */
  frequencyIndex: number;
  completeWords: boolean;
  /** CotypistWordPause label. */
  wordPause: string;
  useScreenContext: boolean;
  quietApps: Array<{name: string; icon?: string}>;
  recommendedApps: Array<{name: string; icon?: string}>;
}

export interface ExperimentalSettingsState {
  vidshotEnabled: boolean;
  drawModifier: string;
  timeTurnerEnabled: boolean;
  plannerEnabled: boolean;
  plannerBackend: string;
  chatGPTSignedIn: boolean;
  plannerModel: string;
  /** ReasoningEffort labels the planner model offers, and the selected index. */
  thinkingChoices: string[];
  thinkingIndex: number;
  timeoutSeconds: number;
  quillEnabled: boolean;
  quillSounds: boolean;
  quillSource: string;
  quillLocalModel?: string;
  cotypistAvailable: boolean;
  cotypist: CotypistSettingsState;
}

export interface SettingsPageProps {
  pane: SettingsPaneId;
  /** ScrollView offset in points. */
  scrollY?: number;
  /** Detail-area width (DashboardContent: 1120 − 240 − 1). */
  width?: number;
  general?: GeneralSettingsState;
  appearance?: AppearanceSettingsState;
  experimental?: ExperimentalSettingsState;
  dictation?: DictationSettingsState;
  meetings?: MeetingsSettingsState;
}

// ---------------- Helpers ----------------

const CONTROL_W = SettingsLayout.controlWidth;
/** Color.opacity(k) on an rgba() role. */
const scaleAlpha = (rgba: string, k: number) => rgba.replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/, (_m, r, g, b, a) => `rgba(${r},${g},${b},${Number(a) * k})`);
const Divider = () => <SettingsDivider />;

/** ByteCountFormatter(.file), adaptive: KB 0 dp, MB 1 dp, GB 2 dp. */
export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} bytes`;
  const units: Array<[number, string, number]> = [[1e12, 'TB', 2], [1e9, 'GB', 2], [1e6, 'MB', 1], [1e3, 'KB', 0]];
  for (const [v, u, dp] of units) {
    if (bytes >= v) {
      const n = bytes / v;
      return `${Number(n.toFixed(dp)).toString()} ${u}`;
    }
  }
  return `${bytes} bytes`;
}

// ---------------- General ----------------

const PermissionRow: React.FC<{name: string; granted: boolean; actionTitle?: string}> = ({name, granted, actionTitle = 'Grant'}) => {
  const {colors} = useMuesliTheme();
  return (
    <SettingsRow label={name} controlWidth={null}>
      <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
        {granted ? (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, ...type.captionMedium, color: colors.successText}}>
            <Symbol name="checkmark.circle.fill" size={12} weight="medium" color={colors.successText} />
            Granted
          </span>
        ) : (
          <AccentActionButton title={actionTitle} />
        )}
        <span style={{width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
          <Symbol name="arrow.up.forward.square" size={11} weight="regular" color={colors.textSecondary} />
        </span>
      </div>
    </SettingsRow>
  );
};

/** LocalStorageUsageView.swift. Category colours are SwiftUI system colours. VERIFY exact values. */
const LocalStorageUsage: React.FC<{s: GeneralSettingsState['storage']}> = ({s}) => {
  const {colors, isDark} = useMuesliTheme();
  const sys = isDark
    ? {blue: '#0A84FF', teal: '#40CBE0', purple: '#BF5AF2', red: '#FF453A', orange: '#FF9F0A', pink: '#FF375F', gray: '#98989D'}
    : {blue: '#007AFF', teal: '#30B0C7', purple: '#AF52DE', red: '#FF3B30', orange: '#FF9500', pink: '#FF2D55', gray: '#8E8E93'};
  const cats: Array<[keyof typeof s, string, string, string]> = [
    ['models', 'Downloaded models', 'cpu', sys.blue],
    ['meetingAudio', 'Meeting audio', 'waveform', sys.teal],
    ['meetingVideo', 'Meeting video', 'video', sys.purple],
    ['feedbackCaptures', 'Vidshot captures', 'vidshot', sys.red],
    ['database', 'Notes, transcripts & app database', 'externaldrive', sys.orange],
    ['waveformCache', 'Audio waveform cache', 'waveform.path', sys.pink],
    ['other', 'Other app data', 'folder', sys.gray],
  ];
  const total = cats.reduce((a, [k]) => a + s[k], 0);
  const secondary = systemSecondaryLabel(isDark);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{display: 'flex', alignItems: 'flex-start'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1}}>
          <span style={{...font(26, 'semibold'), fontVariantNumeric: 'tabular-nums', color: colors.textPrimary}}>{formatBytes(total)}</span>
          <span style={{...type.caption, color: secondary}}>muesli data and downloaded models</span>
        </div>
        <Button kind="quiet" style={{width: 28, height: 28}}>
          <Symbol name="arrow.clockwise" size={13} weight="regular" color={colors.textPrimary} />
        </Button>
      </div>
      {/* 8pt capsule; .background(.quaternary). VERIFY quaternary fill. */}
      <div style={{height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
        {cats.map(([k, , , c]) => (
          <div key={k} style={{width: `${(s[k] / Math.max(1, total)) * 100}%`, background: c}} />
        ))}
      </div>
      {cats.map(([k, title, icon, c]) => (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 20, display: 'inline-flex', justifyContent: 'center'}}>
            {icon === 'vidshot' ? <VidshotIcon size={16} color={c} /> : <Symbol name={icon} size={14} weight="regular" color={c} />}
          </span>
          {k === 'models' ? (
            <span style={{...type.body, color: colors.textPrimary, display: 'inline-flex', alignItems: 'center', gap: 6}}>
              {title}
              <Symbol name="chevron.right" size={9} weight="regular" color={colors.textPrimary} />
            </span>
          ) : (
            <span style={{...type.body, color: colors.textPrimary}}>{title}</span>
          )}
          <span style={{flex: 1}} />
          <span style={{...type.body, fontVariantNumeric: 'tabular-nums', color: secondary}}>{formatBytes(s[k])}</span>
        </div>
      ))}
      <SettingsDivider style={{background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}} />
      <div style={{display: 'flex', ...type.caption, color: secondary}}>
        <span style={{flex: 1}}>Includes shared model caches</span>
        <span>{formatBytes(s.freeBytes)} available</span>
      </div>
    </div>
  );
};

const GeneralPane: React.FC<{s: GeneralSettingsState}> = ({s}) => {
  const p = s.permissions;
  return (
    <>
      <SettingsSection title="General">
        <SettingsRow label="Launch at login" controlWidth={null}>
          <MacSwitch on={s.launchAtLogin} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Open dashboard on launch" controlWidth={null}>
          <MacSwitch on={s.openDashboardOnLaunch} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="iCloud Sync">
        {/* syncStatusDetails | syncFlowControls (width controlWidth), state .notConfigured → "Set up sync". */}
        <div style={{display: 'flex', alignItems: 'flex-start', gap: SettingsLayout.columnSpacing}}>
          <SyncDetails s={s.sync ?? SYNC_NOT_CONFIGURED} />
          <div style={{width: CONTROL_W, flex: 'none'}}>
            <ActionButton title={(s.sync ?? SYNC_NOT_CONFIGURED).action} systemImage={(s.sync ?? SYNC_NOT_CONFIGURED).actionSymbol} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Permissions">
        <PermissionRow name="Microphone" granted={p.microphone} />
        <Divider />
        <PermissionRow name="Accessibility" granted={p.accessibility} />
        <Divider />
        <PermissionRow name="Input Monitoring" granted={p.inputMonitoring} />
        <Divider />
        <PermissionRow name="Screen Recording" granted={p.screenRecording} />
        <Divider />
        {p.systemAudio !== undefined ? (
          <>
            <PermissionRow name="System Audio" granted={p.systemAudio} />
            <Divider />
          </>
        ) : null}
        <PermissionRow name="Calendars" granted={p.calendars} />
        <Divider />
        <SettingsRow label="" description="Already enabled access in System Settings? Restart muesli to apply permission changes.">
          <CompactActionButton title="Restart muesli…" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Local storage">
        <LocalStorageUsage s={s.storage} />
      </SettingsSection>

      <SettingsSection title="Data">
        <div style={{display: 'flex', gap: spacing[12]}}>
          <CompactActionButton title="Clear dictation history" destructive />
          <CompactActionButton title="Clear meeting history" destructive />
        </div>
      </SettingsSection>
    </>
  );
};

const SyncDetails: React.FC<{s: SyncState}> = ({s}) => {
  const {colors} = useMuesliTheme();
  const d = s.linkedDevice;
  return (
    <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: spacing[4]}}>
      <span style={{...type.body, color: colors.textPrimary}}>Sync with iPhone or iPad</span>
      <SettingsNote>{s.status}</SettingsNote>
      {d ? (
        // ICloudLinkedDeviceRow
        <div
          style={{
            marginTop: spacing[4],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[8],
            padding: `6px ${spacing[8]}px`,
            background: withAlpha(colors.success, 0.08),
            borderRadius: radius.small,
            boxShadow: `inset 0 0 0 1px ${withAlpha(colors.success, 0.18)}`,
          }}
        >
          <span style={{width: 30, height: 30, borderRadius: 15, background: colors.accentSubtle, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
            <Symbol name={d.platform === 'iPad' ? 'ipad' : 'iphone.gen3'} size={16} weight="medium" color={colors.accentText} />
          </span>
          <span style={{display: 'flex', flexDirection: 'column', gap: 1}}>
            <span style={{...type.captionMedium, color: colors.textPrimary, whiteSpace: 'nowrap'}}>{d.name}</span>
            <span style={{...type.metadata, color: colors.textSecondary}}>{d.platform} · Linked</span>
          </span>
          <Symbol name="checkmark.circle.fill" size={14} weight="semibold" color={colors.success} />
        </div>
      ) : null}
    </div>
  );
};

// ---------------- Appearance ----------------

const APPEARANCE_CHOICES: Array<{id: AppAppearanceMode; label: string; symbol: string}> = [
  {id: 'light', label: 'Light', symbol: 'sun.max'},
  {id: 'system', label: 'System', symbol: 'desktopcomputer'},
  {id: 'dark', label: 'Dark', symbol: 'moon'},
  {id: 'ultra_dark', label: 'Ultra Dark', symbol: 'moon.fill'},
];

/** MuesliSettingControl id "appearance" (non-compact): 2-column grid, .tinted / .quiet rounded(4), selection outline. */
const AppearanceGrid: React.FC<{current: AppAppearanceMode}> = ({current}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{width: '100%', padding: 2, boxSizing: 'border-box', background: colors.backgroundRaised, borderRadius: radius.small, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4}}>
      {APPEARANCE_CHOICES.map((c) => {
        const on = c.id === current;
        const fg = on ? colors.accentText : colors.textSecondary;
        return (
          <Button key={c.id} kind={on ? 'tinted' : 'quiet'} shape={{kind: 'rounded', radius: 4}} style={{minHeight: 28, padding: '0 10px', gap: 6, boxShadow: on ? `inset 0 0 0 1px ${colors.textSecondary}` : undefined, color: fg}}>
            <Symbol name={c.symbol} size={12} weight="medium" color={fg} />
            <span style={{...font(12, 'medium'), color: fg}}>{c.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export const MENU_BAR_ICON_OPTIONS: Array<{id: string; label: string}> = [
  {id: 'muesli', label: 'muesli Logo'},
  {id: 'mic.fill', label: 'Microphone'},
  {id: 'waveform', label: 'Waveform'},
  {id: 'bubble.left.fill', label: 'Bubble'},
  {id: 'text.bubble', label: 'Speech Bubble'},
  {id: 'pencil.line', label: 'Pencil'},
  {id: 'brain.head.profile', label: 'Brain'},
  {id: 'sparkles', label: 'Sparkles'},
  {id: 'headphones', label: 'Headphones'},
  {id: 'person.wave.2', label: 'Meeting'},
  {id: 'character.bubble', label: 'Character'},
  {id: 'doc.text', label: 'Document'},
];

/** menuBarIconPicker: horizontal ScrollView of 26×26 buttons (spacing 4), clipped to the control column. */
const MenuBarIconPicker: React.FC<{current: string}> = ({current}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{width: '100%', overflow: 'hidden'}}>
      <div style={{display: 'flex', gap: 4}}>
        {MENU_BAR_ICON_OPTIONS.map((o) => {
          const on = o.id === current;
          const fg = on ? colors.accentText : colors.textSecondary;
          return (
            <Button
              key={o.id}
              kind={on ? 'tinted' : 'quiet'}
              shape={{kind: 'rounded', radius: 5}}
              style={{width: 26, height: 26, flex: 'none', boxShadow: `inset 0 0 0 1px ${on ? withAlpha(colors.accentText, 0.6) : colors.surfaceBorder}`}}
            >
              {o.id === 'muesli' ? <MuesliMark color={fg} box={14} /> : <Symbol name={o.id} size={12} weight="regular" color={fg} />}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export const ACCENT_PRESETS: Array<{hex: string; name: string}> = [
  {hex: '2563eb', name: 'Blue'},
  {hex: 'ef4444', name: 'Red'},
  {hex: 'f59e0b', name: 'Amber'},
  {hex: '10b981', name: 'Green'},
  {hex: '8b5cf6', name: 'Purple'},
  {hex: 'ec4899', name: 'Pink'},
  {hex: '1e1e2e', name: 'Default'},
];

/** glassTintPicker: 22pt swatches (spacing 6) previewing MuesliAccentPalette.palette(forHex:). */
const AccentSwatches: React.FC<{current: string}> = ({current}) => {
  const {colors, isDark} = useMuesliTheme();
  return (
    <div style={{display: 'flex', gap: 6}}>
      {ACCENT_PRESETS.map((p) => {
        // palette(forHex: "1e1e2e") is the adaptive default accent. VERIFY: MuesliAccentPalette.palette(forHex:) mapping.
        const fillHex = p.hex === '1e1e2e' ? (isDark ? '#6BA3F7' : '#2563EB') : '#' + p.hex;
        const pal = accentPalette(fillHex, isDark);
        const on = current.toLowerCase() === p.hex;
        return (
          <div
            key={p.hex}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: pal.fill,
              boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}${on ? `, inset 0 0 0 2px ${withAlpha(pal.onFill, 0.9)}` : ''}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {on ? <Symbol name="checkmark" size={10} weight="bold" color={pal.onFill} /> : null}
          </div>
        );
      })}
    </div>
  );
};

const AppearancePane: React.FC<{s: AppearanceSettingsState; contentWidth: number}> = ({s, contentWidth}) => (
  <>
    <SettingsSection title="Recording indicator">
      <div style={{paddingBottom: spacing[8]}}>
        <RecordingIndicatorStylePicker selection={s.indicatorStyle} recordingColorHex={s.accentHex} contentWidth={contentWidth - 2 * spacing[16]} />
      </div>
      {s.indicatorStyle === 'notch' ? (
        <SettingsNote>Shows during recording and processing. Click the logo or status to open muesli. On external displays, it appears at the top center.</SettingsNote>
      ) : (
        <>
          <SettingsRow label="Keep visible when idle" description="When off, appears only during recording and processing." controlWidth={null}>
            <MacSwitch on={s.showFloatingIndicator} />
          </SettingsRow>
          <Divider />
          <SettingsRow label="Position">
            <MacPopUp value={s.indicatorPosition} />
          </SettingsRow>
          <Divider />
          <SettingsRow label="Show keyboard shortcut on hover" controlWidth={null}>
            <MacSwitch on={s.showHotkeyOnHover} disabled={!s.showFloatingIndicator} />
          </SettingsRow>
        </>
      )}
    </SettingsSection>

    <SettingsSection title="Appearance">
      <SettingsRow label="Theme">
        <AppearanceGrid current={s.theme} />
      </SettingsRow>
      <Divider />
      <SettingsRow label="Menu bar icon">
        <MenuBarIconPicker current={s.menuBarIcon} />
      </SettingsRow>
      <Divider />
      <SettingsRow label="Show hotkey in menu bar" controlWidth={null}>
        <MacSwitch on={s.showHotkeyInMenuBar} />
      </SettingsRow>
      <Divider />
      <SettingsRow label="Accent color" description={s.theme === 'ultra_dark' ? 'Used for toggles in Ultra Dark.' : undefined}>
        <AccentSwatches current={s.accentHex} />
      </SettingsRow>
      <Divider />
      <SettingsRow label="Play sound effects" controlWidth={null}>
        <MacSwitch on={s.soundEnabled} />
      </SettingsRow>
      <Divider />
      <SettingsRow label="Show next meeting in menu bar" controlWidth={null}>
        <MacSwitch on={s.showNextMeeting} />
      </SettingsRow>
    </SettingsSection>
  </>
);

// ---------------- Experimental ----------------

/** OpenAILogoShape (OnboardingView.swift), 24-unit path. */
export const OPENAI_LOGO_PATH =
  'M22.2819 9.8211C22.8248 8.1862 22.6369 6.3967 21.7662 4.9103C20.4571 2.6316 17.8260 1.4595 15.2564 2.0103C12.1364 -1.4602 6.4298 -0.2543 4.9807 4.1818C3.2928 4.5279 1.8360 5.5847 0.9830 7.0818C-0.3404 9.3568 -0.0401 12.2267 1.7257 14.1784C1.1808 15.8125 1.3670 17.6022 2.2367 19.0891C3.5475 21.3686 6.1803 22.5406 8.7513 21.9892C9.8948 23.2770 11.5377 24.0097 13.2599 24.0000C15.8937 24.0024 18.2271 22.3021 19.0317 19.7942C20.7194 19.4475 22.1760 18.3908 23.0294 16.8941C24.3368 14.6231 24.0351 11.7688 22.2819 9.8212ZM13.2599 22.4292C12.2086 22.4309 11.1903 22.0624 10.3835 21.3884L10.5254 21.3080L15.3037 18.5498C15.5456 18.4079 15.6949 18.1490 15.6964 17.8685L15.6964 11.1316L17.7164 12.3002C17.7367 12.3105 17.7508 12.3298 17.7544 12.3522L17.7544 17.9348C17.7491 20.4148 15.7399 22.4240 13.2599 22.4292ZM3.5992 18.3038C3.0720 17.3934 2.8827 16.3263 3.0646 15.2901L3.2066 15.3753L7.9896 18.1335C8.2306 18.2749 8.5292 18.2749 8.7702 18.1335L14.6130 14.7650L14.6130 17.0974C14.6119 17.1219 14.5997 17.1445 14.5798 17.1589L9.7400 19.9502C7.5893 21.1891 4.8416 20.4525 3.5992 18.3038ZM2.3408 7.8956C2.8717 6.9794 3.7096 6.2805 4.7063 5.9228L4.7063 11.6000C4.7026 11.8793 4.8513 12.1386 5.0942 12.2765L10.9086 15.6308L8.8885 16.7993C8.8663 16.8111 8.8397 16.8111 8.8175 16.7993L3.9872 14.0128C1.8408 12.7686 1.1047 10.0230 2.3408 7.8720ZM18.9371 11.7514L13.1038 8.3640L15.1192 7.2000C15.1414 7.1882 15.1680 7.1882 15.1902 7.2000L20.0205 9.9913C23.3136 11.8915 22.9065 16.7676 19.3440 18.0955L19.3440 12.4183C19.3355 12.1397 19.1808 11.8863 18.9370 11.7513Z';

const CotypistKeyHint: React.FC<{keys: string[]; action: string}> = ({keys, action}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
      <div style={{display: 'flex', gap: 3}}>
        {keys.map((k) => (
          <span
            key={k}
            style={{
              ...type.metadata,
              color: colors.textPrimary,
              padding: '0 6px',
              minWidth: 20,
              minHeight: 20,
              boxSizing: 'border-box',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: colors.surfacePrimary,
              borderRadius: 5,
              boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
            }}
          >
            {k}
          </span>
        ))}
      </div>
      <span style={{...type.caption, color: colors.textSecondary}}>{action}</span>
    </div>
  );
};

const AppIconOrDashed: React.FC<{icon?: string; size: number}> = ({icon, size}) => {
  const {colors} = useMuesliTheme();
  return icon ? <img src={icon} width={size} height={size} style={{flex: 'none'}} /> : <Symbol name="app.dashed" size={size * 0.85} weight="regular" color={colors.textTertiary} />;
};

const CotypistQuietApps: React.FC<{quiet: CotypistSettingsState['quietApps']; recommended: CotypistSettingsState['recommendedApps']}> = ({quiet, recommended}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: spacing[12], paddingBottom: spacing[4], paddingTop: spacing[4]}}>
      <SettingsRow label="Quiet in these apps" description="Cotypist won't suggest anything in apps you add here." controlWidth={null}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            ...font(12, 'medium'),
            color: colors.textPrimary,
            padding: '0 10px',
            height: 26,
            background: colors.surfacePrimary,
            borderRadius: radius.small,
            boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
          }}
        >
          <Symbol name="plus" size={11} weight="semibold" color={colors.textPrimary} />
          Add app
        </div>
      </SettingsRow>
      {quiet.length === 0 ? (
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: spacing[12], padding: spacing[12], background: withAlpha(colors.surfacePrimary, 0.4), borderRadius: radius.small}}>
          <Symbol name="checkmark.circle.fill" size={18} weight="regular" color={colors.accent} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 2, flex: 1}}>
            <span style={{...font(13, 'medium'), color: colors.textPrimary}}>On in every app</span>
            <SettingsNote>Add password managers, or apps with their own autocomplete like code editors.</SettingsNote>
          </div>
          <svg style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}} width="100%" height="100%">
            <rect x={0.5} y={0.5} width="calc(100% - 1px)" height="calc(100% - 1px)" style={{width: 'calc(100% - 1px)', height: 'calc(100% - 1px)'}} rx={radius.small} fill="none" stroke={colors.surfaceBorder} strokeDasharray="4 3" />
          </svg>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: spacing[8]}}>
          {quiet.map((a) => (
            <div key={a.name} style={{display: 'flex', alignItems: 'center', gap: spacing[8], height: 36, padding: '0 8px 0 10px', background: colors.surfacePrimary, borderRadius: radius.small, boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`}}>
              <AppIconOrDashed icon={a.icon} size={20} />
              <span style={{...type.callout, color: colors.textPrimary, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{a.name}</span>
              <span style={{width: 18, height: 18, borderRadius: 9, background: scaleAlpha(colors.surfaceBorder, 0.6), display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                <Symbol name="xmark" size={9} weight="bold" color={colors.textTertiary} />
              </span>
            </div>
          ))}
        </div>
      )}
      {recommended.length ? (
        <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
          <span style={{...type.caption, color: colors.textSecondary}}>Suggested</span>
          {recommended.map((a) => (
            <div key={a.name} style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 5, ...font(12, 'medium'), color: colors.textSecondary, padding: '0 8px', height: 24}}>
              <AppIconOrDashed icon={a.icon} size={14} />
              <span style={{whiteSpace: 'nowrap'}}>{a.name}</span>
              <Symbol name="plus" size={9} weight="bold" color={colors.textSecondary} />
              <svg style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}} width="100%" height="100%">
                <rect x={0.5} y={0.5} style={{width: 'calc(100% - 1px)', height: 'calc(100% - 1px)'}} rx={radius.small} fill="none" stroke={colors.surfaceBorder} strokeDasharray="3 2" />
              </svg>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const FREQUENCY_LABELS = ['Fewer, more accurate', 'Balanced', 'More often'];

/** cotypistSettingsSection (SettingsView.swift). */
export const CotypistSettingsSection: React.FC<{c: CotypistSettingsState}> = ({c}) => {
  const {colors} = useMuesliTheme();
  const status =
    c.state === 'on'
      ? 'Suggests the next words as you type, in any app.'
      : c.state === 'addingInputSource'
        ? c.suggestsRelogin
          ? "Muesli Cotypist isn't listed yet. Log out and back in, then turn this on again."
          : "Add Muesli Cotypist in Keyboard settings. It turns on as soon as it's added."
        : 'Local typeahead in every app, running on this Mac.';
  const ms = c.modelState;
  return (
    <SettingsSection title="Cotypist" newBadge={c.showNewBadge}>
      <SettingsRow label="Typeahead suggestions" description={status} controlWidth={null}>
        <MacSwitch on={c.state === 'on'} />
      </SettingsRow>
      {c.state === 'addingInputSource' ? (
        <div style={{paddingBottom: spacing[12]}}>
          <CompactActionButton title="Show setup guide" systemImage="keyboard" />
        </div>
      ) : null}
      {ms.kind !== 'ready' ? (
        <div style={{marginBottom: spacing[12], display: 'flex', alignItems: 'center', gap: spacing[12], padding: spacing[12], background: withAlpha(colors.surfacePrimary, 0.4), borderRadius: radius.small}}>
          <Symbol name="cpu" size={14} weight="regular" color={colors.accent} />
          <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4}}>
            <span style={{...font(13, 'medium'), color: colors.textPrimary}}>Typeahead model: {c.modelLabel}</span>
            {ms.kind === 'downloading' ? (
              <>
                <MacProgressBar value={ms.fraction} />
                <SettingsNote>
                  Downloading… {Math.floor(ms.fraction * 100)}% of {c.modelSizeLabel}
                </SettingsNote>
              </>
            ) : ms.kind === 'failed' ? (
              <SettingsNote tone="error">Download failed: {ms.message}</SettingsNote>
            ) : ms.kind === 'unavailable' ? (
              <SettingsNote>Coming soon. Choose another model in Models.</SettingsNote>
            ) : (
              <SettingsNote>{c.modelSizeLabel}. Runs on this Mac; downloaded when you turn Cotypist on.</SettingsNote>
            )}
          </div>
          {ms.kind === 'missing' || ms.kind === 'failed' ? <CompactActionButton title="Download" systemImage="arrow.down.circle" /> : <CompactActionButton title="Models" systemImage="square.stack.3d.up" />}
        </div>
      ) : null}
      {c.state === 'on' ? (
        <>
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[16], paddingBottom: spacing[12]}}>
            <CotypistKeyHint keys={['Tab']} action="Accept" />
            <CotypistKeyHint keys={['⌥', '→']} action="Accept one word" />
            <span style={{...type.caption, color: colors.textSecondary}}>Keep typing to ignore</span>
          </div>
          <Divider />
          <SettingsRow label="Model" controlWidth={null}>
            <div style={{display: 'flex', alignItems: 'center', gap: spacing[8]}}>
              <span style={{...type.callout, color: colors.textSecondary}}>{c.modelLabel}</span>
              <CompactActionButton title="Change" systemImage="square.stack.3d.up" />
            </div>
          </SettingsRow>
          <Divider />
          <SettingsRow label="Suggestion length">
            <MacPopUp value={c.length} />
          </SettingsRow>
          <Divider />
          <SettingsRow label="How often to suggest" description="Fewer shows only suggestions the model is sure of.">
            <div style={{display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 24}}>
              <MacSlider steps={3} index={c.frequencyIndex} />
              <span style={{...type.caption, color: colors.textSecondary, width: 80, textAlign: 'right', flex: 'none', whiteSpace: 'nowrap'}}>{FREQUENCY_LABELS[c.frequencyIndex]}</span>
            </div>
          </SettingsRow>
          <Divider />
          <SettingsRow
            label="Finish half-typed words"
            description={c.completeWords ? 'Pause inside a word to see the rest of it.' : 'Off: suggestions appear only after a space or punctuation.'}
            controlWidth={null}
          >
            <MacSwitch on={c.completeWords} />
          </SettingsRow>
          {c.completeWords ? (
            <SettingsRow label="Pause before completing" style={{paddingLeft: spacing[16], paddingBottom: spacing[4] + spacing[4]}}>
              <MacPopUp value={c.wordPause} />
            </SettingsRow>
          ) : null}
          <Divider />
          <SettingsRow label="Use on-screen text" description="Reads the window around the text field. Off while a meeting records." controlWidth={null}>
            <MacSwitch on={c.useScreenContext} />
          </SettingsRow>
          <Divider />
          <CotypistQuietApps quiet={c.quietApps} recommended={c.recommendedApps} />
        </>
      ) : null}
    </SettingsSection>
  );
};

const ExperimentalPane: React.FC<{s: ExperimentalSettingsState}> = ({s}) => {
  const {colors} = useMuesliTheme();
  return (
    <>
      <SettingsSection title="Vidshot" icon="vidshot">
        <SettingsRow label="Enable Vidshot" description="Record a window or screen region with microphone narration. Captures stay on this Mac.">
          <MacSwitch on={s.vidshotEnabled} />
        </SettingsRow>
        <SettingsRow label="Draw modifier">
          <MacPopUp value={s.drawModifier} />
        </SettingsRow>
        <div style={{alignSelf: 'flex-start'}}>
          <CompactActionButton title="Start Vidshot" state={s.vidshotEnabled ? 'rest' : 'disabled'} />
        </div>
      </SettingsSection>

      {/* TimeTurnerSettingsView.swift */}
      <SettingsSection title="Time Turner" icon="timeTurner">
        <SettingsRow label="Screen history" description="Searchable snapshots stored on this Mac." controlWidth={null}>
          {s.timeTurnerEnabled ? <MacSwitch on /> : <MacPushButton labelStyle={type.body}>Set up…</MacPushButton>}
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Computer Use">
        <SettingsRow label="Enable planner" controlWidth={null}>
          <MacSwitch on={s.plannerEnabled} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Planner backend">
          <MacPopUp value={s.plannerBackend} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Account">
          {s.chatGPTSignedIn ? (
            <div style={{display: 'flex', alignItems: 'center', width: '100%', minHeight: 28}}>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, ...type.captionMedium, color: colors.successText, flex: 1}}>
                <Symbol name="checkmark.circle.fill" size={12} weight="medium" color={colors.successText} />
                Signed in
              </span>
              <span style={{...type.captionMedium, color: colors.accentText}}>Sign Out</span>
            </div>
          ) : (
            <Button kind="primary" style={{width: '100%', height: 26, padding: '0 10px', gap: 5}}>
              <svg width={10} height={10} viewBox="0 0 24 24" aria-hidden>
                <path d={OPENAI_LOGO_PATH} fill={colors.onAccent} fillRule="evenodd" />
              </svg>
              <span style={{...type.captionMedium, whiteSpace: 'nowrap'}}>Sign in with ChatGPT</span>
            </Button>
          )}
        </SettingsRow>
        <Divider />
        <SettingsRow label="Planner model">
          <MacPopUp value={s.plannerModel} />
        </SettingsRow>
        {s.thinkingChoices.length ? (
          <>
            <Divider />
            <SettingsRow label="Thinking">
              <div style={{display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 24}}>
                <MacSlider steps={s.thinkingChoices.length} index={s.thinkingIndex} />
                <span style={{...type.caption, color: colors.textSecondary, width: 80, textAlign: 'right', flex: 'none'}}>{s.thinkingChoices[s.thinkingIndex]}</span>
              </div>
            </SettingsRow>
          </>
        ) : null}
        <Divider />
        <SettingsRow label="Execution timeout" description="Limits desktop observation and actions. Model thinking and time spent answering questions are excluded.">
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], justifyContent: 'flex-end', width: '100%'}}>
            <MacNumberField value={String(s.timeoutSeconds)} />
            <span style={{...type.callout, color: colors.textSecondary, width: 58}}>{s.timeoutSeconds === 1 ? 'second' : 'seconds'}</span>
            <MacStepper />
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Quill" icon="quill">
        <SettingsRow label="Rewrite selected text" description="Highlight text to transform it. With no selection, Quill generates and pastes at the cursor." controlWidth={null}>
          <MacSwitch on={s.quillEnabled} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Play Quill sounds" controlWidth={null}>
          <MacSwitch on={s.quillSounds} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Writing model source" description="Shared by Quill and Computer Use writing tasks.">
          <MacPopUp value={s.quillSource} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Writing model">{s.quillLocalModel ? <MacPopUp value={s.quillLocalModel} /> : <CompactActionButton title="View local models" systemImage="arrow.right" />}</SettingsRow>
      </SettingsSection>

      {s.cotypistAvailable ? <CotypistSettingsSection c={s.cotypist} /> : null}
    </>
  );
};

// ---------------- Page ----------------

/** The Settings detail page: ScrollView { VStack(spacing 24) { title1 "Settings"; segmented pane picker; pane } }, padding h32, top pageTop, bottom 32. */
export const SettingsPage: React.FC<SettingsPageProps> = ({pane, scrollY = 0, width = layout.windowWidth - layout.sidebarWidth - 1, general, appearance, experimental, dictation, meetings}) => {
  const {colors} = useMuesliTheme();
  const contentWidth = width - 2 * spacing[32];
  const paneIndex = SETTINGS_PANES.findIndex((p) => p.id === pane);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: colors.backgroundBase}}>
      <div
        style={{
          transform: `translateY(${-scrollY}px)`,
          padding: `${layout.pageTop}px ${spacing[32]}px ${spacing[32]}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[24],
        }}
      >
        <div style={{...type.title1, color: colors.textPrimary}}>Settings</div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <MacSegmented options={SETTINGS_PANES.map((p) => p.title)} selected={paneIndex} />
        </div>
        {pane === 'general' && general ? <GeneralPane s={general} /> : null}
        {pane === 'dictation' && dictation ? <DictationsPane s={dictation} /> : null}
        {pane === 'meetings' && meetings ? <MeetingsPane s={meetings} /> : null}
        {pane === 'appearance' && appearance ? <AppearancePane s={appearance} contentWidth={contentWidth} /> : null}
        {pane === 'experimental' && experimental ? <ExperimentalPane s={experimental} /> : null}
      </div>
    </div>
  );
};

