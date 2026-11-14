import React, {createContext, useContext, useMemo} from 'react';
import {resolveTheme, type Appearance, type MuesliTheme} from '../tokens/theme';

const ThemeContext = createContext<MuesliTheme>(resolveTheme('dark'));

/** Wrap any Muesli UI. `appearance` is dark | light | ultraDark; `accent` is a saved custom accent hex. */
export const MuesliThemeProvider: React.FC<{appearance?: Appearance; accent?: string; children: React.ReactNode}> = ({
  appearance = 'dark',
  accent,
  children,
}) => {
  const theme = useMemo(() => resolveTheme(appearance, accent), [appearance, accent]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useMuesliTheme = () => useContext(ThemeContext);
