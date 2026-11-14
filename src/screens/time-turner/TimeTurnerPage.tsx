// TimeTurnerPage (TimeTurnerPage.swift @ v0.8.6) + TimeTurnerControls(standalone: true) (TimeTurnerView.swift)
// + RecordingPauseButton / RecordingControlLabel (RecordingPauseButton.swift).
// ScrollView › VStack(alignment: .leading, spacing: 18) › padding(pageInset 32).
// Header uses ViewThatFits: the one-row layout needs minWidth 1050, so in the default 1120×790
// window (detail 879pt) the stacked fallback is what the app shows: title, controls, centred day controls.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {layout} from '../../tokens/theme';
import {CONTROL_SYMBOL_SIZE, NativeButton, NativeDivider, NativeSymbol, envFont, useLabelColors, type NativeState} from './native';
import {MemoryExplorer, type MemoryExplorerProps} from './MemoryExplorer';
import {TimeTurnerRecapView, type TimeTurnerRecapProps} from './RecapView';
import {TimeTurnerTodosView, type TimeTurnerTodosProps} from './TodosView';

export type TimeTurnerSection = 'history' | 'recap' | 'todos';

export interface TimeTurnerControlsProps {
  /** appState.config.timeTurnerEnabled — off by default. */
  enabled: boolean;
  /** memory.ambientPaused */
  paused?: boolean;
  /** memory.ambientStatus: "Off", "On · this Mac", "On · screen unchanged", "Paused", "Skipping this app"… */
  status?: string;
  /** memory.ambientMissingPermission != nil → "Review access…" */
  missingPermission?: boolean;
  pauseButtonState?: ControlState;
  setupButtonState?: NativeState;
}

/** RecordingPauseButton: MuesliButtonStyle .secondary (Pause) / .primary (Resume). */
export const RecordingPauseButton: React.FC<{paused: boolean; state?: ControlState}> = ({paused, state = 'rest'}) => {
  const {colors} = useMuesliTheme();
  const fg = paused ? colors.onAccent : colors.textPrimary;
  return (
    <Button kind={paused ? 'primary' : 'secondary'} state={state}>
      <div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', whiteSpace: 'nowrap'}}>
        <Symbol name={paused ? 'play.fill' : 'pause.fill'} size={10} weight="semibold" color={fg} />
        <span style={{...font(12, 'semibold'), color: fg}}>{paused ? 'Resume' : 'Pause'}</span>
      </div>
    </Button>
  );
};

/** TimeTurnerControls(standalone: true): HStack (default spacing 8), no padding/background. */
export const TimeTurnerControls: React.FC<TimeTurnerControlsProps> = ({
  enabled,
  paused = false,
  status,
  missingPermission = false,
  pauseButtonState,
  setupButtonState,
}) => {
  const label = useLabelColors();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, ...envFont, color: label.primary}}>
      {missingPermission ? <NativeButton>Review access…</NativeButton> : null}
      <span style={{...type.caption, color: label.secondary, whiteSpace: 'nowrap'}}>{status ?? (enabled ? (paused ? 'Paused' : 'On · this Mac') : 'Off')}</span>
      {enabled ? <RecordingPauseButton paused={paused} state={pauseButtonState} /> : null}
      {!enabled ? <NativeButton state={setupButtonState}>Set up Time Turner</NativeButton> : null}
      <NativeButton iconOnly>
        <NativeSymbol name="gearshape" size={CONTROL_SYMBOL_SIZE} color={label.primary} />
      </NativeButton>
    </div>
  );
};

/** dayControls: HStack(spacing: 10) ‹ [day label + calendar, 160pt wide] › */
export const TimeTurnerDayControls: React.FC<{dayLabel: string; canGoBack?: boolean; isToday?: boolean}> = ({dayLabel, canGoBack = true, isToday = false}) => {
  const label = useLabelColors();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, flex: 'none'}}>
      <NativeButton iconOnly state={canGoBack ? 'rest' : 'disabled'}>
        <NativeSymbol name="chevron.left" size={CONTROL_SYMBOL_SIZE} color={label.primary} />
      </NativeButton>
      <NativeButton>
        <div style={{width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...type.body, color: 'inherit'}}>
          {dayLabel}
          {/* inside the label's explicit .font(MuesliTheme.body()) → 14pt (measured box matches) */}
          <NativeSymbol name="calendar" size={14} color={label.primary} />
        </div>
      </NativeButton>
      <NativeButton iconOnly state={isToday ? 'disabled' : 'rest'}>
        <NativeSymbol name="chevron.right" size={CONTROL_SYMBOL_SIZE} color={label.primary} />
      </NativeButton>
    </div>
  );
};

