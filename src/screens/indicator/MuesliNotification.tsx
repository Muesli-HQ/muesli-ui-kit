// MeetingNotificationController.show(...) @ v0.8.6: muesli's own floating notification panel (not macOS
// Notification Center). One card serves meeting detection, "Daily recap ready" and "To-do reminder":
//
//   meeting detected   title/subtitle from the calendar, platform icon, green split button (join + record ▾)
//   Daily recap ready  subtitle = target day `.abbreviated` ("6 Nov 2026"), "View recap",  opensFromBody
//   To-do reminder     subtitle = the to-do title,                          "View to-do", opensFromBody
//
// Geometry (AppKit bottom-up converted to top-down): card 60pt tall, radius 10, fill (0.10, 0.10, 0.12) @ 0.97,
// 1pt white @ 10% border; panel shadow. Optional 26pt icon at x 14 (text then starts at 14 + 26 + 9).
// Title Nunito Sans 13 semibold white, top 10; subtitle 11 regular white @ 55%, top 30.
// Single action: 126×30 at right inset 12, top 15, radius 6, #2563EB (defaultAccentLightHex), 12 medium white.
// Split: 126pt #33B887 + 24pt #26946B chevron "▾", 11 medium black ink; card fixed at 344pt.
// Countdown: 3pt bar along the bottom, rgba(0.3, 0.6, 1.0, 0.8), shrinks linearly over 15 s (paused on hover).
// Dismiss: 22pt circle centred on the card's top-left corner, black @ 70%, 1pt white @ 55%, xmark 10 medium @ 86%.
// Card width (single action) = clamp(textX + max(title, subtitle width) + 8 + 126 + 12, 344, 420).
// Panel: top-right of the screen's visible frame, 16pt margin.
// Long text: NSTextField(labelWithString:) clips at the frame (no ellipsis). VERIFY on device.
import React from 'react';
import {font} from '../../typography';
import {fontStack} from '../../fonts';
import {Symbol} from '../../icons/Icon';

export const NOTIFICATION = {
  cardHeight: 60,
  dismissSize: 22,
  /** cardX = topGutter = dismissSize / 2 + 1 */
  inset: 12,
  minWidth: 344,
  maxWidth: 420,
  buttonWidth: 126,
  margin: 16,
  dismissAfter: 15,
} as const;

let measureCtx: CanvasRenderingContext2D | null | undefined;
/** Text width in Nunito Sans; falls back to a per-character estimate where no canvas exists. */
const measure = (text: string, size: number, weight: number) => {
  if (measureCtx === undefined) {
    try {
      measureCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
    } catch {
      measureCtx = null;
    }
  }
  if (!measureCtx) return text.length * size * 0.53;
  measureCtx.font = `${weight} ${size}px ${fontStack}`;
  return measureCtx.measureText(text).width;
};

/** singleActionCardWidth(requiredTextWidth:textX:). */
export const notificationCardWidth = (title: string, subtitle: string, hasIcon = false) => {
  const textX = hasIcon ? 14 + 26 + 9 : 14;
  const required = Math.max(measure(title, 13, 600), measure(subtitle, 11, 400));
  return Math.min(NOTIFICATION.maxWidth, Math.max(NOTIFICATION.minWidth, Math.ceil(textX + required + 8 + NOTIFICATION.buttonWidth + 12)));
};

/** Panel size including the dismiss-button gutter (top and left). */
export const notificationPanelSize = (cardWidth: number) => ({width: cardWidth + NOTIFICATION.inset, height: NOTIFICATION.cardHeight + NOTIFICATION.inset});

/** Panel top-left on a screen (top-down coordinates): top-right of the visible frame, 16pt margin. */
export const notificationOrigin = (screenWidth: number, menuBarHeight: number, cardWidth: number) => ({
  x: screenWidth - notificationPanelSize(cardWidth).width - NOTIFICATION.margin,
  y: menuBarHeight + NOTIFICATION.margin,
});

export type NotificationButtonState = 'rest' | 'hover' | 'pressed';

export interface MuesliNotificationProps {
  title: string;
  subtitle: string;
  /** Single-action label ("View to-do", "View recap", "Start Transcribing"). Ignored with `split`. */
  actionLabel?: string;
  /** Meeting platform icon (26pt), e.g. an <img>. Explicit (template) icons are tinted white by the caller. */
  icon?: React.ReactNode;
  /** Meeting-detection split button: the armed action's label (e.g. "Join & Transcribe"). Fixes the card at 344pt. */
  split?: {label: string};
  /** Remaining countdown, 1 → 0. */
  countdown?: number;
  /** Override the computed card width. */
  cardWidth?: number;
  actionState?: NotificationButtonState;
  dismissState?: NotificationButtonState;
}

