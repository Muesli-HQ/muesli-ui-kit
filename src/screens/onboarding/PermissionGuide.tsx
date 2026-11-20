// AccessibilityPermissionGuideController.swift @ v0.8.6: the floating guide muesli puts over System Settings while a
// permission is being granted (Accessibility, Input Monitoring, Screen Recording). A dark rounded panel with an
// instruction ("↑ Drag this row up into this list", bobbing arrow) and a draggable app row (dashed accent outline);
// after a drop it shrinks to "Turn muesli on — If it appears above, turn on its switch" (hand.tap.fill).
// Geometry: AccessibilityPermissionGuideLayout.frames(for:) (AppKit bottom-up, converted to top-down here).
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';

export type GuidePermission = 'accessibility' | 'inputMonitoring' | 'screenRecording';
export type GuideDirection = 'up' | 'down';
type Rect = {x: number; y: number; w: number; h: number};

/** Frames in the Settings window's own top-down coordinates; null when the window is too small (< 720 × 500). */
export const permissionGuideFrames = (settingsW: number, settingsH: number): {guide: Rect; dragSource: Rect; postDropGuide: Rect; direction: GuideDirection} | null => {
  if (settingsW < 720 || settingsH < 500) return null;
  const sidebarWidth = Math.min(Math.max(settingsW * 0.32, 250), 370);
  const contentMinX = sidebarWidth + 24;
  const contentMaxX = settingsW - 28;
  const contentWidth = contentMaxX - contentMinX;
  if (contentWidth < 360) return null;
  const guideW = Math.min(640, contentWidth - 24);
  const guideH = 128;
  // AppKit: guideY = minY + max(88, h × 0.18), capped at maxY − guideH − 80.
  const fromBottom = Math.min(Math.max(88, settingsH * 0.18), settingsH - guideH - 80);
  const guide = {x: Math.round(contentMinX + (contentWidth - guideW) / 2), y: Math.round(settingsH - fromBottom - guideH), w: Math.round(guideW), h: guideH};
  const dragSource = {x: guide.x + 12, y: guide.y + guide.h - 12 - 70, w: guide.w - 24, h: 70};
  const postDropGuide = {x: guide.x + 64, y: dragSource.y + dragSource.h - 7 - 56, w: guide.w - 128, h: 56};
  const direction: GuideDirection = guide.y + guide.h / 2 >= settingsH / 2 ? 'up' : 'down';
  return {guide, dragSource, postDropGuide, direction};
};

export const guideInstruction = (permission: GuidePermission, direction: GuideDirection) =>
  permission === 'screenRecording'
    ? direction === 'up'
      ? 'Turn on the app above, or drag this row up if missing'
      : 'Turn on the app below, or drag this row down if missing'
    : direction === 'up'
      ? 'Drag this row up into this list'
      : 'Drag this row down into this list';

/** PermissionGuideAppRow: icon 30 (r7) + name 14 semibold, white @ 10% fill, 1pt white @ 15% stroke, r10. */
export const PermissionGuideAppRow: React.FC<{appIcon: string; appName?: string; width: number; height: number}> = ({appIcon, appName = 'muesli', width, height}) => (
  <div
    style={{
      width,
      height,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 14px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.10)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
    }}
  >
    <img src={appIcon} style={{width: 30, height: 30, borderRadius: 7, flex: 'none'}} />
    <span style={{...font(14, 'semibold'), color: 'rgba(255,255,255,0.94)'}}>{appName}</span>
  </div>
);

export interface PermissionDragGuideProps {
  permission: GuidePermission;
  direction: GuideDirection;
  appIcon: string;
  appName?: string;
  /** After a likely drop into the permission list: the compact "Turn muesli on" card. */
  dropped?: boolean;
  /** Arrow bob, 0…1 (easeInOut 0.72 s, autoreverses): drive with time. */
  arrowPhase?: number;
  /** The row is being dragged away (AppKit keeps the source; the drag image follows the pointer). */
  dragging?: boolean;
}

/**
 * The guide panel at its frame size (guide 128 tall, or the post-drop card 56 tall). Background
 * rgb(0.10, 0.12, 0.14) @ 0.91, radius 18 (14 after a drop), 1pt white @ 10% stroke, soft shadow.
 */
export const PermissionDragGuide: React.FC<PermissionDragGuideProps & {width: number}> = ({permission, direction, appIcon, appName = 'muesli', dropped = false, arrowPhase = 0, width}) => {
  const {colors} = useMuesliTheme();
  const r = dropped ? 14 : 18;
  const shell: React.CSSProperties = {
    width,
    height: dropped ? 56 : 128,
    boxSizing: 'border-box',
    borderRadius: r,
    background: 'rgba(26,31,36,0.91)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), 0 4px 10px rgba(0,0,0,0.10)',
    position: 'relative',
  };
  if (dropped) {
    return (
      <div style={{...shell, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px'}}>
        <Symbol name="hand.tap.fill" size={20} weight="semibold" color={colors.accent} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 1}}>
          <span style={{...font(14, 'semibold'), color: 'rgba(255,255,255,0.94)'}}>Turn {appName} on</span>
          <span style={{...type.captionMedium, color: 'rgba(255,255,255,0.62)'}}>If it appears above, turn on its switch</span>
        </div>
      </div>
    );
  }
  // arrowOffset: displaced 4, resting −1; up → negative.
  const bob = -1 + 5 * (0.5 - 0.5 * Math.cos(Math.PI * 2 * arrowPhase));
  const offset = direction === 'up' ? -bob : bob;
  return (
    <div style={shell}>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, paddingTop: 14}}>
        <span style={{display: 'flex', transform: `translateY(${offset}px)`}}>
          <Symbol name={direction === 'up' ? 'arrow.up' : 'arrow.down'} size={13} weight="bold" color={colors.accent} />
        </span>
        <span style={{...font(12, 'semibold'), color: 'rgba(255,255,255,0.72)'}}>{guideInstruction(permission, direction)}</span>
      </div>
      {/* AccessibilityPermissionDragRowView: the row, padding 7, dashed accent outline (2pt, 7/5), r16. */}
      <div style={{position: 'absolute', left: 12, bottom: 12, width: width - 24, height: 70, boxSizing: 'border-box', padding: 7, borderRadius: 16, border: `2px dashed ${colors.accent}`}}>
        <PermissionGuideAppRow appIcon={appIcon} appName={appName} width={width - 24 - 18} height={70 - 18} />
      </div>
    </div>
  );
};
