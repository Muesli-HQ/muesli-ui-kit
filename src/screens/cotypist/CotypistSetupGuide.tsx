// CotypistSetupGuideController.swift (CotypistSetupGuideView, 300×290 panel beside System Settings) and
// PermissionGuideAppRow (AccessibilityPermissionGuideController.swift) @ v0.8.6. Forced dark scheme.
import React from 'react';
import {MuesliThemeProvider, useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {Symbol} from '../../icons/Icon';
import {font, type} from '../../typography';
import {withAlpha} from '../../tokens/theme';
import {Button, type ControlState} from '../../primitives/Button';
import {MacSpinner} from '../settings/controls';
import appIcon from './muesli-app-icon.png';

/** CotypistSetupGuideLayout.size */
export const COTYPIST_GUIDE_SIZE = {width: 300, height: 290} as const;

/** Renders "**bold**" spans the way Text(LocalizedStringKey) does (bold of the same family/size). */
const md = (s: string) =>
  s.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') ? (
      <span key={i} style={{fontWeight: 700}}>
        {part.slice(2, -2)}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

const Step: React.FC<{n: number; text: string}> = ({n, text}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 8}}>
      <div style={{width: 18, height: 18, borderRadius: 9, flex: 'none', background: withAlpha(colors.accent, 0.18), display: 'flex', alignItems: 'center', justifyContent: 'center', ...font(11, 'bold'), color: colors.accentText}}>{n}</div>
      <div style={{...font(12, 'medium'), color: 'rgba(255,255,255,0.80)', paddingTop: 1}}>{md(text)}</div>
    </div>
  );
};

/** PermissionGuideAppRow: icon 30 (radius 7), name 14 semibold, white 0.10 fill, radius 10, white 0.15 border. */
export const PermissionGuideAppRow: React.FC<{appName: string; height?: number}> = ({appName, height = 46}) => (
  <div
    style={{
      height,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 14px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.10)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
    }}
  >
    <img src={appIcon} width={30} height={30} style={{borderRadius: 7, flex: 'none'}} />
    <span style={{...font(14, 'semibold'), color: 'rgba(255,255,255,0.94)'}}>{appName}</span>
  </div>
);

export interface CotypistSetupGuideProps {
  /** CotypistSetup.displayName = "\(AppIdentity.displayName) Cotypist" (CFBundleName, default "Muesli"). VERIFY bundle name. */
  inputSourceName?: string;
  suggestsRelogin?: boolean;
  closeState?: ControlState;
  spinnerPhase?: number;
}

const GuideBody: React.FC<CotypistSetupGuideProps> = ({inputSourceName = 'Muesli Cotypist', suggestsRelogin = false, closeState = 'rest', spinnerPhase = 0}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{width: COTYPIST_GUIDE_SIZE.width, height: COTYPIST_GUIDE_SIZE.height, padding: 2, boxSizing: 'border-box'}}>
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          borderRadius: 18,
          background: 'rgba(26,31,36,0.94)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), 0 4px 12px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center'}}>
          <span style={{...font(14, 'semibold'), color: 'rgba(255,255,255,0.94)', flex: 1}}>Turn on Cotypist</span>
          <Button kind="quiet" state={closeState} style={{width: 28, height: 28}}>
            <Symbol name="xmark" size={10} weight="bold" color="rgba(255,255,255,0.55)" />
          </Button>
        </div>
        <Step n={1} text="Next to **Input Sources**, click **Edit…**" />
        <Step n={2} text="Click **+** at the bottom left, then **English**" />
        <div style={{...type.captionMedium, color: 'rgba(255,255,255,0.55)', paddingLeft: 26, marginTop: -6}}>List empty? Click another language, then English again.</div>
        <Step n={3} text="Choose this, then click **Add**:" />
        <div style={{position: 'relative', flex: 'none'}}>
          <PermissionGuideAppRow appName={inputSourceName} />
          {/* stroke(MuesliTheme.accent, lineWidth 1.5, dash [6, 4]) on a radius-10 rounded rect (centred stroke) */}
          {/* Row is 300 − 2×2 − 2×16 = 264 wide, 46 tall. */}
          <svg style={{position: 'absolute', left: -1, top: -1, overflow: 'visible'}} width={266} height={48} aria-hidden>
            <rect x={1} y={1} width={264} height={46} rx={10} fill="none" stroke={colors.accent} strokeWidth={1.5} strokeDasharray="6 4" />
          </svg>
        </div>
        {suggestsRelogin ? (
          <div style={{...type.captionMedium, color: colors.accentText}}>
            Not in the list? macOS lists new input sources after you log out and back in. Then turn Cotypist on again.
          </div>
        ) : (
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <MacSpinner size={16} color="#FFFFFF" phase={spinnerPhase} />
            <span style={{...type.captionMedium, color: 'rgba(255,255,255,0.55)'}}>Cotypist turns on as soon as it's added</span>
          </div>
        )}
      </div>
    </div>
  );
};

/** The floating guide. `.preferredColorScheme(.dark)`: accent/accentText resolve for the dark appearance. */
export const CotypistSetupGuide: React.FC<CotypistSetupGuideProps & {accent?: string}> = ({accent, ...p}) => (
  <MuesliThemeProvider appearance="dark" accent={accent}>
    <GuideBody {...p} />
  </MuesliThemeProvider>
);
