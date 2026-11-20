// SettingsView.swift @ v0.8.6: the Dictations pane (dictationSettingsPane: Speech Recognition, Transcription, Dictation
// Cleanup, App Formatting, Advanced) and the Meetings pane (meetingsSettingsPane: Transcription, Meeting Context,
// Meeting Summaries, Meeting Notes, Recording, Auto Export, Meeting Notifications, Calendars, Advanced).
// App Formatting: DictationFormattingSettingsView.swift. Labels/choices: MuesliSettingsDefinitions.swift, Models.swift,
// DictationProvider.swift, ScheduledMeetingNotificationLeadTime.swift, MeetingJoinDefaultAction.swift,
// TranscriptCleanupPrompts (MuesliCore), DictationFormattingTemplate.
// Defaults below are AppConfig's defaults (Parakeet Unified, cleanup off, ChatGPT summaries, template Auto, …).
// VERIFY against captures: paste-shortcut control, thinking slider, calendar source list, disclosure chevrons.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type, font} from '../../typography';
import {spacing, radius} from '../../tokens/theme';
import {Symbol} from '../../icons/Icon';
import {MacSwitch, MacPopUp, MacSlider, MacNumberField, MacStepper, SettingsDivider} from './controls';
import {SettingsSection, SettingsRow, CompactActionButton, ActionButton, AccentActionButton} from './SettingsLayout';

const Divider = () => <SettingsDivider />;

// ---------------- Dictations ----------------

export type DictationProviderLabel = 'Local' | 'OpenAI' | 'OpenRouter';

export interface AppFormattingRule {
  appName: string;
  /** App icon image (TargetApplicationIconView, 28pt); omitted → `app.dashed` placeholder. */
  icon?: string;
  /** DictationFormattingTemplate name: "Original" | "Casual" | "Lowercase chat" | a saved one | "Custom". */
  template: string;
}
export interface AppFormattingSuggestion {
  appName: string;
  icon?: string;
  sessions: number;
  suggestsLowercaseChat?: boolean;
}

export interface DictationSettingsState {
  provider: DictationProviderLabel;
  /** BackendOption label, e.g. "Parakeet Unified". Hosted providers label this row "Fallback model". */
  model: string;
  /** Shown when the local model supports buffered live transcription. */
  liveHandsFreeText?: boolean;
  /** "Automatic" or a device name. */
  microphone: string;
  dictionarySuggestions: boolean;
  cleanup: {
    enabled: boolean;
    /** cleanup_preset name ("Default Cleanup") and its prompt (first lines shown, 4-line clamp). */
    preset?: string;
    prompt?: string;
    /** cleanup_source label: "Local Model", or a hosted backend. */
    source?: string;
    /** On-device cleanup model label (source on-device); omitted → "View cleanup models" button. */
    model?: string;
  };
  formatting: {rules: AppFormattingRule[]; suggestions: AppFormattingSuggestion[]};
  advanced: {pasteShortcut: string; pauseMedia: boolean; muteAudio: boolean; appContext: boolean; accessibilityGranted: boolean; screenOCR: boolean; screenRecordingGranted: boolean};
}

/** PostProcessorOption.defaultSystemPrompt (first paragraph). */
export const DEFAULT_CLEANUP_PROMPT =
  'Clean up speech-to-text transcription. Only make changes when there is a clear error. If the text is already correct, output it exactly as-is.\n\nThe user input may include an <APP-CONTEXT> section with focused app, document, URL, selected text, or OCR screen text. Use it only to resolve obvious transcription errors, names, acronyms, and formatting intent. Never copy app context into the output unless the user dictated it.';

export const DEFAULT_DICTATION_SETTINGS: DictationSettingsState = {
  provider: 'Local',
  model: 'Parakeet Unified',
  liveHandsFreeText: false,
  microphone: 'Automatic',
  dictionarySuggestions: false,
  cleanup: {enabled: false},
  formatting: {rules: [], suggestions: []},
  advanced: {pasteShortcut: '⌘V', pauseMedia: false, muteAudio: false, appContext: false, accessibilityGranted: true, screenOCR: false, screenRecordingGranted: true},
};

