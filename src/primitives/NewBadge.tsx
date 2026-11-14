// NewFeatureBadge.swift @ v0.8.6: "New" in 11pt semibold white on the accent's badge fill, capsule.
import React from 'react';
import {useMuesliTheme} from '../theme/MuesliThemeProvider';
import {font} from '../typography';

export const NewBadge: React.FC<{label?: string}> = ({label = 'New'}) => {
  const {colors} = useMuesliTheme();
  return (
    <span style={{...font(11, 'semibold'), color: '#FFFFFF', background: colors.badgeFill, borderRadius: 9999, padding: '1px 5px', flex: 'none', whiteSpace: 'nowrap'}}>
      {label}
    </span>
  );
};