const Tab: React.FC<{title: string; selected: boolean}> = ({title, selected}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{position: 'relative', padding: '10px 0', ...font(14, selected ? 'semibold' : 'medium'), color: selected ? colors.textPrimary : colors.textSecondary}}>
      {title}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: selected ? colors.accent : 'transparent'}} />
    </div>
  );
};

export interface TimeTurnerPageProps {
  section: TimeTurnerSection;
  controls: TimeTurnerControlsProps;
  /** appState.timeTurnerDay formatted `.dateTime.day().month(.abbreviated).year()` → "6 Nov 2026". */
  dayLabel: string;
  canGoBack?: boolean;
  isToday?: boolean;
  /** Detail-pane width (window width − sidebar − divider). Default: 1120 − 240 − 1. */
  width?: number;
  /** Force the one-row header (ViewThatFits picks it only when ≥ 1050pt fit). Default: by width. */
  headerLayout?: 'auto' | 'row' | 'stacked';
  /** Vertical scroll offset of the page (ScrollView), for videos. */
  scrollY?: number;
  history?: Omit<MemoryExplorerProps, 'mode' | 'width' | 'dayLabel'>;
  recap?: TimeTurnerRecapProps;
  todos?: TimeTurnerTodosProps;
}

export const TimeTurnerPage: React.FC<TimeTurnerPageProps> = ({
  section,
  controls,
  dayLabel,
  canGoBack,
  isToday,
  width = layout.windowWidth - layout.sidebarWidth - 1,
  headerLayout = 'auto',
  scrollY = 0,
  history,
  recap,
  todos,
}) => {
  const {colors} = useMuesliTheme();
  const label = useLabelColors();
  const inset = layout.pageInset;
  const contentWidth = width - inset * 2;
  const row = headerLayout === 'row' || (headerLayout === 'auto' && contentWidth >= 1050);
  const title = <div style={{...type.title1, color: label.primary, whiteSpace: 'nowrap'}}>Time Turner</div>;
  const day = section !== 'todos' ? <TimeTurnerDayControls dayLabel={dayLabel} canGoBack={canGoBack} isToday={isToday} /> : null;

  return (
    <div style={{width: '100%', height: '100%', overflow: 'hidden', position: 'relative'}}>
      <div
        style={{
          padding: inset,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 18,
          transform: scrollY ? `translateY(${-scrollY}px)` : undefined,
          ...envFont,
          color: label.primary,
        }}
      >
        {row ? (
          <div style={{position: 'relative', width: '100%', display: 'flex', alignItems: 'center'}}>
            {title}
            <span style={{flex: 1, minWidth: 20}} />
            <TimeTurnerControls {...controls} />
            {day ? <div style={{position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>{day}</div> : null}
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, width: '100%'}}>
            {title}
            <TimeTurnerControls {...controls} />
            {day ? <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>{day}</div> : null}
          </div>
        )}
        <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
          <div style={{display: 'flex', gap: 24}}>
            <Tab title="History" selected={section === 'history'} />
            <Tab title="Recap" selected={section === 'recap'} />
            <Tab title="To-dos" selected={section === 'todos'} />
          </div>
          {/* Divider().overlay(surfaceBorder): measured #3C3D3F in dark (see NativeDivider). */}
          <NativeDivider overlay={colors.surfaceBorder} />
        </div>
        {section === 'todos' && todos ? (
          <div style={{width: '100%', maxWidth: 820}}>
            <TimeTurnerTodosView {...todos} />
          </div>
        ) : section === 'recap' && recap ? (
          <div style={{width: '100%', maxWidth: 820}}>
            <TimeTurnerRecapView {...recap} />
          </div>
        ) : section === 'history' && history ? (
          <MemoryExplorer {...history} mode="inline" width={contentWidth} dayLabel={dayLabel} />
        ) : null}
      </div>
    </div>
  );
};
