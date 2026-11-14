// Small shared pieces for the Meetings screens (v0.8.6):
//  - DashboardPageHeader + DashboardICloudSyncButton (DashboardICloudSyncButton.swift)
//  - MeetingStatus pill colours (MeetingStatusDisplay.swift)
//  - formatDuration (MeetingListItemView.swift / MeetingDetailView.swift, identical)
//  - MeetingPreviewText.snippet (MeetingPreviewText.swift), simplified to the Markdown the fixtures use
//  - text helpers for SwiftUI `.lineSpacing` / `.lineLimit`
//  - native AppKit stand-ins: segmented Picker and Divider (VERIFY: not determined by Muesli's Swift)
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {withAlpha, type MuesliTheme} from '../../tokens/theme';
import {font} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {PageTitle} from '../../primitives/PageTitle';
import type {MeetingStatus} from './types';

/** Nunito Sans hhea ascent+descent (1011 + 353 per 1000 em): SwiftUI's natural line height. */
export const NUNITO_LINE = 1.364;

/** SwiftUI `.lineSpacing(n)`: n between lines only (CSS line-height spreads it, so trim the ends). */
export const lineSpaced = (size: number, extra: number): React.CSSProperties => ({
  lineHeight: `${size * NUNITO_LINE + extra}px`,
  marginTop: -extra / 2,
  marginBottom: -extra / 2,
});

/** `.lineLimit(n)` */
export const clamp = (lines?: number): React.CSSProperties =>
  lines === undefined ? {} : {display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden'};

/** `.lineLimit(1)` on a single-line label. */
export const oneLine: React.CSSProperties = {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0};

/** Replace the alpha of an `rgba(...)` token (e.g. `MuesliTheme.textSecondary.opacity(0.4)`). */
export const opacityOf = (rgba: string, a: number) => {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return withAlpha(rgba, a);
  const base = m[4] === undefined ? 1 : parseFloat(m[4]);
  return `rgba(${m[1]},${m[2]},${m[3]},${base * a})`;
};

/** formatDuration (MeetingListItemView.swift / MeetingDetailView.swift). */
export function formatDuration(seconds: number): string {
  const r = Math.round(seconds);
  if (r >= 3600) return `${Math.floor(r / 3600)}h ${Math.floor((r % 3600) / 60)}m`;
  if (r >= 60) {
    const m = Math.floor(r / 60);
    const s = r % 60;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
  }
  return `${r}s`;
}

/** MeetingPreviewText.snippet(limit: 88): Markdown → plain text, whitespace-collapsed, "..." past the limit. */
export function previewSnippet(markdown: string, limit = 88): string {
  const plain = markdown
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) =>
      l
        .replace(/^#{1,6}\s*/, '')
        .replace(/^>+\s*/, '')
        .replace(/^(?:[-+*]|\d+[.)])\s+/, '')
        .replace(/^\[[ xX]\]\s+/, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1'),
    )
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
  if (!plain) return 'No notes yet';
  return plain.length > limit ? plain.slice(0, Math.max(0, limit - 3)) + '...' : plain;
}

/** MeetingStatus.displayLabel / displayColor / displayTextColor (MeetingStatusDisplay.swift). */
export function statusDisplay(status: MeetingStatus, c: MuesliTheme['colors']) {
  switch (status) {
    case 'recording': return {label: 'Recording', color: c.recording, text: c.destructiveText};
    case 'processing': return {label: 'Processing', color: c.accent, text: c.accentText};
    case 'completed': return {label: 'Completed', color: c.success, text: c.successText};
    case 'noteOnly': return {label: 'Note only', color: c.textTertiary, text: c.textTertiary};
    case 'failed': return {label: 'Needs attention', color: c.transcribing, text: c.warningText};
  }
}

/** MeetingListItemView.statusBadge: 10pt semibold, displayColor @ 12% capsule. */
export const StatusBadge: React.FC<{status: MeetingStatus}> = ({status}) => {
  const {colors} = useMuesliTheme();
  const d = statusDisplay(status, colors);
  return (
    <span style={{...font(10, 'semibold'), color: d.text, padding: '2px 6px', borderRadius: 9999, background: opacityOf(d.color, 0.12), flex: 'none', whiteSpace: 'nowrap'}}>
      {d.label}
    </span>
  );
};

/**
 * DashboardICloudSyncButton: `.muesli(.secondary, shape: .circle, bordered: false)`, 34×34,
 * icloud 20 semibold + arrow.triangle.2.circlepath 8 bold (offset y 1), tint stroke @ 0.28 / 0.14.
 */
