// MuesliFloatingGlassButtonStyle (MuesliControlStyles.swift @ v0.8.6). On macOS 26 the app uses
// `.glassEffect(.regular.interactive())`; Ultra Dark falls back to the raised button style.
// Dark measured from MuesliDev on macOS 26.6 over backgroundDeep: a flat #161718 disc (white ≈4.5%),
// no visible rim or shadow at rest. Light and pressed values remain VERIFY.
import React from 'react';
import {useMuesliTheme} from '../theme/MuesliThemeProvider';
import {Button, type ControlState} from './Button';

export const GlassCircleButton: React.FC<{size: number; state?: ControlState; children: React.ReactNode}> = ({size, state = 'rest', children}) => {
  const t = useMuesliTheme();
  if (t.appearance === 'ultraDark') {
    return (
      <Button kind="raised" state={state} shape={{kind: 'circle'}} style={{width: size, height: size}}>
        {children}
      </Button>
    );
  }
  const dark = t.isDark;
  const pressed = state === 'pressed';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: dark
          ? `rgba(255,255,255,${pressed ? 0.11 : 0.045})`
          : `rgba(255,255,255,${pressed ? 0.55 : 0.7})`,
        boxShadow: dark
          ? 'none'
          : 'inset 0 0.5px 0 rgba(255,255,255,0.9), inset 0 0 0 0.5px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.10)',
      }}
    >
      {children}
    </div>
  );
};
