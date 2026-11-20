// FloatingMeetingTranscriptPanel.swift + LiveTranscriptFeedView (LiveTranscriptView.swift) @ v0.8.6: the live
// transcript that opens beside the meeting recording pill (or under the notch) while a meeting records.
//
// Panel 360×320, radius 8 (continuous), 1pt surfaceBorder stroke. Background: .ultraThinMaterial over
// backgroundRaised @ 0.94, or solid black when attached to the notch. Header 42pt, padding h16, HStack spacing 8:
// "Live transcript" (callout semibold, opens notes) · Spacer · 6pt dot (success / textTertiary when paused) ·
// "Live"/"Paused" caption · pause/play · chevron.down (hide) · doc.on.doc / checkmark (copy, 1.2 s); icons 12pt
// semibold in 24×24. Divider. Feed: oldest-first, bottom-anchored, spacing 6, padding h12 / v8; partials last
// (Others, then You); empty → "Waiting for speech…" (body, textTertiary).
// Placement (FloatingMeetingTranscriptPlacement.frame): beside the indicator, gap 0, on the side with more room
// (left preferred when it fits), vertically centred on it, clamped 8pt inside the visible frame.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {spacing} from '../../tokens/theme';
import {type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {parseTranscript} from './MeetingTranscript';
import {LiveBubble} from './LiveMeetingDetail';

export const FLOATING_TRANSCRIPT_SIZE = {w: 360, h: 320} as const;

type Rect = {x: number; y: number; w: number; h: number};

/** FloatingMeetingTranscriptPlacement.frame(beside:visibleFrame:), in top-down screen points. */
export const floatingTranscriptFrame = (indicator: Rect, visible: Rect, size = FLOATING_TRANSCRIPT_SIZE): Rect => {
  const inset = 8;
  const availableOnLeft = indicator.x - visible.x;
  const availableOnRight = visible.x + visible.w - (indicator.x + indicator.w);
  const prefersLeft = availableOnLeft >= size.w || availableOnLeft >= availableOnRight;
  const proposedX = prefersLeft ? indicator.x - size.w : indicator.x + indicator.w;
  const minX = visible.x + inset;
  const maxX = Math.max(minX, visible.x + visible.w - inset - size.w);
  const minY = visible.y + inset;
  const maxY = Math.max(minY, visible.y + visible.h - inset - size.h);
  return {x: Math.min(Math.max(proposedX, minX), maxX), y: Math.min(Math.max(indicator.y + indicator.h / 2 - size.h / 2, minY), maxY), w: size.w, h: size.h};
};

export interface FloatingMeetingTranscriptProps {
  /** Committed "[HH:mm:ss] Speaker: text" lines (as LiveTranscriptView receives them). */
  transcript: string;
  partialYou?: string;
  partialOthers?: string;
  paused?: boolean;
  /** Copy confirmation (checkmark in success green for 1.2 s). */
  copied?: boolean;
  /** Attached to the notch: solid black background. */
  notch?: boolean;
  /** Feed scroll from the bottom anchor (points scrolled up). */
  scrollUp?: number;
  /** Header control under the pointer, for videos. `.plain` buttons have no hover; pressed dims. */
  pressed?: 'title' | 'pause' | 'hide' | 'copy';
}

export const FloatingMeetingTranscript: React.FC<FloatingMeetingTranscriptProps> = ({
  transcript,
  partialYou = '',
  partialOthers = '',
  paused = false,
  copied = false,
  notch = false,
  scrollUp = 0,
  pressed,
}) => {
  const {colors} = useMuesliTheme();
  const messages = parseTranscript(transcript);
  const pY = partialYou.trim();
  const pO = partialOthers.trim();
  const empty = messages.length === 0 && !pY && !pO;
  const dim = (k: FloatingMeetingTranscriptProps['pressed']) => (pressed === k ? 0.6 : 1);
  const icon = (name: string, color: string, k: FloatingMeetingTranscriptProps['pressed'], disabled = false) => (
    <span style={{width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : dim(k), flex: 'none'}}>
      <Symbol name={name} size={12} weight="semibold" color={color} />
    </span>
  );
  return (
    <div
      style={{
        width: FLOATING_TRANSCRIPT_SIZE.w,
        height: FLOATING_TRANSCRIPT_SIZE.h,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        boxSizing: 'border-box',
        // .ultraThinMaterial over backgroundRaised @ 0.94 (approximated: translucent raised fill + backdrop blur). VERIFY.
        background: notch ? '#000000' : colors.backgroundRaised,
        backdropFilter: notch ? undefined : 'blur(30px) saturate(1.5)',
        boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}, 0 10px 30px rgba(0,0,0,0.35)`,
        ...type.body,
        flex: 'none',
      }}
    >
      <div style={{height: 42, flex: 'none', display: 'flex', alignItems: 'center', gap: spacing[8], padding: `0 ${spacing[16]}px`}}>
        <span style={{...type.callout, fontWeight: 600, color: colors.textPrimary, opacity: dim('title'), whiteSpace: 'nowrap'}}>Live transcript</span>
        <span style={{flex: 1}} />
        <span style={{width: 6, height: 6, borderRadius: 3, background: paused ? colors.textTertiary : colors.success, flex: 'none'}} />
        <span style={{...type.caption, color: colors.textSecondary}}>{paused ? 'Paused' : 'Live'}</span>
        {icon(paused ? 'play.fill' : 'pause.fill', colors.textPrimary, 'pause')}
        {icon('chevron.down', colors.textSecondary, 'hide')}
        {icon(copied ? 'checkmark' : 'doc.on.doc', copied ? colors.success : colors.textSecondary, 'copy', empty)}
      </div>
      {/* Divider().background(surfaceBorder) */}
      <div style={{height: 1, flex: 'none', background: colors.surfaceBorder}} />
      {/* ScrollView + .defaultScrollAnchor(.bottom): short feeds sit at the top; once they overflow, the newest line stays
          at the bottom edge. (CSS: flex-end column + marginBottom auto; auto margins collapse when space is negative.) */}
      <div style={{flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        <div style={{flex: 'none', marginBottom: 'auto', transform: scrollUp ? `translateY(${scrollUp}px)` : undefined, display: 'flex', flexDirection: 'column', gap: 6, padding: `${spacing[8]}px ${spacing[12]}px`}}>
          {empty ? (
            <span style={{...type.body, color: colors.textTertiary, paddingTop: spacing[8]}}>Waiting for speech…</span>
          ) : (
            <>
              {messages.map((m) => (
                <LiveBubble key={m.id} speaker={m.speaker} timestamp={m.timestamp} text={m.text} isUser={m.isUser} isPartial={false} />
              ))}
              {pO ? <LiveBubble speaker="Others" text={pO} isUser={false} isPartial /> : null}
              {pY ? <LiveBubble speaker="You" text={pY} isUser isPartial /> : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
