// Data shapes for the Timeline and Dictations pages. Each mirrors the fields the v0.8.6 Swift rows
// actually read (MuesliCore DictationRecord / MeetingRecord / CotypistSessionRecord /
// QuillConversationRecord / FeedbackCaptureRecord), pre-formatted so fixtures never touch Date.
import type {ControlState} from '../../primitives/Button';

/** A destination app (DictationTargetApplication). `icon` is an image src; omit it to get the
 *  `app.dashed` fallback TargetApplicationIconView draws when the bundle isn't installed. */
export interface TargetApp {
  name: string;
  icon?: string;
}

/** ComputerUseTraceRecord event, as DictationRowView.computerUseTraceView reads it. */
export interface TraceEvent {
  step?: number;
  title: string;
  /** ComputerUseTraceFormatter.displayStatus output, e.g. "done", "failed". */
  status?: string;
  body: string;
  /** "model_output" / "quil_model" bodies render monospaced. */
  kind?: string;
}

export interface ComputerUseTrace {
  /** running | interrupted | done | timed_out | failed | confirm | cancelled */
  finalStatus: string;
  events: TraceEvent[];
}

export interface DictationEntry {
  kind: 'dictation';
  id: string;
  /** TimelineView.formatTime / DictationsView.formatTimeOnly: "hh:mm a", e.g. "09:41 AM". */
  time: string;
  text: string;
  /** DictationRecord.source: "cua" (CUA badge), "quil" (QUILL badge), "ios" (iOS badge), else none. */
  source?: string;
  app?: TargetApp;
  trace?: ComputerUseTrace;
}

export type MeetingStatus = 'recording' | 'processing' | 'completed' | 'noteOnly' | 'failed';

export interface MeetingEntry {
  kind: 'meeting';
  id: string;
  time: string;
  title: string;
  status: MeetingStatus;
  /** MeetingSource: 'mac' shows the "Mac" badge, 'ios' → "iOS", 'granola' → "Imported from Granola". */
  source?: 'mac' | 'ios' | 'granola';
  durationSeconds: number;
  /** MeetingPreviewText.snippet output; empty → "No transcript or notes yet". */
  preview: string;
}

export interface CotypistAcceptance {
  contextBefore: string;
  text: string;
}

export interface CotypistEntry {
  kind: 'cotypist';
  id: string;
  time: string;
  app?: TargetApp;
  acceptances: CotypistAcceptance[];
}

export interface QuillTurn {
  question?: string;
  answer: string;
}

export interface QuillEntry {
  kind: 'quill';
  id: string;
  time: string;
  /** record.turns (preview); the first question titles the row, the last answer previews it. */
  turns: QuillTurn[];
  turnCount: number;
}

export interface VidshotEntry {
  kind: 'vidshot';
  id: string;
  time: string;
  /** manifest.target.appName; "" hides it (screen captures). */
  appName?: string;
  durationMs: number;
  transcript?: string;
  /** Image src for the first frame; omit for the `video` placeholder. */
  preview?: string;
  /** Shows the play.circle.fill overlay (a video file exists). Default true when preview is set. */
  hasVideo?: boolean;
  state?: 'recording' | 'processing' | 'ready';
}

export type TimelineEntry = DictationEntry | MeetingEntry | CotypistEntry | QuillEntry | VidshotEntry;

/** One day section. `header` is pre-formatted: "TODAY", "YESTERDAY", or the Swift date format uppercased. */
export interface DayGroup<E = TimelineEntry> {
  header: string;
  entries: E[];
}

export type RowActionId = 'details' | 'copyTrace' | 'copy' | 'delete' | 'showMore' | 'expand' | 'play' | 'select';

/** Everything about a row a video might animate. All rows' interaction state is driven from here. */
export interface RowInteraction {
  /** onHover: backgroundHover fill + reveals the action buttons. */
  hovered?: boolean;
  /** Keyboard focus on an action (reveals actions, like FocusState in Swift). */
  focusedAction?: RowActionId;
  /** Per-action MuesliButtonStyle state (cursor over / pressing a quiet action button). */
  actionStates?: Partial<Record<RowActionId, ControlState>>;
  /** Copy confirmation: shows "Copied" / "Trace copied" and the checkmark glyph. */
  copied?: 'copy' | 'copyTrace';
  /** CUA trace details / Quill conversation expanded. */
  expanded?: boolean;
  /** "Show more" toggled for long dictation text. */
  showsFullText?: boolean;
}

export type RowInteractions = Record<string, RowInteraction | undefined>;

/** DictationStats / MeetingStats fields shown by StatsHeaderView. */
export interface PageStats {
  streakDays: number;
  totalWords: number;
  averageWPM: number;
  meetings: number;
}

export type StatId = 'streak' | 'words' | 'pace' | 'meetings';

export interface ICloudState {
  enabled: boolean;
  syncing?: boolean;
  error?: boolean;
  /** Degrees for RotatingSyncIcon while syncing (drive from frame for the spin). */
  rotation?: number;
}

export type RecordOrigin = 'all' | 'thisMac' | 'fromIPhone';

/** HistoryDateFilter.label */
export type DateFilterLabel = 'All time' | 'Last 2 days' | 'Last week' | 'Last 2 weeks' | 'Last month' | 'Last 3 months';
