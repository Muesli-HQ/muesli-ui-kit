// Recap and to-do popovers/menus @ v0.8.6:
//  - RecapSourceSettings (TimeTurnerRecapView.swift): the `square.stack` "Recap sources" popover, "Skill sources".
//  - RecapScheduleSettings (TimeTurnerTodosView.swift): the gear "Daily recap settings" popover, "Recap settings".
//  - The to-do reminder `Menu` (TimeTurnerTodosView.row): Every 12 hours / Every 24 hours / — / Off.
//  - MuesliSettingsDefinitions.swift: "recap_schedule" (Off / Previous day / Current day), "recap_schedule_hour"
//    (00:00…23:00), "recap_include_*" toggles, "recap_provider" / "recap_model" menus.
// Muesli draws the content; the NSPopover / NSMenu chrome is AppKit's (VERIFY against a macOS 26 capture).
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {systemFontStack} from '../../fonts';
import {Symbol} from '../../icons/Icon';
import {spacing} from '../../tokens/theme';
import {SettingsNote, SettingsRow} from '../settings/SettingsLayout';
import {MacPopUp, MacSwitch, SettingsDivider} from '../settings/controls';
import {PopoverSurface} from './native';

/** MuesliHistoryKind, in `allCases` order, with its `label`. */
export const RECAP_INPUTS = [
  {id: 'meetings', label: 'Meetings'},
  {id: 'dictations', label: 'Dictations'},
  {id: 'commands', label: 'Computer Use commands'},
  {id: 'quill', label: 'Quill'},
  {id: 'cotypist', label: 'Accepted Cotypist text'},
  {id: 'chat', label: 'Saved chats'},
  {id: 'vidshots', label: 'Vidshots'},
] as const;
export type RecapInputId = (typeof RECAP_INPUTS)[number]['id'];

/** "recap_schedule" choices. Switching from Off presets the hour: Current day → 18, Previous day → 8. */
export const AUTOMATIC_RECAP_CHOICES = [
  {id: 'off', label: 'Off'},
  {id: 'previous', label: 'Previous day'},
  {id: 'today', label: 'Current day'},
] as const;
export type AutomaticRecap = (typeof AUTOMATIC_RECAP_CHOICES)[number]['id'];
export const recapHourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** To-do reminder menu items (TimeTurnerTodosView.row). "Off" only once a reminder is set. */
export const reminderMenuItems = (hasReminder: boolean): NativeMenuItem[] => [
  {label: 'Every 12 hours'},
  {label: 'Every 24 hours'},
  ...(hasReminder ? [{separator: true} as NativeMenuItem, {label: 'Off'}] : []),
];

export type NativeMenuItem = {label?: string; checked?: boolean; disabled?: boolean; separator?: boolean};

/**
 * NSMenu (pull-down from a `Menu`, or the list an NSPopUpButton opens with its current item checked).
 * System font 13, 22pt rows, checkmark column, 10pt corner radius, highlighted row in the system accent. VERIFY.
 */
export const NativeMenuList: React.FC<{items: NativeMenuItem[]; highlighted?: number; width?: number; checkColumn?: boolean}> = ({
  items,
  highlighted,
  width = 180,
  checkColumn,
}) => {
  const {isDark} = useMuesliTheme();
  const showChecks = checkColumn ?? items.some((i) => i.checked);
  const fg = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  return (
    <div
      style={{
        width,
        padding: 5,
        borderRadius: 10,
        boxSizing: 'border-box',
        background: isDark ? 'rgba(40,40,42,0.97)' : 'rgba(246,246,246,0.97)',
        boxShadow: `0 0 0 0.5px ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)'}, 0 10px 30px rgba(0,0,0,${isDark ? 0.5 : 0.2})`,
        fontFamily: systemFontStack,
        fontSize: 13,
      }}
    >
      {items.map((it, i) =>
        it.separator ? (
          <div key={i} style={{height: 1, margin: '5px 10px', background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}} />
        ) : (
          <div
            key={i}
            style={{
              height: 22,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: showChecks ? '0 10px 0 6px' : '0 10px',
              borderRadius: 5,
              whiteSpace: 'nowrap',
              color: i === highlighted ? '#FFFFFF' : it.disabled ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : fg,
              background: i === highlighted ? (isDark ? '#0A84FF' : '#007AFF') : 'transparent',
            }}
          >
            {showChecks ? (
              <span style={{width: 14, display: 'inline-flex', justifyContent: 'center', flex: 'none'}}>
                {it.checked ? <Symbol name="checkmark" size={10} weight="semibold" color={i === highlighted ? '#FFFFFF' : fg} /> : null}
              </span>
            ) : null}
            {it.label}
          </div>
        ),
      )}
    </div>
  );
};