const AppIcon28: React.FC<{icon?: string}> = ({icon}) => {
  const {colors} = useMuesliTheme();
  return icon ? (
    <img src={icon} style={{width: 28, height: 28, flex: 'none'}} />
  ) : (
    <span style={{width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
      <Symbol name="app.dashed" size={22} weight="regular" color={colors.textSecondary} />
    </span>
  );
};

/** DisclosureGroup label row with its chevron (collapsed). VERIFY chevron size/colour. */
const Disclosure: React.FC<{children: React.ReactNode; open?: boolean}> = ({children, open = false}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
      <span style={{width: 12, display: 'inline-flex', justifyContent: 'center', transform: open ? 'rotate(90deg)' : undefined}}>
        <Symbol name="chevron.right" size={10} weight="semibold" color={colors.textSecondary} />
      </span>
      <div style={{flex: 1, minWidth: 0}}>{children}</div>
    </div>
  );
};

/** DictationFormattingSettingsView (collapsed rules). */
const AppFormatting: React.FC<{f: DictationSettingsState['formatting']}> = ({f}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{...type.callout, color: colors.textSecondary}}>Set a writing style for each app.</div>
      {f.rules.map((r) => (
        <React.Fragment key={r.appName}>
          <Disclosure>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <AppIcon28 icon={r.icon} />
              <span style={{...type.body, color: colors.textPrimary}}>{r.appName}</span>
              <span style={{flex: 1}} />
              <span style={{...type.callout, color: colors.textSecondary}}>{r.template}</span>
            </div>
          </Disclosure>
          <Divider />
        </React.Fragment>
      ))}
      {f.suggestions.length ? (
        <>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <span style={{...type.callout, color: colors.textSecondary}}>Most-used apps</span>
            <span style={{...type.caption, color: colors.textSecondary}}>Based on your last 30 days of dictation.</span>
          </div>
          {f.suggestions.map((s) => (
            <div key={s.appName} style={{display: 'flex', alignItems: 'flex-start', gap: 8}}>
              <AppIcon28 icon={s.icon} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0}}>
                <span style={{...type.body, color: colors.textPrimary}}>{s.appName}</span>
                <span style={{...type.caption, color: colors.textSecondary}}>
                  {s.sessions} dictations{s.suggestsLowercaseChat ? ' · Try lowercase chat' : ''}
                </span>
              </div>
              <CompactActionButton title="Customize" />
              <span style={{width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                <Symbol name="xmark" size={11} weight="medium" color={colors.textSecondary} />
              </span>
            </div>
          ))}
        </>
      ) : f.rules.length === 0 ? (
        <div style={{...type.callout, color: colors.textSecondary}}>Choose an app to customize its formatting.</div>
      ) : null}
      <div>
        <CompactActionButton title="Add App…" />
      </div>
      <div style={{...type.caption, color: colors.textSecondary}}>
        Formatting changes capitalization and punctuation, not wording or tone. Browser rules apply to every website.
      </div>
    </div>
  );
};

const screenContextDescription = (accessibilityGranted: boolean, includesScreenOCR: boolean, screenRecordingGranted: boolean) => {
  if (!accessibilityGranted) return 'Grant Accessibility, then toggle again if needed.';
  if (includesScreenOCR && !screenRecordingGranted) return 'Adds nearby app text for post-processing. Screen Recording enables OCR context.';
  if (includesScreenOCR) return 'Adds nearby app text and OCR context.';
  return 'Adds nearby app text for post-processing.';
};

