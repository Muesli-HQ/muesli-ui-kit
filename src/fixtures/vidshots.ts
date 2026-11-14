// Fictional Vidshot captures for demos. Someone at a made-up company ("Brightline") narrating UI bugs
// for a coding assistant. Fixed values only — never derived from Date.now().
import type {InkStroke, VidshotRecord} from '../screens/vidshots';

export const vidshotRecords: VidshotRecord[] = [
  {
    id: 'vs-0412',
    title: 'Safari',
    createdAt: {time: '04:12 PM', day: 'Nov 9, 2026', full: '11/9/2026, 4:12 PM'},
    durationMs: 48_000,
    state: 'ready',
    hasVideo: true,
    hasAudio: true,
    transcript:
      'So on the checkout page, when I tap Apply on the promo code, the total jumps to zero for a second and then the Place order button stays disabled. You can see it here, the spinner never stops. I think the discount request resolves after the cart refresh and overwrites it.',
    keyframes: [
      {index: 1, t: 3_000, said: 'So on the checkout page, when I tap Apply on the promo code,'},
      {index: 2, t: 11_000, said: 'the total jumps to zero for a second'},
      {index: 3, t: 19_000, said: 'and then the Place order button stays disabled. You can see it here, the spinner never stops.'},
      {index: 4, t: 34_000, said: 'I think the discount request resolves after the cart refresh and overwrites it.'},
    ],
    marks: ['marked region x 0.57–0.97, y 0.84–0.96', 'pin 1'],
  },
  {
    id: 'vs-0247',
    title: 'Screen region',
    createdAt: {time: '02:47 PM', day: 'Nov 9, 2026', full: '11/9/2026, 2:47 PM'},
    durationMs: 22_000,
    state: 'ready',
    hasVideo: true,
    hasAudio: true,
    transcript:
      'The sidebar badge says three unread, but when I open the inbox there is nothing there. It only clears after a full reload.',
  },
  {
    id: 'vs-1108',
    title: 'Figma',
    createdAt: {time: '11:08 AM', day: 'Nov 9, 2026', full: '11/9/2026, 11:08 AM'},
    durationMs: 75_000,
    state: 'ready',
    hasVideo: true,
    hasAudio: true,
    transcript:
      'This is the spacing I want for the empty state. Sixteen between the icon and the title, and the button should sit twenty four below the description. Right now in the build it is all crammed together.',
  },
  {
    id: 'vs-0531',
    title: 'Linear',
    createdAt: {time: '05:31 PM', day: 'Nov 8, 2026', full: '11/8/2026, 5:31 PM'},
    durationMs: 31_000,
    state: 'ready',
    hasVideo: true,
    hasAudio: false,
    transcript: '',
  },
];

/** A capture still being processed (top of the list right after Finish). */
export const vidshotProcessing: VidshotRecord = {
  id: 'vs-0420',
  title: 'Safari',
  createdAt: {time: '04:20 PM', day: 'Nov 9, 2026', full: '11/9/2026, 4:20 PM'},
  durationMs: 37_000,
  state: 'processing',
  hasVideo: true,
  hasAudio: true,
};

/** Ink for the checkout-bug capture, normalised to the capture rect (top-left origin). */
export const vidshotInkStrokes: InkStroke[] = [
  {
    // A loose loop around the disabled "Place order" button.
    points: [
      [0.6, 0.86], [0.68, 0.845], [0.78, 0.84], [0.88, 0.845], [0.95, 0.865], [0.97, 0.9], [0.95, 0.935],
      [0.87, 0.955], [0.77, 0.957], [0.67, 0.952], [0.6, 0.935], [0.575, 0.9], [0.59, 0.87], [0.63, 0.852],
    ],
  },
  {points: [[0.36, 0.42]], pin: 1},
];

/** Typical microphone levels for a 7-bar waveform while someone is talking. */
export const vidshotWaveLevels = [0.32, 0.58, 0.86, 0.94, 0.7, 0.48, 0.26];