/** RecapSourceSettings: padding 20, width 360, VStack(spacing 12). */
export const RecapSourcesPopover: React.FC<{
  included: Partial<Record<RecapInputId, boolean>>;
  /** Switch being pressed (knob stretched). */
  pressed?: RecapInputId;
  /** Arrow centre from the popover's left edge; omit for no arrow. */
  arrowX?: number;
}> = ({included, pressed, arrowX}) => {
  const {colors} = useMuesliTheme();
  return (
    <PopoverSurface width={360} arrowX={arrowX}>
      <div style={{padding: 20, display: 'flex', flexDirection: 'column', gap: spacing[12]}}>
        <div style={{...font(18, 'semibold'), color: colors.textPrimary}}>Skill sources</div>
        <SettingsRow label="Time Turner" controlWidth={null}>
          <span style={{...font(12), color: colors.textSecondary, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'}}>
            <Symbol name="checkmark.circle.fill" size={12} weight="regular" color={colors.textSecondary} />
            Always included
          </span>
        </SettingsRow>
        <SettingsDivider />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {RECAP_INPUTS.map((s) => (
            <SettingsRow key={s.id} label={s.label} controlWidth={null}>
              <MacSwitch on={!!included[s.id]} pressed={pressed === s.id} />
            </SettingsRow>
          ))}
        </div>
        <SettingsNote>Used by all skills. Saved recaps change only when updated.</SettingsNote>
        <SettingsNote>Saved chats use the conversation’s update date; messages may be older.</SettingsNote>
      </div>
    </PopoverSurface>
  );
};

/** RecapScheduleSettings: padding 18, width 480, VStack(spacing 12). */
export const RecapSettingsPopover: React.FC<{
  /** "recap_provider" label; "Use meeting settings" hides the Model row and its note. */
  backend: string;
  /** "recap_model" label, e.g. "GPT-6.1 Sol (default)". */
  model?: string;
  schedule: AutomaticRecap;
  /** 0–23; shown only when the schedule is not Off. */
  hour?: number;
  arrowX?: number;
}> = ({backend, model, schedule, hour = 18, arrowX}) => {
  const {colors} = useMuesliTheme();
  const inherits = backend === 'Use meeting settings';
  return (
    <PopoverSurface width={480} arrowX={arrowX}>
      <div style={{padding: 18, display: 'flex', flexDirection: 'column', gap: spacing[12]}}>
        <div style={{...type.headline, color: colors.textPrimary}}>Recap settings</div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <SettingsRow label="Backend"><MacPopUp value={backend} /></SettingsRow>
          {!inherits && model ? <SettingsRow label="Model"><MacPopUp value={model} /></SettingsRow> : null}
        </div>
        {!inherits ? <SettingsNote>Uses your existing provider connection. Meeting and Computer Use selections stay unchanged.</SettingsNote> : null}
        <SettingsDivider />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <SettingsRow label="Automatic recap"><MacPopUp value={AUTOMATIC_RECAP_CHOICES.find((c) => c.id === schedule)!.label} /></SettingsRow>
          {schedule !== 'off' ? <SettingsRow label="Generate at"><MacPopUp value={recapHourLabel(hour)} /></SettingsRow> : null}
        </div>
        <SettingsNote>Runs while muesli is open. The notification opens your recap.</SettingsNote>
      </div>
    </PopoverSurface>
  );
};
