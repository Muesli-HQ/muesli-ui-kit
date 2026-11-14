// Loads Nunito Sans before Remotion captures a frame.
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {loadMuesliFonts, MuesliThemeProvider, type Appearance} from '../../src';

/** `accent`: a saved custom accent (e.g. '#3662E3', the reference MuesliDev's); omit for the default. */
export const KitFrame: React.FC<{appearance?: Appearance; accent?: string; background?: string; children: React.ReactNode}> = ({appearance = 'dark', accent, background = 'transparent', children}) => {
  const [handle] = useState(() => delayRender('Nunito Sans'));
  useEffect(() => {
    loadMuesliFonts().then(() => continueRender(handle));
  }, [handle]);
  return (
    <MuesliThemeProvider appearance={appearance} accent={accent}>
      <div style={{width: '100%', height: '100%', background}}>{children}</div>
    </MuesliThemeProvider>
  );
};
