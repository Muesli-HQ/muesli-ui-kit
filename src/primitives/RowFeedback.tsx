// SidebarRowFeedback (SidebarView.swift @ v0.8.6): selected → surfaceSelected; hover/press → backgroundHover;
// press adds textPrimary @ 4%; focus draws a 2pt accentText ring. Radius cornerSmall (6).
import React from 'react';
import {useMuesliTheme} from '../theme/MuesliThemeProvider';
import {radius} from '../tokens/theme';

export type RowState = 'rest' | 'hover' | 'pressed' | 'focused';

export const RowFeedback: React.FC<{selected?: boolean; state?: RowState; style?: React.CSSProperties; children: React.ReactNode}> = ({
  selected = false,
  state = 'rest',
  style,
  children,
}) => {
  const {colors} = useMuesliTheme();
  const fill = selected ? colors.surfaceSelected : state === 'hover' || state === 'pressed' ? colors.backgroundHover : 'transparent';
  const pressOverlay = state === 'pressed' ? colors.textPrimary.replace(/,[\d.]+\)$/, ',0.04)') : null;
  return (
    <div
      style={{
        borderRadius: radius.small,
        background: pressOverlay ? `linear-gradient(${pressOverlay}, ${pressOverlay}), ${fill}` : fill,
        boxShadow: state === 'focused' ? `inset 0 0 0 2px ${colors.accentText}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
