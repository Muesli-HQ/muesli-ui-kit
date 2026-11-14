// MeetingTranscriptView + TranscriptChatBubble + TranscriptChatMessage (MeetingDetailView.swift @ v0.8.6).
// Lines are "[HH:mm:ss] Speaker: text"; only recognised speaker labels become metadata
// (You, Others, Multiple speakers, Unknown speaker, Speaker N, Local speaker [N]).
// "You" bubbles sit trailing in an accent tint; everyone else leading on surfacePrimary.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {layout, radius, spacing} from '../../tokens/theme';
import {font, type} from '../../typography';
import {lineSpaced, opacityOf} from './parts';

export interface TranscriptMessage {
  id: number;
  timestamp?: string;
  speaker?: string;
  text: string;
  isUser: boolean;
}

const isLikelySpeakerLabel = (label: string) => {
  if (!label || label.length > 32) return false;
  const l = label.toLowerCase();
  if (['you', 'others', 'multiple speakers', 'unknown speaker'].includes(l)) return true;
  if (/^speaker\s+\d+$/i.test(label)) return true;
  return /^local speaker(\s+\d+)?$/i.test(label);
};

const splitSpeaker = (text: string): {speaker?: string; text: string} => {
  const sep = text.indexOf(':');
  if (sep < 0) return {text};
  const candidate = text.slice(0, sep).trim();
  if (!isLikelySpeakerLabel(candidate)) return {text};
  const body = text.slice(sep + 1).trim();
  return {speaker: candidate, text: body || text};
};

/** TranscriptChatMessage.messages(from:) */
export function parseTranscript(transcript: string): TranscriptMessage[] {
  const out: TranscriptMessage[] = [];
  for (const raw of transcript.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    let timestamp: string | undefined;
    let rest = line;
    if (line.startsWith('[') && line.includes(']')) {
      const end = line.indexOf(']');
      timestamp = line.slice(1, end) || undefined;
      rest = line.slice(end + 1).trim();
    }
    const s = splitSpeaker(rest);
    out.push({id: out.length, timestamp, speaker: s.speaker, text: s.text, isUser: s.speaker?.toLowerCase() === 'you'});
  }
  return out;
}

export const TranscriptBubble: React.FC<{message: TranscriptMessage; highlighted?: boolean}> = ({message, highlighted}) => {
  const {colors} = useMuesliTheme();
  const m = message;
  const metadata = m.speaker && m.timestamp ? `${m.speaker} ${m.timestamp}` : m.speaker ?? m.timestamp;
  const bubble = (
    <div
      style={{
        maxWidth: 680,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: `8px ${spacing[12]}px`,
        borderRadius: radius.small,
        background: m.isUser ? opacityOf(colors.accent, 0.18) : colors.surfacePrimary,
        boxShadow: `inset 0 0 0 1px ${m.isUser ? opacityOf(colors.accent, 0.25) : colors.surfaceBorder}`,
      }}
    >
      {metadata && <span style={{...font(10, 'medium'), color: colors.textTertiary}}>{metadata}</span>}
      <span style={{...type.reading, color: colors.textPrimary, ...lineSpaced(15, 5)}}>{m.text}</span>
    </div>
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: spacing[8],
        justifyContent: m.isUser ? 'flex-end' : 'flex-start',
        // Spacer(minLength: 80) on the far side of the bubble
        paddingLeft: m.isUser ? 80 + spacing[8] : 0,
        paddingRight: m.isUser ? 0 : 80 + spacing[8],
        background: highlighted ? colors.surfaceSelected : 'transparent',
      }}
    >
      {bubble}
    </div>
  );
};

export interface MeetingTranscriptProps {
  transcript: string;
  /** Messages shown so far (live-ish reveal). Defaults to all. */
  visibleMessages?: number;
  highlightedMessage?: number;
  scrollY?: number;
}

export const MeetingTranscript: React.FC<MeetingTranscriptProps> = ({transcript, visibleMessages, highlightedMessage, scrollY = 0}) => {
  const {colors} = useMuesliTheme();
  const all = parseTranscript(transcript);
  const messages = visibleMessages === undefined ? all : all.slice(0, visibleMessages);
  return (
    <div style={{width: '100%', height: '100%', overflow: 'hidden'}}>
      <div style={{transform: `translateY(${-scrollY}px)`, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            width: '100%',
            maxWidth: layout.readingWidth + spacing[24] * 2,
            boxSizing: 'border-box',
            padding: `${spacing[16]}px ${spacing[24]}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[8],
          }}
        >
          {all.length === 0 ? (
            <div style={{...type.body, color: colors.textTertiary, padding: spacing[24]}}>No transcript available</div>
          ) : (
            messages.map((m) => <TranscriptBubble key={m.id} message={m} highlighted={m.id === highlightedMessage} />)
          )}
        </div>
      </div>
    </div>
  );
};
