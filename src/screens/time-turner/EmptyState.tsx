// TimeTurnerEmptyState (TimeTurnerView.swift @ v0.8.6).
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type} from '../../typography';
import {Symbol} from '../../icons/Icon';

/** TimeTurnerEmptyState: 28pt symbol, title2, body; 12pt spacing; centred; 24pt padding. */
export const TimeTurnerEmptyState: React.FC<{title: string; symbol: string; detail: string}> = ({title, symbol, detail}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center'}}>
      <Symbol name={symbol} size={28} weight="regular" color={colors.textSecondary} />
      <div style={{...type.title2, color: colors.textPrimary}}>{title}</div>
      <div style={{...type.body, color: colors.textSecondary}}>{detail}</div>
    </div>
  );
};