export const MuesliNotification: React.FC<MuesliNotificationProps> = ({
  title,
  subtitle,
  actionLabel = 'Start Transcribing',
  icon,
  split,
  countdown = 1,
  cardWidth,
  actionState = 'rest',
  dismissState = 'rest',
}) => {
  const W = cardWidth ?? (split ? NOTIFICATION.minWidth : notificationCardWidth(title, subtitle, !!icon));
  const textX = icon ? 14 + 26 + 9 : 14;
  const buttonsWidth = split ? NOTIFICATION.buttonWidth + 24 : NOTIFICATION.buttonWidth;
  const buttonX = W - buttonsWidth - 12;
  const textWidth = buttonX - 8 - textX;
  // Layer-backed borderless NSButtons draw no hover; pressing darkens the title cell slightly. VERIFY.
  const press = (bg: string, st: NotificationButtonState) => (st === 'pressed' ? `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), ${bg}` : bg);
  const {inset, cardHeight, dismissSize} = NOTIFICATION;
  return (
    <div style={{position: 'relative', width: W + inset, height: cardHeight + inset, flex: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: inset,
          top: inset,
          width: W,
          height: cardHeight,
          borderRadius: 10,
          overflow: 'hidden',
          background: 'rgba(26,26,31,0.97)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), 0 12px 34px rgba(0,0,0,0.45)',
        }}
      >
        {icon ? <div style={{position: 'absolute', left: 14, top: (cardHeight - 26) / 2 - 1, width: 26, height: 26, display: 'flex'}}>{icon}</div> : null}
        <div style={{position: 'absolute', left: textX, top: 10, width: textWidth, ...font(13, 'semibold'), lineHeight: '18px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip'}}>{title}</div>
        <div style={{position: 'absolute', left: textX, top: 30, width: textWidth, ...font(11), lineHeight: '16px', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip'}}>{subtitle}</div>
        {split ? (
          <div style={{position: 'absolute', left: buttonX, top: 15, height: 30, display: 'flex'}}>
            <div style={{width: NOTIFICATION.buttonWidth, borderRadius: '6px 0 0 6px', background: press('#33B887', actionState), ...font(11, 'medium'), color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap'}}>{split.label}</div>
            <div style={{width: 24, borderRadius: '0 6px 6px 0', background: '#26946B', fontSize: 9, fontWeight: 500, color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>▾</div>
          </div>
        ) : (
          <div style={{position: 'absolute', left: buttonX, top: 15, width: NOTIFICATION.buttonWidth, height: 30, borderRadius: 6, background: press('#2563EB', actionState), ...font(12, 'medium'), color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap'}}>{actionLabel}</div>
        )}
        <div style={{position: 'absolute', left: 0, bottom: 0, height: 3, width: W * Math.max(0, Math.min(1, countdown)), background: 'rgba(77,153,255,0.8)'}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: inset - dismissSize / 2,
          top: 0,
          width: dismissSize,
          height: dismissSize,
          boxSizing: 'border-box',
          borderRadius: dismissSize / 2,
          background: dismissState === 'pressed' ? 'rgba(40,40,40,0.85)' : 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name="xmark" size={10} weight="medium" color="rgba(255,255,255,0.86)" />
      </div>
    </div>
  );
};

/** "To-do reminder" (MuesliController.showTodoReminder). */
export const TodoReminderNotification: React.FC<{todoTitle: string} & Omit<MuesliNotificationProps, 'title' | 'subtitle' | 'actionLabel' | 'split' | 'icon'>> = ({todoTitle, ...rest}) => (
  <MuesliNotification title="To-do reminder" subtitle={todoTitle} actionLabel="View to-do" {...rest} />
);

/** "Daily recap ready" (scheduled recap). `dayLabel` = target day `.abbreviated`, e.g. "6 Nov 2026". */
export const DailyRecapNotification: React.FC<{dayLabel: string} & Omit<MuesliNotificationProps, 'title' | 'subtitle' | 'actionLabel' | 'split' | 'icon'>> = ({dayLabel, ...rest}) => (
  <MuesliNotification title="Daily recap ready" subtitle={dayLabel} actionLabel="View recap" {...rest} />
);
