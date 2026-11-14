// DashboardRootView / DashboardContentLayout @ v0.8.6: HSplitView { sidebar (240 / 68) | detail on backgroundBase }.
import React from 'react';
import {useMuesliTheme} from '../theme/MuesliThemeProvider';
import {MacWindow} from '../chrome/MacWindow';
import {Sidebar, type SidebarProps} from './Sidebar';
import {ButtonTint} from '../screens/time-turner/native';

/** NSSplitView thin divider. Measured in dark: 1pt #000000 at x = 240. Light VERIFY. */
const Divider: React.FC = () => {
  const {isDark} = useMuesliTheme();
  return <div style={{width: 1, flex: 'none', background: isDark ? '#000000' : 'rgba(0,0,0,0.1)'}} />;
};

/** `focused` = the window is key: macOS draws `.tint`ed bordered buttons in the tint only then; an inactive window's
 *  buttons fall back to the grey fill + label colour (owner's 2026-11-13 captures: Recap inactive, To-dos/History key). */
export const DashboardContent: React.FC<{sidebar: SidebarProps; focused?: boolean; children?: React.ReactNode}> = ({sidebar, focused = true, children}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', width: '100%', height: '100%'}}>
      <Sidebar {...sidebar} />
      <Divider />
      {/* DashboardRootView applies `.tint(MuesliTheme.accent)` to everything below it. */}
      <div style={{flex: 1, minWidth: 0, height: '100%', background: colors.backgroundBase, position: 'relative', overflow: 'hidden'}}>
        {focused ? <ButtonTint>{children}</ButtonTint> : children}
      </div>
    </div>
  );
};

/** The full dashboard window: macOS chrome + sidebar + a detail page. */
export const DashboardWindow: React.FC<{sidebar: SidebarProps; focused?: boolean; shadow?: boolean; children?: React.ReactNode}> = ({
  sidebar,
  focused,
  shadow,
  children,
}) => (
  <MacWindow focused={focused} shadow={shadow}>
    <DashboardContent sidebar={sidebar} focused={focused !== false}>{children}</DashboardContent>
  </MacWindow>
);
