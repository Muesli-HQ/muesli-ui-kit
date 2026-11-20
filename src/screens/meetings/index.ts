// Meetings screens (MeetingsView, MeetingListItemView, MeetingDetailView, MeetingNotesView,
// MeetingTranscriptView, MeetingRecordingPlayerView @ v0.8.6).
export {MeetingsBrowser, QuickNoteButton} from './MeetingsBrowser';
export type {MeetingsBrowserProps, MeetingBrowserSort, MeetingBrowserFilter, ActiveMeetingBanner} from './MeetingsBrowser';
export {MeetingListItem} from './MeetingListItem';
export type {MeetingListItemProps} from './MeetingListItem';
export {MeetingDetail} from './MeetingDetail';
export type {MeetingDetailProps, MeetingDocumentMode, MeetingThreadContext, ReferencedPassage} from './MeetingDetail';
export {MeetingNotes} from './MeetingNotes';
export type {MeetingNotesProps, RelatedMeeting} from './MeetingNotes';
export {MeetingTranscript, TranscriptBubble, parseTranscript} from './MeetingTranscript';
export type {MeetingTranscriptProps, TranscriptMessage} from './MeetingTranscript';
export {RecordingPlayer, formatPlayerTime, defaultPeaks} from './RecordingPlayer';
export type {RecordingPlayerProps} from './RecordingPlayer';
export {DashboardPageHeader, ICloudSyncButton, StatusBadge, formatDuration, previewSnippet} from './parts';
export type {MeetingData, MeetingStatus, MeetingSourceBadge, UpcomingEvent, UpcomingEventGroup} from './types';
// Meeting screen recording (MeetingMediaView, MeetingVideoPlayerView, MeetingScreenSourcePicker,
// in-progress MeetingDetailView + LiveTranscriptView @ v0.8.6).
export {MeetingMedia, MeetingVideoPlayer} from './MeetingMedia';
export type {MeetingMediaProps, MeetingVideoPlayerProps, ScreenRecordingPhase} from './MeetingMedia';
export {ScreenSourcePicker} from './ScreenSourcePicker';
export type {ScreenSourcePickerProps, ScreenSourceOption} from './ScreenSourcePicker';
export {LiveMeetingDetail, LiveTranscript} from './LiveMeetingDetail';
export type {LiveMeetingDetailProps} from './LiveMeetingDetail';
export {FloatingMeetingTranscript, floatingTranscriptFrame, FLOATING_TRANSCRIPT_SIZE} from './FloatingMeetingTranscript';
export type {FloatingMeetingTranscriptProps} from './FloatingMeetingTranscript';
