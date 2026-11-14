// The dashboard window (RecentHistoryWindowController @ v0.8.6): titled, .fullSizeContentView,
// opaque titlebar with hidden title. Chrome measured from a MuesliDev capture on macOS 26.6
// (ui-kit/references/muesli-dev-2026-11-09/dark/01-timeline.png): the 1120×790 frame includes a
// 32pt titlebar, so SwiftUI content is 1120×758.
import React from 'react';
import {useMuesliTheme} from '../theme/MuesliThemeProvider';
import {layout} from '../tokens/theme';

export const MAC_CHROME = {
  /** Measured: 16pt (alpha ramp starts 26px in at 2×). */
  cornerRadius: 16,
  /** Measured: 32pt, inside the 790pt frame. */
  titlebarHeight: 32,
  /** Measured: 14pt buttons, centres at x = 16 / 39 / 62, y = 16. */
  trafficDiameter: 14,
  trafficSpacing: 23,
  trafficInsetX: 16,
  trafficInsetY: 16,
  /** Measured titlebar fill (system, not a Muesli token). Light value VERIFY (no light capture yet). */
  titlebarDark: '#1E1E1E',
  titlebarLight: '#F0F0F0',
  /** Measured unfocused traffic-light fill in dark. */
  trafficInactiveDark: '#414141',
} as const;

const TRAFFIC = {close: '#FF5F57', minimize: '#FEBC2E', zoom: '#28C840'} as const;

export const TrafficLights: React.FC<{focused?: boolean}> = ({focused = true}) => {
  const {isDark} = useMuesliTheme();
  const inactive = isDark ? MAC_CHROME.trafficInactiveDark : 'rgba(0,0,0,0.14)'; // light VERIFY
  const c = MAC_CHROME;
  return (
    <>
      {(['close', 'minimize', 'zoom'] as const).map((k, i) => (
        <span
          key={k}
          style={{
            position: 'absolute',
            left: c.trafficInsetX + i * c.trafficSpacing - c.trafficDiameter / 2,
            top: c.trafficInsetY - c.trafficDiameter / 2,
            width: c.trafficDiameter,
            height: c.trafficDiameter,
            borderRadius: '50%',
            background: focused ? TRAFFIC[k] : inactive,
            boxShadow: focused ? 'inset 0 0 0 0.5px rgba(0,0,0,0.18)' : undefined,
          }}
        />
      ))}
    </>
  );
};

export const MacWindow: React.FC<{
  width?: number;
  /** Full frame height including the titlebar (app default 790). */
  height?: number;
  focused?: boolean;
  /** Drop shadow for compositing onto a desktop; off for 1:1 reference comparison. */
  shadow?: boolean;
  children: React.ReactNode;
}> = ({width = layout.windowWidth, height = layout.windowHeight, focused = true, shadow = true, children}) => {
  const {colors, isDark} = useMuesliTheme();
  const c = MAC_CHROME;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: c.cornerRadius,
        overflow: 'hidden',
        background: isDark ? c.titlebarDark : c.titlebarLight,
        boxShadow: [
          // measured: a 1px lighter rim along the top edge in dark
          isDark ? 'inset 0 0.5px 0 rgba(255,255,255,0.18), inset 0 0 0 0.5px rgba(255,255,255,0.08)' : 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
          shadow ? '0 22px 70px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(0,0,0,0.5)' : '',
        ].filter(Boolean).join(', '),
        isolation: 'isolate',
      }}
    >
      <div style={{position: 'absolute', inset: `${c.titlebarHeight}px 0 0 0`, display: 'flex', background: colors.backgroundDeep}}>{children}</div>
      <TrafficLights focused={focused} />
    </div>
  );
};
