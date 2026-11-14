// Data shapes for the Meetings screens. They mirror the fields the v0.8.6 views read from
// MuesliCore.MeetingRecord (MeetingListItemView.swift, MeetingDetailView.swift), pre-formatted
// so a video never depends on the render machine's locale or clock.

/** MeetingStatus (MeetingStatusDisplay.swift). */
export type MeetingStatus = 'recording' | 'processing' | 'completed' | 'noteOnly' | 'failed';

/** MeetingListItemView.sourceIndicator: imported audio, or a retained recording. */
export type MeetingSourceBadge = 'imported' | 'recording';

export interface MeetingData {
  id: number;
  title: string;
  /**
   * MeetingBrowserLogic.formatStartTime: DateFormatter `.medium` date + `.medium` time,
   * e.g. "Nov 4, 2026 at 10:02:14 AM" (en_US).
   */
  startLabel: string;
  durationSeconds: number;
  /** MeetingRecord.wordCount (detail metadata "N words"). */
  wordCount: number;
  status: MeetingStatus;
  /** Folder the meeting lives in (folder badge / folder pill). */
  folder?: string;
  source?: MeetingSourceBadge;
  /** record.followUpToID != nil */
  isFollowUp?: boolean;
  /** Another meeting follows up on this one. */
  hasFollowUps?: boolean;
  /** MeetingRecord.formattedNotes (Markdown). */
  notes: string;
  /** MeetingRecord.rawTranscript: "[HH:mm:ss] Speaker: text" lines (TranscriptFormatter.swift). */
  transcript: string;
  /** Display names attached in MeetingParticipantsView. */
  participants: string[];
}

/** One calendar event in "Coming Up" (MeetingsView.comingUpSection). */
export interface UpcomingEvent {
  title: string;
  /** formatTimeRange: "HH:mm – HH:mm" */
  timeRange: string;
  /** Has a meeting URL, so the Join split control shows. */
  joinable?: boolean;
}

export interface UpcomingEventGroup {
  dayNumber: string;
  /** "Today" / "Tomorrow" / "MMM" */
  dayLabel: string;
  /** "EEE" */
  dayOfWeek: string;
  isToday: boolean;
  events: UpcomingEvent[];
}
