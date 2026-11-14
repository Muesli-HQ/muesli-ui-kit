// Data shapes for Chat (MeetingChatView.swift + MuesliCore/MeetingChatModels.swift @ v0.8.6),
// pre-formatted so renders never depend on the machine's locale or clock.

/** MeetingChatSourceKind */
export type ChatSourceKind = 'transcript' | 'manualNotes' | 'generatedNotes' | 'title';
export const SOURCE_KIND_LABEL: Record<ChatSourceKind, string> = {
  title: 'Meeting title',
  transcript: 'Transcript',
  manualNotes: 'Written notes',
  generatedNotes: 'Generated notes',
};

/** MeetingChatCitation. In answers it is referenced as `[[key]]`, displayed as `[n]` by citation order. */
export interface ChatCitation {
  key: string;
  meetingId: number;
  title: string;
  /** `.dateTime.month(.abbreviated).day().year()` → "Nov 4, 2026" (source group header). */
  dateLabel: string;
  /** `formatted(date: .abbreviated, time: .shortened)` → "Nov 4, 2026 at 10:14 AM" (citation popover). */
  dateTimeLabel: string;
  kind: ChatSourceKind;
  /** Transcript wall-clock timestamp, e.g. "10:14:05". */
  timestamp?: string;
  excerpt: string;
}

/** ChatFileReference (MeetingChatAttachmentPreview.swift). */
export interface ChatFile {
  id: string;
  name: string;
  kind: 'pdf' | 'image' | 'markdown' | 'text';
  /** ByteCountFormatter(.file), e.g. "2.4 MB". */
  sizeLabel: string;
  /** Thumbnail image URL (PDF first page / image), shown for PDFs and images only. */
  thumbnail?: string;
}

/** MeetingChatActivity — one research tool call shown in "N research steps". */
export interface ChatActivity {
  title: string;
  detail?: string;
  output?: string;
  state: 'running' | 'completed' | 'failed' | 'cancelled';
}

/** MeetingChatTurnState */
export type ChatTurnState = 'finding' | 'writing' | 'completed' | 'failed' | 'stopped' | 'interrupted';

export interface ChatTurn {
  id: string;
  question: string;
  files?: ChatFile[];
  /** Markdown with `[[key]]` citation markers. Present once the answer is written. */
  answer?: string;
  citations: ChatCitation[];
  state: ChatTurnState;
  error?: string;
  /** "Edited draft saved" check after Export. */
  hasEditedDraft?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  /** `updatedAt.formatted(.dateTime.month(.abbreviated).day())` → "Nov 6". */
  dateLabel: string;
}

/** MeetingChatSourceChoice — a meeting offered by @-mention. */
export interface ChatSourceChoice {
  id: number;
  title: string;
  /** `.dateTime.month(.abbreviated).day().year()` */
  dateLabel: string;
}