export const DictationsPane: React.FC<{s: DictationSettingsState}> = ({s}) => {
  const {colors} = useMuesliTheme();
  const hosted = s.provider !== 'Local';
  const a = s.advanced;
  const ocrDescription = !a.appContext
    ? 'Turn on App context first.'
    : !a.screenRecordingGranted
      ? 'Grant Screen Recording to add frontmost-window OCR text.'
      : 'Adds frontmost-window OCR text. Cloud cleanup may send this text to the selected provider.';
  return (
    <>
      <SettingsSection title="Speech Recognition">
        <SettingsRow label="Provider">
          <MacPopUp value={s.provider} />
        </SettingsRow>
        <Divider />
        <SettingsRow label={hosted ? 'Fallback model' : 'Dictation model'} description={hosted ? `Used automatically if ${s.provider} transcription fails.` : undefined}>
          <MacPopUp value={s.model} />
        </SettingsRow>
        {!hosted && s.liveHandsFreeText !== undefined ? (
          <>
            <Divider />
            <SettingsRow label="Watch text appear during hands-free mode" description="Preview as you speak; apply enabled cleanup when you stop." controlWidth={null} newBadge>
              <MacSwitch on={s.liveHandsFreeText} />
            </SettingsRow>
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Transcription">
        <SettingsRow label="Microphone" description="Automatic uses system input, or Mac mic with AirPods.">
          <MacPopUp value={s.microphone} />
        </SettingsRow>
        <Divider />
        <SettingsRow
          label="Dictionary suggestions"
          description="Suggests words from your corrections. Briefly reads focused app text via Accessibility after dictation."
          controlWidth={null}
        >
          <MacSwitch on={s.dictionarySuggestions} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Dictation Cleanup">
        <SettingsRow label="AI transcript cleanup" controlWidth={null}>
          <MacSwitch on={s.cleanup.enabled} />
        </SettingsRow>
        {s.cleanup.enabled ? (
          <>
            <Divider />
            <div style={{display: 'flex', flexDirection: 'column', gap: spacing[12]}}>
              <SettingsRow label="Cleanup preset">
                <MacPopUp value={s.cleanup.preset ?? 'Default Cleanup'} />
              </SettingsRow>
              <div
                style={{
                  font: '12px ui-monospace, SFMono-Regular, Menlo, monospace',
                  lineHeight: '16px',
                  color: colors.textSecondary,
                  padding: 10,
                  borderRadius: radius.small,
                  background: colors.surfacePrimary,
                  opacity: 1,
                  boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {s.cleanup.prompt ?? DEFAULT_CLEANUP_PROMPT}
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <CompactActionButton title="Manage Presets…" systemImage="slider.horizontal.3" />
              </div>
            </div>
            <Divider />
            <SettingsRow label="Cleanup source">
              <MacPopUp value={s.cleanup.source ?? 'Local Model'} />
            </SettingsRow>
            <Divider />
            <SettingsRow label="Cleanup model">
              {s.cleanup.model ? <MacPopUp value={s.cleanup.model} /> : <CompactActionButton title="View cleanup models" systemImage="arrow.right" />}
            </SettingsRow>
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="App Formatting" newBadge>
        <AppFormatting f={s.formatting} />
      </SettingsSection>

      <SettingsSection title="Advanced">
        <SettingsRow label="Paste shortcut" description="Uses your keyboard layout. Re-record a custom shortcut after changing layouts.">
          <MacPopUp value={a.pasteShortcut} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Pause media during dictation" controlWidth={null}>
          <MacSwitch on={a.pauseMedia} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Mute system audio during dictation" controlWidth={null}>
          <MacSwitch on={a.muteAudio} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="App context" description={screenContextDescription(a.accessibilityGranted, false, a.screenRecordingGranted)} controlWidth={null}>
          <MacSwitch on={a.appContext} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Screen OCR context" description={ocrDescription} controlWidth={null}>
          <MacSwitch on={a.screenOCR} disabled={!a.appContext} />
        </SettingsRow>
      </SettingsSection>
    </>
  );
};

// ---------------- Meetings ----------------

export interface CalendarSourceGroup {
  /** Account title ("iCloud", "Google"), 12pt semibold. */
  title: string;
  calendars: Array<{name: string; color: string; on: boolean}>;
}

export interface MeetingsSettingsState {
  microphone: string;
  hoverTranscript: boolean;
  /** live_transcript label: "Parakeet Live Captions", "Off", … */
  liveTranscriptModel: string;
  diarizeMicrophone: boolean;
  /** Final transcript: a model label, or `null` → "<live model> (same model)" (only Nemotron 3.5 / Apple Speech live models
   *  produce the final transcript; Parakeet Live Captions is a preview). */
  finalTranscript: string | null;
  meetingContext: boolean;
  accessibilityGranted: boolean;
  screenRecordingGranted: boolean;
  summary: {backend: string; chatGPTSignedIn?: boolean; model?: string; thinkingChoices?: string[]; thinkingIndex?: number};
  notes: {defaultTemplate: string; retries: number};
  recording: {autoRecordCalendar: boolean; stopWhenMeetingEnds: boolean; savePolicy: 'Never' | 'Ask every time' | 'Always'; format?: string};
  autoExport: {enabled: boolean; folder?: string; content?: string; fileFormat?: string};
  notifications: {scheduled: boolean; reminderTiming: string; joinAction: string; autoDetected: boolean};
  calendars: {access: boolean; upcoming: string; linksOnly: boolean; sources: CalendarSourceGroup[]};
  advanced: {hook: boolean; hookPath?: string; timeoutSeconds: number};
}

export const DEFAULT_MEETINGS_SETTINGS: MeetingsSettingsState = {
  microphone: 'Automatic',
  hoverTranscript: true,
  liveTranscriptModel: 'Off',
  diarizeMicrophone: false,
  finalTranscript: 'Parakeet v3',
  meetingContext: false,
  accessibilityGranted: true,
  screenRecordingGranted: true,
  summary: {backend: 'ChatGPT', chatGPTSignedIn: true, model: 'GPT-6.1 Sol (default)', thinkingChoices: ['Low', 'Medium', 'High'], thinkingIndex: 1},
  notes: {defaultTemplate: 'Auto', retries: 3},
  recording: {autoRecordCalendar: false, stopWhenMeetingEnds: false, savePolicy: 'Never'},
  autoExport: {enabled: false},
  notifications: {scheduled: true, reminderTiming: 'At start', joinAction: 'Join & Transcribe', autoDetected: true},
  calendars: {access: true, upcoming: 'Today only', linksOnly: true, sources: []},
  advanced: {hook: false, timeoutSeconds: 30},
};

const GrantedLabel: React.FC<{text: string}> = ({text}) => {
  const {colors} = useMuesliTheme();
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, ...type.captionMedium, color: colors.successText, whiteSpace: 'nowrap'}}>
      <Symbol name="checkmark.circle.fill" size={12} weight="medium" color={colors.successText} />
      {text}
    </span>
  );
};

/** autoExportFolderPicker / meetingHookPathPicker: a bordered field-like button with the path, or the prompt. VERIFY. */
const PathPicker: React.FC<{path?: string; prompt: string}> = ({path, prompt}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{width: '100%', height: 24, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', borderRadius: 6, background: colors.surfacePrimary, boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`}}>
      <Symbol name="folder" size={11} weight="regular" color={colors.textSecondary} />
      <span style={{...type.caption, color: path ? colors.textPrimary : colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', direction: path ? 'rtl' : undefined}}>{path ?? prompt}</span>
    </div>
  );
};

export const MeetingsPane: React.FC<{s: MeetingsSettingsState}> = ({s}) => {
  const {colors} = useMuesliTheme();
  const sum = s.summary;
  return (
    <>
      <SettingsSection title="Transcription">
        <SettingsRow label="Microphone" description="Only affects muesli. Changes apply immediately.">
          <MacPopUp value={s.microphone} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Show transcript on hover" description="Over the recording pill or notch." controlWidth={null}>
          <MacSwitch on={s.hoverTranscript} />
        </SettingsRow>
        <Divider />
        <SettingsRow
          label="Live transcript model"
          description={
            s.liveTranscriptModel === 'Off'
              ? 'Shows completed transcript segments only.'
              : s.finalTranscript === null
                ? 'Creates the live and final transcript.'
                : 'Adds a low-latency preview.'
          }
        >
          <MacPopUp value={s.liveTranscriptModel} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Identify in-room speakers" description="Speaker playback may cause duplicate labels; headphones help." controlWidth={null}>
          <MacSwitch on={s.diarizeMicrophone} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Final transcript">
          {s.finalTranscript ? (
            <MacPopUp value={s.finalTranscript} />
          ) : (
            <span style={{...type.callout, color: colors.textSecondary}}>{s.liveTranscriptModel} (same model)</span>
          )}
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Meeting Context">
        <SettingsRow label="Meeting context" description={screenContextDescription(s.accessibilityGranted, true, s.screenRecordingGranted)} controlWidth={null}>
          <MacSwitch on={s.meetingContext} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Meeting Summaries">
        <SettingsRow label="Summary backend" description="Summaries may send transcripts, notes, screen context, and participant names to the selected backend.">
          <MacPopUp value={sum.backend} />
        </SettingsRow>
        {sum.backend === 'ChatGPT' ? (
          <>
            <Divider />
            <SettingsRow label="Account">
              {sum.chatGPTSignedIn ? (
                <div style={{display: 'flex', alignItems: 'center', width: '100%', minHeight: 28}}>
                  <GrantedLabel text="Signed in" />
                  <span style={{flex: 1}} />
                  <span style={{...type.captionMedium, color: colors.accentText}}>Sign Out</span>
                </div>
              ) : (
                <ActionButton title="Sign in with ChatGPT" />
              )}
            </SettingsRow>
          </>
        ) : null}
        {sum.model ? (
          <>
            <Divider />
            <SettingsRow label="Model">
              <MacPopUp value={sum.model} />
            </SettingsRow>
          </>
        ) : null}
        {sum.thinkingChoices?.length ? (
          <>
            <Divider />
            <SettingsRow label="Thinking">
              <div style={{display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 24}}>
                <MacSlider steps={sum.thinkingChoices.length} index={sum.thinkingIndex ?? 0} />
                <span style={{...type.caption, color: colors.textSecondary, width: 80, textAlign: 'right', flex: 'none'}}>{sum.thinkingChoices[sum.thinkingIndex ?? 0]}</span>
              </div>
            </SettingsRow>
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Meeting Notes">
        <SettingsRow label="Default template">
          <MacPopUp value={s.notes.defaultTemplate} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Summary retries" description="Retries transient AI failures before saving failed notes.">
          <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], justifyContent: 'flex-end', width: '100%'}}>
            <MacNumberField value={String(s.notes.retries)} />
            <span style={{...type.callout, color: colors.textSecondary, width: 58}}>{s.notes.retries === 1 ? 'retry' : 'retries'}</span>
            <MacStepper />
          </div>
        </SettingsRow>
        <Divider />
        <SettingsRow label="Templates">
          <ActionButton title="Manage Templates…" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Recording">
        <SettingsRow label="Auto-record calendar meetings" controlWidth={null}>
          <MacSwitch on={s.recording.autoRecordCalendar} />
        </SettingsRow>
        <Divider />
        <SettingsRow
          label="Stop recording when a meeting ends"
          description="Supports Zoom, Teams, Webex and browser meetings. Checks connectivity with Google when the meeting signal disappears. If the check fails, recording may continue for up to 8 minutes."
          controlWidth={null}
        >
          <MacSwitch on={s.recording.stopWhenMeetingEnds} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Save meeting recording">
          <MacPopUp value={s.recording.savePolicy} />
        </SettingsRow>
        {s.recording.savePolicy !== 'Never' ? (
          <>
            <Divider />
            <SettingsRow label="Recording format" description="M4A is recommended for smaller files. WAV is lossless and uses more storage.">
              <MacPopUp value={s.recording.format ?? 'M4A'} />
            </SettingsRow>
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Auto Export">
        <SettingsRow label="Auto-export meetings" controlWidth={null}>
          <MacSwitch on={s.autoExport.enabled} />
        </SettingsRow>
        {s.autoExport.enabled ? (
          <>
            <Divider />
            <SettingsRow label="Destination folder">
              <PathPicker path={s.autoExport.folder} prompt="Choose a folder…" />
            </SettingsRow>
            <Divider />
            <SettingsRow label="Content">
              <MacPopUp value={s.autoExport.content ?? 'Notes'} />
            </SettingsRow>
            <Divider />
            <SettingsRow label="File format">
              <MacPopUp value={s.autoExport.fileFormat ?? 'Markdown'} />
            </SettingsRow>
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Meeting Notifications">
        <SettingsRow label="Scheduled meetings" description="For calendar events with a join link." controlWidth={null}>
          <MacSwitch on={s.notifications.scheduled} />
        </SettingsRow>
        {s.notifications.scheduled ? (
          <>
            <Divider />
            <SettingsRow label="Reminder timing">
              <MacPopUp value={s.notifications.reminderTiming} />
            </SettingsRow>
          </>
        ) : null}
        <Divider />
        <SettingsRow
          label="Default action"
          description={
            s.notifications.joinAction === 'Transcribe Only'
              ? 'Used in notifications and Coming Up.'
              : 'Used in notifications and Coming Up. Joining in another browser? Choose Transcribe Only.'
          }
        >
          <MacPopUp value={s.notifications.joinAction} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Auto-detected meetings" description="Detects calls from browser, camera, microphone, or app audio activity." controlWidth={null}>
          <MacSwitch on={s.notifications.autoDetected} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Calendars">
        <SettingsRow label="Calendar access" description={s.calendars.access ? undefined : 'Show meetings from calendars on your Mac.'} controlWidth={null}>
          {s.calendars.access ? <GrantedLabel text="Granted" /> : <AccentActionButton title="Grant" />}
        </SettingsRow>
        <Divider />
        <SettingsRow label="Upcoming meetings" description="How far ahead to show meetings and check reminders.">
          <MacPopUp value={s.calendars.upcoming} />
        </SettingsRow>
        <Divider />
        <SettingsRow label="Only show events with a meeting link" controlWidth={null}>
          <MacSwitch on={s.calendars.linksOnly} />
        </SettingsRow>
        {s.calendars.sources.map((g) => (
          <React.Fragment key={g.title}>
            <Divider />
            {/* calendarSourcesControl: group title 12pt semibold, then one checkbox row per calendar. VERIFY row style. */}
            <div style={{display: 'flex', flexDirection: 'column', gap: 6, padding: `${spacing[4]}px 0`}}>
              <span style={{...font(12, 'semibold'), color: colors.textSecondary}}>{g.title}</span>
              {g.calendars.map((c) => (
                <div key={c.name} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{width: 8, height: 8, borderRadius: 4, background: c.color, flex: 'none'}} />
                  <span style={{...type.body, color: colors.textPrimary, flex: 1}}>{c.name}</span>
                  <MacSwitch on={c.on} />
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </SettingsSection>

      <div style={{paddingTop: spacing[8]}}>
        <SettingsSection title="Advanced">
          <SettingsRow
            label="Enable post-meeting hook"
            description="Runs your chosen executable with your user permissions after each completed meeting. It receives the meeting ID and completion time as JSON on stdin."
            controlWidth={null}
          >
            <MacSwitch on={s.advanced.hook} />
          </SettingsRow>
          <div style={{paddingBottom: spacing[8]}}>
            <Disclosure>
              <span style={{...type.captionMedium, color: colors.textSecondary}}>Hook details</span>
            </Disclosure>
          </div>
          <Divider />
          <SettingsRow label="Hook script">
            <PathPicker path={s.advanced.hookPath} prompt="Choose a script…" />
          </SettingsRow>
          <Divider />
          <SettingsRow label="Timeout">
            <div style={{display: 'flex', alignItems: 'center', gap: spacing[8], justifyContent: 'flex-end', width: '100%'}}>
              <MacNumberField value={String(s.advanced.timeoutSeconds)} />
              <span style={{...type.callout, color: colors.textSecondary, width: 58}}>seconds</span>
              <MacStepper />
            </div>
          </SettingsRow>
        </SettingsSection>
      </div>
    </>
  );
};
