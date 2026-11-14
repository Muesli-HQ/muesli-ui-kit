// Fictional demo data for the indicator, Cotypist, Settings and Models screens. Fixed numbers only.
import type {GeneralSettingsState, AppearanceSettingsState, ExperimentalSettingsState, CotypistSettingsState} from '../screens/settings';
import type {DictationModelsState, CotypistModelsState} from '../screens/models';

/** 45 smoothed amplitude ticks (1.5 s at 30 Hz) of mid-sentence speech, newest last. */
export const SPEECH_LEVELS: number[] = [
  0.05, 0.12, 0.28, 0.46, 0.58, 0.63, 0.55, 0.41, 0.33, 0.39, 0.52, 0.66, 0.72, 0.69, 0.57, 0.44, 0.31, 0.22, 0.27, 0.4,
  0.55, 0.61, 0.58, 0.47, 0.36, 0.3, 0.38, 0.51, 0.64, 0.7, 0.62, 0.49, 0.35, 0.24, 0.18, 0.26, 0.42, 0.57, 0.68, 0.74,
  0.71, 0.6, 0.48, 0.52, 0.61,
];

export const COTYPIST_DEMO = {
  title: 'Re: Thursday launch review',
  before: 'Hi Priya,\n\nThanks for sending the deck over. ',
  typed: 'I had a look this morning and ',
  suggestion: 'the pricing slide reads much more clearly now.',
};

export const GENERAL_SETTINGS: GeneralSettingsState = {
  launchAtLogin: true,
  openDashboardOnLaunch: false,
  permissions: {microphone: true, accessibility: true, inputMonitoring: true, screenRecording: false, systemAudio: true, calendars: true},
  sync: {status: 'Set up private iCloud text sync.', action: 'Set up sync', actionSymbol: 'icloud', linkedDevice: {name: 'Maya’s iPhone', platform: 'iPhone'}},
  storage: {
    models: 2_184_000_000,
    meetingAudio: 1_312_000_000,
    meetingVideo: 0,
    feedbackCaptures: 248_000_000,
    database: 96_400_000,
    waveformCache: 38_700_000,
    other: 12_100_000,
    freeBytes: 214_600_000_000,
  },
};

export const APPEARANCE_SETTINGS: AppearanceSettingsState = {
  indicatorStyle: 'notch',
  showFloatingIndicator: true,
  indicatorPosition: 'Middle Right',
  showHotkeyOnHover: false,
  theme: 'dark',
  menuBarIcon: 'muesli',
  showHotkeyInMenuBar: true,
  accentHex: '1e1e2e',
  soundEnabled: true,
  showNextMeeting: true,
};

export const COTYPIST_SETTINGS_ON: CotypistSettingsState = {
  state: 'on',
  showNewBadge: true,
  modelLabel: 'Qwen 3.5 0.8B',
  modelSizeLabel: '~444.1 MB',
  modelState: {kind: 'ready'},
  length: 'Up to a sentence',
  frequencyIndex: 1,
  completeWords: true,
  wordPause: 'Normal (0.5 s)',
  useScreenContext: true,
  quietApps: [],
  recommendedApps: [{name: '1Password'}, {name: 'Xcode'}],
};

export const COTYPIST_SETTINGS_OFF: CotypistSettingsState = {...COTYPIST_SETTINGS_ON, state: 'off', modelState: {kind: 'missing'}};
export const COTYPIST_SETTINGS_DOWNLOADING: CotypistSettingsState = {...COTYPIST_SETTINGS_ON, state: 'addingInputSource', modelState: {kind: 'downloading', fraction: 0.42}};

export const EXPERIMENTAL_SETTINGS: ExperimentalSettingsState = {
  vidshotEnabled: false,
  drawModifier: 'Shift',
  timeTurnerEnabled: false,
  plannerEnabled: true,
  plannerBackend: 'ChatGPT',
  chatGPTSignedIn: false,
  plannerModel: 'GPT-6.1 Sol (default)',
  thinkingChoices: ['Low', 'Medium', 'High', 'Extra High', 'Maximum'],
  thinkingIndex: 1,
  timeoutSeconds: 120,
  quillEnabled: false,
  quillSounds: true,
  quillSource: 'Local Models',
  cotypistAvailable: true,
  cotypist: COTYPIST_SETTINGS_ON,
};

export const DICTATION_MODELS: DictationModelsState = {
  appleSpeech: {status: 'downloaded'},
  appleSpeechLanguage: 'System Language - English (United Kingdom)',
  parakeetVariant: 'parakeetUnified',
  parakeet: {status: 'active'},
  whisperVariant: 'whisperSmall',
  whisper: {
    status: 'downloading',
    download: {fraction: 0.38, currentFile: 'openai_whisper-small/AudioEncoder.mlmodelc/weights/weight.bin', completedFiles: 2, totalFiles: 9, completedBytes: 94_300_000, totalBytes: 248_600_000, bytesPerSecond: 18_400_000, etaSeconds: 8.4},
  },
  phonon25: {status: 'notDownloaded'},
  medASR: {status: 'notDownloaded'},
  cohereTranscribe: {status: 'notDownloaded'},
};

export const COTYPIST_MODELS_STATE: CotypistModelsState = {
  selected: 'qwen35_0_8b',
  models: {
    qwen35_0_8b: {kind: 'ready'},
    qwen35_2b: {kind: 'downloading', download: {fraction: 0.61, currentFile: 'model.safetensors', completedFiles: 3, totalFiles: 5, completedBytes: 658_500_000, totalBytes: 1_079_459_206, bytesPerSecond: 32_800_000, etaSeconds: 12.8}},
    gemma4E2B: {kind: 'missing'},
  },
};