export const ICloudSyncButton: React.FC<{enabled?: boolean; state?: ControlState}> = ({enabled = true, state = 'rest'}) => {
  const {colors} = useMuesliTheme();
  const tint = enabled ? colors.accentText : colors.textTertiary;
  return (
    <Button kind="secondary" state={state} shape={{kind: 'circle'}} bordered={false} style={{width: 34, height: 34, flex: 'none', position: 'relative'}}>
      <Symbol name="icloud" size={20} weight="semibold" color={tint} />
      <span style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(1px)'}}>
        <Symbol name="arrow.triangle.2.circlepath" size={8} weight="bold" color={tint} />
      </span>
      <span style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 0 1px ${opacityOf(tint, enabled ? 0.28 : 0.14)}`}} />
    </Button>
  );
};

/** DashboardPageHeader: HStack(spacing 12) { PageTitle(title) ; DashboardICloudSyncButton }. */
export const DashboardPageHeader: React.FC<{title: string; iCloudEnabled?: boolean}> = ({title, iCloudEnabled = true}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, width: '100%'}}>
    <div style={{flex: 1, minWidth: 0}}>
      <PageTitle>{title}</PageTitle>
    </div>
    <ICloudSyncButton enabled={iCloudEnabled} />
  </div>
);

/**
 * `Picker(...).pickerStyle(.segmented)` — an AppKit NSSegmentedControl at its intrinsic size.
 * Measured from reference (MuesliDev 0.8.6, dark, 2026-11-09): 24pt tall, corner radius 5,
 * equal-width segments sized to the widest label (+12pt each side), track white @ 0.08,
 * selected segment white @ 0.19 filling its full cell (no inset), 1×14pt separators (white @ 0.1)
 * between unselected neighbours, label Nunito 13 in NSColor.labelColor (white @ 0.85 — not textPrimary).
 * Light: VERIFY (no light capture).
 * `width` (optional) stretches the control, as `.frame(width:)` does.
 */
export const NativeSegmented: React.FC<{options: string[]; selected: number; width?: number}> = ({options, selected, width}) => {
  const {isDark} = useMuesliTheme();
  const track = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const thumb = isDark ? 'rgba(255,255,255,0.19)' : '#FFFFFF';
  const sep = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const label = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
  return (
    <div
      style={{
        width,
        height: 24,
        flex: 'none',
        display: 'inline-grid',
        gridAutoFlow: 'column',
        gridAutoColumns: '1fr',
        borderRadius: 5,
        overflow: 'hidden',
        background: track,
      }}
    >
      {options.map((o, i) => (
        <div
          key={o}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
            whiteSpace: 'nowrap',
            ...font(13),
            color: label,
            background: i === selected ? thumb : 'transparent',
            borderRadius: i === selected ? 5 : 0,
            boxShadow: i === selected && !isDark ? '0 0.5px 1.5px rgba(0,0,0,0.18)' : undefined,
          }}
        >
          {i > 0 && i !== selected && i - 1 !== selected && (
            <span style={{position: 'absolute', left: -0.5, top: 5, width: 1, height: 14, background: sep}} />
          )}
          {o}
        </div>
      ))}
    </div>
  );
};

/** SwiftUI `Divider()` (NSColor.separatorColor). VERIFY exact separator alpha on macOS 26. */
export const NativeDivider: React.FC<{vertical?: boolean; length?: number; style?: React.CSSProperties}> = ({vertical, length, style}) => {
  const {isDark} = useMuesliTheme();
  const c = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  return (
    <div
      style={{
        flex: 'none',
        background: c,
        ...(vertical ? {width: 1, height: length ?? '100%'} : {height: 1, width: length ?? '100%'}),
        ...style,
      }}
    />
  );
};

/**
 * The pull-down indicator AppKit draws after a `.menuStyle(.borderlessButton)` label unless the
 * Swift adds `.menuIndicator(.hidden)`. Measured from reference (sort / date-filter menus): a
 * 7×4.5pt chevron ink (chevron.down semibold @ 6.5pt), 4pt after the label, in the label's tint.
 */
export const MenuIndicator: React.FC<{color: string}> = ({color}) => (
  <span style={{marginLeft: 4, display: 'inline-flex', alignItems: 'center', flex: 'none'}}>
    <Symbol name="chevron.down" size={6.5} weight="semibold" color={color} />
  </span>
);

/**
 * A `Menu` with `.menuStyle(.borderlessButton)`. Measured from reference (Meetings sort and date
 * filter, which the Swift styles with foreground colours, padding and a capsule fill): AppKit renders
 * only the label's text and symbols, tinted with the window tint (MuesliTheme.accent); the SwiftUI
 * padding, frames, fills and strokes do not render. Symbol→text gap 7pt, 5.5pt side insets.
 */
export const BorderlessMenu: React.FC<{icon?: React.ReactNode; text?: string; textStyle?: React.CSSProperties; indicator?: boolean}> = ({icon, text, textStyle, indicator = true}) => {
  const {colors} = useMuesliTheme();
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', padding: '0 5.5px', color: colors.accent, flex: 'none'}}>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 7}}>
        {icon}
        {text && <span style={{...textStyle, whiteSpace: 'nowrap'}}>{text}</span>}
      </span>
      {indicator && <MenuIndicator color={colors.accent} />}
    </span>
  );
};
