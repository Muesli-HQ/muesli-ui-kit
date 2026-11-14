import React from 'react';
import {Button, type ButtonKind, type ControlState, NewBadge, type as T, useMuesliTheme, Symbol, AppearanceSwitcher} from '../../src';

const kinds: ButtonKind[] = ['primary', 'secondary', 'raised', 'tinted', 'success', 'recording', 'destructive', 'destructiveTinted', 'quiet'];
const states: ControlState[] = ['rest', 'highlighted', 'pressed', 'disabled'];

export const Controls: React.FC = () => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{background: colors.backgroundBase, color: colors.textPrimary, width: '100%', height: '100%', padding: 24, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10}}>
      {kinds.map((k) => (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{...T.caption, color: colors.textTertiary, width: 120}}>{k}</span>
          {states.map((s) => (
            <Button key={s} kind={k} state={s}>
              <span style={{...T.callout, fontWeight: 600, padding: '6px 14px'}}>{s}</span>
            </Button>
          ))}
        </div>
      ))}
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8}}>
        <NewBadge />
        <AppearanceSwitcher choice="dark" />
        <Symbol name="cpu" size={14} color={colors.accentText} />
        <span style={{...T.headline, color: colors.textPrimary}}>Headline 15 semibold</span>
        <span style={{...T.body, color: colors.textSecondary}}>Body 14</span>
      </div>
    </div>
  );
};
