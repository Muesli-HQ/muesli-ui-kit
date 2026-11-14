// MemoryImageView (TimeTurnerView.swift @ v0.8.6) and TargetApplicationIconView (TargetApplicationIconView.swift).
// The screenshot is drawn `.resizable().scaledToFit()`; the app icon is the app's real icon or an
// `app.dashed` fallback on surfacePrimary with radius size × 0.22.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {Symbol} from '../../icons/Icon';
import {type} from '../../typography';
import type {TimeTurnerApp, TimeTurnerCapture} from './model';

/** Scaled-to-fit screenshot. `expired` / `unavailable` reproduce the compact fallbacks. */
export const CaptureImage: React.FC<{
  capture?: TimeTurnerCapture;
  compact?: boolean;
  expired?: boolean;
  style?: React.CSSProperties;
}> = ({capture, compact = false, expired = false, style}) => {
  const {colors} = useMuesliTheme();
  const box: React.CSSProperties = {width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', ...style};
  if (!capture || (compact && expired)) {
    return (
      <div style={box}>
        <div style={{...type.caption, color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 4, textAlign: 'center'}}>
          <Symbol name="photo" size={12} weight="regular" color={colors.textSecondary} />
          {expired ? 'Screenshot expired' : 'Preview unavailable'}
        </div>
      </div>
    );
  }
  if (typeof capture.image === 'string') {
    return (
      <div style={box}>
        <img src={capture.image} style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block'}} />
      </div>
    );
  }
  return <div style={box}>{capture.image}</div>;
};

export const AppIcon: React.FC<{app: TimeTurnerApp; size: number}> = ({app, size}) => {
  const {colors} = useMuesliTheme();
  if (app.icon) return <div style={{width: size, height: size, flex: 'none', display: 'flex'}}>{app.icon}</div>;
  const inset = size * 0.13;
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: size * 0.22,
        background: colors.surfacePrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Symbol name="app.dashed" size={(size - inset * 2) / 1.15625} weight="regular" color={colors.textTertiary} />
    </div>
  );
};
