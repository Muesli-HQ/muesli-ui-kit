// Vidshots (v0.8.6 "FeedbackCapture*"): dashboard page + capture overlays. See each file's header for its Swift source.
export * from './model';
export {VidshotsPage, VidshotsRecordButton, type VidshotsPageProps, type VidshotsRecordButtonProps} from './VidshotsPage';
export {VidshotRow, RowActionButton, type VidshotRowProps} from './VidshotRow';
export {VidshotDetail, type VidshotDetailProps, type VidshotCopyButton} from './VidshotDetail';
export {VidshotPill, VidshotPillOverlay, PillWaveform, type VidshotPillProps, type VidshotPillOverlayProps, type PillWaveformProps} from './VidshotPill';
export {CapturePickerOverlay, PICKER_HINT, type CapturePickerOverlayProps, type Rect} from './CapturePicker';
export {InkOverlay, INK_COLOR, type InkOverlayProps, type InkStroke} from './InkOverlay';
export {NativeButton, NativeSpinner, NativeSegmented, NativeDisclosure, NativeContentUnavailable, NativeVideoPlayer, useSystemColors} from './native';
