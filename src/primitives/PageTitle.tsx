// PageTitle (MuesliTheme.swift @ v0.8.6): title1 (26 bold), textPrimary, full width, leading.
import React from 'react';
import {useMuesliTheme} from '../theme/MuesliThemeProvider';
import {type} from '../typography';

export const PageTitle: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {colors} = useMuesliTheme();
  return <div style={{...type.title1, color: colors.textPrimary, width: '100%', textAlign: 'left'}}>{children}</div>;
};
