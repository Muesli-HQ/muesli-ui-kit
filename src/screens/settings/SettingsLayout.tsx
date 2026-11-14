// SettingsRowLayout.swift (SettingsLayout, SettingsSectionHeading, SettingsNote, SettingsRow) and the
// SettingsView.swift helpers settingsSection / compactActionButton / accentActionButton / actionButton @ v0.8.6.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {type, font} from '../../typography';
import {spacing, radius} from '../../tokens/theme';
import {Symbol, TimeTurnerIcon, VidshotIcon} from '../../icons/Icon';
import {NewBadge} from '../../primitives/NewBadge';
import {Button, type ControlState} from '../../primitives/Button';

export const SettingsLayout = {controlWidth: 275, firstLineHeight: 28, columnSpacing: 20, stackedContentWidth: 540} as const;

/** assets/quill-icon.svg (QuillIcon.image(), template). */
export const QuillGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{flex: 'none', display: 'block'}} aria-hidden>
    <g fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 57C14 42 20 29 30 19C38 11 47 7 58 6C56 18 51 29 42 38C34 46 24 50 13 50" />
      <path d="M8 58C20 43 33 31 51 15" />
      <path d="M21 43L20 30" />
      <path d="M30 34L29 21" />
      <path d="M39 26L50 25" />
      <path d="M30 36L42 36" />
    </g>
  </svg>
);

export type SectionIcon = 'vidshot' | 'timeTurner' | 'quill';

/** SettingsSectionHeading: 12×12 template icon, sectionHeading uppercase, optional New badge; textSecondary, leading 2. */
export const SettingsSectionHeading: React.FC<{title: string; icon?: SectionIcon; newBadge?: boolean}> = ({title, icon, newBadge}) => {
  const {colors} = useMuesliTheme();
  const c = colors.textSecondary;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 2, color: c}}>
      {icon === 'vidshot' ? <VidshotIcon size={12} color={c} /> : icon === 'timeTurner' ? <TimeTurnerIcon size={12} color={c} /> : icon === 'quill' ? <QuillGlyph size={12} color={c} /> : null}
      <span style={{...type.sectionHeading, textTransform: 'uppercase'}}>{title}</span>
      {newBadge ? <NewBadge /> : null}
    </div>
  );
};

/** SettingsNote: caption (helper) or captionMedium (warning/error); wraps. */
export const SettingsNote: React.FC<{children: React.ReactNode; tone?: 'helper' | 'warning' | 'error'; style?: React.CSSProperties}> = ({children, tone = 'helper', style}) => {
  const {colors} = useMuesliTheme();
  const color = tone === 'helper' ? colors.textSecondary : tone === 'warning' ? colors.warningText : colors.destructiveText;
  return <div style={{...(tone === 'helper' ? type.caption : type.captionMedium), color, width: '100%', ...style}}>{children}</div>;
};

/**
 * SettingsRow: label column (body, min 28pt first line) + control. `controlWidth` null = compact (switches,
 * small buttons: intrinsic width); a number = bounded trailing column (menus, fields). Padding vertical 4.
 */
export const SettingsRow: React.FC<{
  label: string;
  description?: React.ReactNode;
  controlWidth?: number | null;
  newBadge?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({label, description, controlWidth = SettingsLayout.controlWidth, newBadge, children, style}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: SettingsLayout.columnSpacing, padding: `${spacing[4]}px 0`, ...style}}>
      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
        {label ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 5, minHeight: SettingsLayout.firstLineHeight}}>
            <span style={{...type.body, color: colors.textPrimary}}>{label}</span>
            {newBadge ? <NewBadge /> : null}
          </div>
        ) : null}
        {description ? <SettingsNote>{description}</SettingsNote> : null}
      </div>
      <div
        style={{
          flex: 'none',
          width: controlWidth ?? undefined,
          minHeight: SettingsLayout.firstLineHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** settingsSection: heading + card (padding 16, backgroundRaised, cornerMedium, 1pt surfaceBorder). */
export const SettingsSection: React.FC<{title: string; icon?: SectionIcon; newBadge?: boolean; children: React.ReactNode}> = ({title, icon, newBadge, children}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
      <SettingsSectionHeading title={title} icon={icon} newBadge={newBadge} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: spacing[16],
          background: colors.backgroundRaised,
          borderRadius: radius.medium,
          boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** compactActionButton: [symbol 11 semibold] + title, 12 medium, padding h10, height 26, .secondary (or .destructive). */
export const CompactActionButton: React.FC<{title: string; systemImage?: string; destructive?: boolean; state?: ControlState}> = ({title, systemImage, destructive, state = 'rest'}) => {
  const {colors} = useMuesliTheme();
  const fg = destructive ? colors.destructiveText : colors.textPrimary;
  return (
    <Button kind={destructive ? 'destructive' : 'secondary'} state={state} style={{height: 26, padding: '0 10px', gap: 6, flex: 'none'}}>
      {systemImage ? <Symbol name={systemImage} size={11} weight="semibold" color={fg} /> : null}
      <span style={{...font(12, 'medium'), whiteSpace: 'nowrap'}}>{title}</span>
    </Button>
  );
};

/** accentActionButton: captionMedium, padding h10, height 26, .tinted. */
export const AccentActionButton: React.FC<{title: string; state?: ControlState}> = ({title, state = 'rest'}) => (
  <Button kind="tinted" state={state} style={{height: 26, padding: '0 10px', flex: 'none'}}>
    <span style={{...type.captionMedium, whiteSpace: 'nowrap'}}>{title}</span>
  </Button>
);

/** actionButton: title then symbol (13 semibold), 13 medium, full width, padding h16 v8, .secondary. */
export const ActionButton: React.FC<{title: string; systemImage?: string; state?: ControlState}> = ({title, systemImage, state = 'rest'}) => {
  const {colors} = useMuesliTheme();
  return (
    <Button kind="secondary" state={state} style={{width: '100%', padding: `${spacing[8]}px ${spacing[16]}px`, gap: spacing[8], boxSizing: 'border-box'}}>
      <span style={{...font(13, 'medium')}}>{title}</span>
      {systemImage ? <Symbol name={systemImage} size={13} weight="semibold" color={colors.textPrimary} /> : null}
    </Button>
  );
};
