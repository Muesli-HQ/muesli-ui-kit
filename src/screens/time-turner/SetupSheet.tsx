// TimeTurnerSetupView (TimeTurnerSettingsView.swift @ v0.8.6): the 560×490 enabling sheet opened by
// "Set up Time Turner". Padding 28, VStack(alignment: .leading, spacing: 20); three steps.
// Sheet chrome (window background, radius, shadow) is system-drawn: VERIFY.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {Symbol, TimeTurnerIcon} from '../../icons/Icon';
import {LinearProgress, NativeButton, PopUpPicker, envFont, useLabelColors, type NativeState} from './native';

export interface TimeTurnerSetupProps {
  /** 0 introduction · 1 permissions · 2 storage */
  step: 0 | 1 | 2;
  screenRecordingGranted?: boolean;
  accessibilityGranted?: boolean;
  /** Already enabled → last button reads "Finish". */
  enabled?: boolean;
  /** Storage step values (MuesliSettingsDefinitions choices). */
  interval?: string;
  budget?: string;
  screenshotRetention?: string;
  historyRetention?: string;
  primaryButtonState?: NativeState;
  error?: string;
}

/** System sheet surface. VERIFY colour + radius on macOS 26. */
export const SheetSurface: React.FC<{width: number; height: number; children: React.ReactNode}> = ({width, height, children}) => {
  const {isDark, appearance} = useMuesliTheme();
  const bg = appearance === 'ultraDark' ? '#0A0A0A' : isDark ? '#232427' : '#F2F2F4';
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 18,
        background: bg,
        boxShadow: isDark
          ? 'inset 0 0 0 0.5px rgba(255,255,255,0.14), 0 20px 50px rgba(0,0,0,0.5)'
          : 'inset 0 0 0 0.5px rgba(0,0,0,0.1), 0 20px 50px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        flex: 'none',
      }}
    >
      {children}
    </div>
  );
};

export const TimeTurnerSetupSheet: React.FC<TimeTurnerSetupProps> = ({
  step,
  screenRecordingGranted = false,
  accessibilityGranted = false,
  enabled = false,
  interval = '10 seconds',
  budget = '10 GB',
  screenshotRetention = '7 days',
  historyRetention = '30 days',
  primaryButtonState = 'rest',
  error,
}) => {
  const {colors, isDark} = useMuesliTheme();
  const label = useLabelColors();
  const ready = screenRecordingGranted && accessibilityGranted;
  const bulletIcon = (name: string, text: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <span style={{width: 20, display: 'inline-flex', justifyContent: 'center'}}>
        <Symbol name={name} size={14} weight="regular" color={label.primary} />
      </span>
      {text}
    </div>
  );
  const permissionRow = (name: string, detail: string, granted: boolean) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}}>
      <Symbol name={granted ? 'checkmark.circle.fill' : 'circle'} size={14} weight="regular" color={granted ? '#30D158' : label.secondary} />
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <span style={font(14, 'bold')}>{name}</span>
        <span style={{...type.caption, color: label.secondary}}>{detail}</span>
      </div>
      <span style={{flex: 1}} />
      {granted ? <span style={type.caption}>Allowed</span> : <NativeButton>Allow…</NativeButton>}
    </div>
  );
  const settingsRow = (text: string, value: string) => (
    // SettingsRow: label column | control (controlWidth 275, trailing), firstLineHeight 28, vertical padding 4.
    <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '4px 0', minHeight: 28}}>
      <span style={{flex: 1, ...type.body, color: colors.textPrimary}}>{text}</span>
      <div style={{width: 275, display: 'flex', justifyContent: 'flex-end'}}>
        <PopUpPicker value={value} />
      </div>
    </div>
  );
  return (
    <SheetSurface width={560} height={490}>
      <div style={{padding: 28, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20, ...envFont, color: label.primary}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 8, ...font(20, 'bold')}}>
            <TimeTurnerIcon color={label.primary} />
            Time Turner
          </span>
          <span style={{flex: 1}} />
          <span style={{...type.caption, color: label.secondary}}>{step + 1} of 3</span>
        </div>
        <LinearProgress value={(step + 1) / 3} />
        {step === 0 ? (
          <>
            <div style={font(32, 'bold')}>Your first turn through time</div>
            <div style={{...type.title3, color: label.secondary}}>Find the page, conversation or idea you saw earlier—without remembering where it was.</div>
            {bulletIcon('macwindow', 'Snapshots of your focused window, with searchable text')}
            {bulletIcon('internaldrive', 'Stored on this Mac, with a storage limit')}
            {bulletIcon('hand.raised', 'Pause anytime and choose apps to exclude')}
            <div style={{...type.callout, color: label.secondary}}>
              This enables ongoing screen history, separate from dictation context or meeting recordings. Nothing is captured until you choose Start Time Turner.
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div style={font(26, 'bold')}>{ready ? "You're already set" : 'A couple of permissions'}</div>
            <div style={{color: label.secondary}}>
              {ready
                ? 'Muesli already has the permissions Time Turner needs. No need to grant them again.'
                : "Allow the missing permissions below, then return here. We'll check again automatically."}
            </div>
            {permissionRow('Screen Recording', 'Save an image of the focused window.', screenRecordingGranted)}
            {permissionRow('Accessibility', 'Identify the focused window and help detect secure fields.', accessibilityGranted)}
            <div style={{display: 'flex'}}>
              <NativeButton>Check again</NativeButton>
              <span style={{flex: 1}} />
              <NativeButton>Manage permissions</NativeButton>
            </div>
          </>
        ) : (
          <>
            <div style={font(26, 'bold')}>Make room for your day</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              {settingsRow('Check screen every', interval)}
              {settingsRow('Screenshot storage budget', budget)}
              {settingsRow('Keep screenshots for', screenshotRetention)}
              {settingsRow('Keep searchable history for', historyRetention)}
            </div>
            <div style={{...type.caption, color: colors.textSecondary}}>Searchable text can outlive screenshots. Retention continues while paused.</div>
            <div style={{...type.caption, color: colors.textSecondary}}>Pause before viewing sensitive content. Agents you authorize can read saved history.</div>
            {!ready ? <div style={{color: '#FF9F0A'}}>A required permission is missing. Go back to review permissions.</div> : null}
          </>
        )}
        {error ? <div style={{...type.caption, color: '#FF453A'}}>{error}</div> : null}
        <span style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <NativeButton>Not now</NativeButton>
          {step > 0 ? <NativeButton>Back</NativeButton> : null}
          <span style={{flex: 1}} />
          {step < 2 ? (
            <NativeButton prominent state={step === 1 && !ready ? 'disabled' : primaryButtonState}>Continue</NativeButton>
          ) : (
            <NativeButton prominent state={!ready ? 'disabled' : primaryButtonState}>{enabled ? 'Finish' : 'Start Time Turner'}</NativeButton>
          )}
        </div>
      </div>
    </SheetSurface>
  );
};
