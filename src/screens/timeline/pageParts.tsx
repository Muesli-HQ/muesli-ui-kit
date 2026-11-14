// Page-level pieces shared by the Timeline and Dictations pages (v0.8.6):
//  - DashboardPageHeader + DashboardICloudSyncButton (DashboardICloudSyncButton.swift)
//  - StatsHeaderView / StatCard (StatsHeaderView.swift)
//  - DictationFormattingSetupCard (DictationFormattingSettingsView.swift)
//  - RecordOriginPicker (SyncOriginDisplay.swift), TargetApplicationFilterMenu (TargetApplicationIconView.swift)
//  - the date filter Menu label (TimelineView.dateFilterMenu / DictationsView.dateFilterButton)
//  - the day section header and empty states (TimelineView.swift / DictationsView.swift)
//  - native AppKit controls (TextField .roundedBorder, Picker menu, segmented Picker, small Toggle .switch)
//    which SwiftUI does not define in source: dark appearance measured from
//    references/muesli-dev-2026-11-09/dark/01-timeline.png; light, focused and pressed states still VERIFY.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {radius, spacing, layout, withAlpha} from '../../tokens/theme';
import {font, type} from '../../typography';
import {systemFontStack} from '../../fonts';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {PageTitle} from '../../primitives/PageTitle';
import {TargetAppIcon} from './rowParts';
import {tint} from './TimelineRows';
import type {DateFilterLabel, ICloudState, PageStats, RecordOrigin, StatId, TargetApp} from './types';

// ---------------------------------------------------------------- Header

/** DashboardICloudSyncButton: 34×34 circle, `.muesli(.secondary, shape: .circle, bordered: false)`. */
export const ICloudSyncButton: React.FC<{state: ICloudState; buttonState?: ControlState}> = ({state, buttonState}) => {
  const {colors} = useMuesliTheme();
  const tintColor = state.error ? colors.transcribing : state.enabled ? colors.accentText : colors.textTertiary;
  return (
    <Button
      kind="secondary"
      shape={{kind: 'circle'}}
      bordered={false}
      state={buttonState ?? (state.syncing ? 'disabled' : 'rest')}
      style={{width: 34, height: 34, flex: 'none', position: 'relative'}}
    >
      <Symbol name={state.error ? 'icloud.slash' : 'icloud'} size={20} weight="semibold" color={tintColor} />
      {!state.error && (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(1px)'}}>
          {/* RotatingSyncIcon, .symbolRenderingMode(.hierarchical). VERIFY hierarchical opacity. */}
          <span style={{display: 'inline-flex', transform: `rotate(${state.rotation ?? 0}deg)`}}>
            <Symbol name="arrow.triangle.2.circlepath" size={8} weight="bold" color={tintColor} />
          </span>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          boxShadow: `inset 0 0 0 1px ${tint(tintColor, state.enabled || state.error ? 0.28 : 0.14)}`,
        }}
      />
    </Button>
  );
};

/** DashboardPageHeader: HStack(spacing: 12) { PageTitle; DashboardICloudSyncButton }, inset 32, top 8. */
export const DashboardPageHeader: React.FC<{title: string; iCloud?: ICloudState; iCloudButtonState?: ControlState}> = ({
  title,
  iCloud = {enabled: true},
  iCloudButtonState,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: spacing[12], padding: `${layout.pageTop}px ${layout.pageInset}px 0`}}>
    <div style={{flex: 1, minWidth: 0}}>
      <PageTitle>{title}</PageTitle>
    </div>
    <ICloudSyncButton state={iCloud} buttonState={iCloudButtonState} />
  </div>
);

// ---------------------------------------------------------------- Stats

const formatWordCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

const StatCard: React.FC<{icon: string; iconColor: string; value: string; label: string; hovered?: boolean; pressed?: boolean}> = ({
  icon,
  iconColor,
  value,
  label,
  hovered,
  pressed,
}) => {
  const {colors} = useMuesliTheme();
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing[8],
        padding: spacing[16],
        background: hovered ? colors.backgroundHover : colors.backgroundRaised,
        borderRadius: radius.medium,
        boxShadow: `inset 0 0 0 1px ${hovered ? withAlpha(colors.accent, 0.38) : colors.surfaceBorder}`,
        transform: pressed ? 'scale(0.98)' : undefined,
        textAlign: 'center',
      }}
    >
      <Symbol name={icon} size={20} weight="regular" color={iconColor} />
      <span style={{...type.title2, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums'}}>{value}</span>
      <span style={{...type.caption, color: colors.textSecondary}}>{label}</span>
    </div>
  );
};

/** StatsHeaderView: HStack(spacing: 16) of StatCards, padding h pageInset / v 16. */
export const StatsHeader: React.FC<{stats: PageStats; showsMeetingStat?: boolean; hovered?: StatId; pressed?: StatId}> = ({
  stats,
  showsMeetingStat = true,
  hovered,
  pressed,
}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', gap: spacing[16], padding: `${spacing[16]}px ${layout.pageInset}px`}}>
      <StatCard icon="flame.fill" iconColor="#F5A623" value={`${stats.streakDays}`} label="day streak" hovered={hovered === 'streak'} pressed={pressed === 'streak'} />
      <StatCard icon="character.cursor.ibeam" iconColor={colors.accent} value={formatWordCount(stats.totalWords)} label="words dictated" hovered={hovered === 'words'} pressed={pressed === 'words'} />
      <StatCard
        icon="gauge.with.dots.needle.33percent"
        iconColor={colors.success}
        value={stats.averageWPM.toFixed(0)}
        label="avg WPM"
        hovered={hovered === 'pace'}
        pressed={pressed === 'pace'}
      />
      {showsMeetingStat && (
        <StatCard icon="person.2.fill" iconColor={colors.accent} value={`${stats.meetings}`} label="meetings" hovered={hovered === 'meetings'} pressed={pressed === 'meetings'} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------- Formatting setup card

/** DictationFormattingSetupCard (shown until dismissed). Native push / borderless buttons. VERIFY. */
export const DictationFormattingSetupCard: React.FC = () => {
  const {colors, isDark} = useMuesliTheme();
  return (
    <div style={{padding: `0 ${layout.pageInset}px ${spacing[12]}px`}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          borderRadius: 12,
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', // Color.primary.opacity(0.03)
        }}
      >
        <span style={{...type.headline, color: colors.textPrimary}}>Your words, formatted for each app</span>
        <span style={{...type.callout, color: colors.textSecondary}}>
          Prefer lowercase messages or fewer final periods? Set up formatting for your most-used apps.
        </span>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <NativePushButton>Set Up App Formatting</NativePushButton>
          <span style={{...type.body, color: colors.accent, padding: '0 4px'}}>Skip</span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Native controls (approximations)
// Dark values measured from references/muesli-dev-2026-11-09/dark/01-timeline.png (MuesliDev v0.8.6,
// macOS 26). Light values have no capture yet. VERIFY light.

const useNativeChrome = () => {
  const {isDark, colors} = useMuesliTheme();
  return {
    /** TextField .roundedBorder fill, no visible outline. Measured dark #282929. */
    field: isDark ? '#282929' : '#FFFFFF',
    fieldBorder: isDark ? 'transparent' : 'rgba(0,0,0,0.12)',
    /** Pop-up / segmented track fill. Measured dark #28292B. */
    bezel: isDark ? '#28292B' : 'rgba(0,0,0,0.06)',
    /** Selected segment. Measured dark #434446. */
    selected: isDark ? '#434446' : '#FFFFFF',
    selectedShadow: isDark ? 'none' : '0 0 0 0.5px rgba(0,0,0,0.12), 0 1px 1.5px rgba(0,0,0,0.1)',
    /** Segment separator. Measured dark #3D3E40. */
    separator: isDark ? '#3D3E40' : 'rgba(0,0,0,0.12)',
    /** labelColor: measured dark (222,222,223) on #28292B ≈ white 85%. */
    label: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
    /** placeholderTextColor: measured dark (158,159,159) on #282929 ≈ white 55%. */
    placeholder: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.25)',
    pushBezel: isDark ? 'rgba(255,255,255,0.10)' : '#FFFFFF',
    pushShadow: isDark ? 'none' : '0 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1.5px rgba(0,0,0,0.08)',
    focusRing: withAlpha(colors.accent, 0.5),
  };
};

/** Native control system font (segmented / pop-up labels render in SF Pro, not Nunito — measured). */
const systemLabel = (size: number): React.CSSProperties => ({fontFamily: systemFontStack, fontSize: size, fontWeight: 400, lineHeight: 'normal'});

const NativePushButton: React.FC<{children: React.ReactNode}> = ({children}) => {
  const n = useNativeChrome();
  return (
    <span
      style={{
        ...systemLabel(13),
        color: n.label,
        height: 24,
        padding: '0 12px',
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 12,
        background: n.pushBezel,
        boxShadow: n.pushShadow,
      }}
    >
      {children}
    </span>
  );
};

/**
 * TextField("Search activity…").textFieldStyle(.roundedBorder), text in the inherited MuesliTheme.body().
 * Measured: 28pt tall, filled #282929, no outline, radius ≈ 7, text inset 6.5.
 */
export const SearchField: React.FC<{placeholder: string; text?: string; focused?: boolean; caret?: boolean}> = ({placeholder, text = '', focused, caret}) => {
  const {colors} = useMuesliTheme();
  const n = useNativeChrome();
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        padding: '0 6.5px',
        borderRadius: 7,
        background: n.field,
        // Focus ring: VERIFY (no focused capture).
        boxShadow: focused ? `0 0 0 3px ${n.focusRing}` : n.fieldBorder === 'transparent' ? 'none' : `inset 0 0 0 1px ${n.fieldBorder}`,
        overflow: 'hidden',
      }}
    >
      <span style={{...type.body, color: text ? colors.textPrimary : n.placeholder, whiteSpace: 'pre'}}>{text || (caret ? '' : placeholder)}</span>
      {caret && <span style={{width: 1, height: 17, background: colors.textPrimary, marginLeft: 1, flex: 'none'}} />}
      {caret && !text && <span style={{...type.body, color: n.placeholder, whiteSpace: 'pre'}}>{placeholder}</span>}
    </div>
  );
};

/**
 * Picker(...) default (pop-up) style in a `.frame(width:)`. Measured: the bezel hugs its content
 * (111pt for "All activity") and is centred in the frame; 24pt tall, #28292B, radius ≈ 7, no border;
 * label SF Pro 13 at inset 12.5, chevron.up.chevron.down trailing inset 10.5.
 */
export const PopUpPicker: React.FC<{value: string; width: number; state?: ControlState}> = ({value, width, state = 'rest'}) => {
  const n = useNativeChrome();
  const {isDark} = useMuesliTheme();
  return (
    <div style={{width, flex: 'none', display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          height: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 17.5,
          padding: '0 10.5px 0 12.5px',
          borderRadius: 7,
          background: state === 'pressed' ? (isDark ? '#3A3B3D' : 'rgba(0,0,0,0.12)') : n.bezel,
        }}
      >
        <span style={{...systemLabel(13), color: n.label, whiteSpace: 'nowrap'}}>{value}</span>
        <Symbol name="chevron.up.chevron.down" size={10} weight="semibold" color={n.label} />
      </div>
    </div>
  );
};

/**
 * RecordOriginPicker: `.pickerStyle(.segmented)`. Measured: 24pt tall, equal-width segments (97pt for
 * All / This Mac / From iPhone), track #28292B, selected segment #434446 filling the full height,
 * radius ≈ 7, 1px separator (≈ 60% height) between unselected neighbours, SF Pro 13 labels (centred).
 */
export const RecordOriginPicker: React.FC<{selection: RecordOrigin; segmentWidth?: number}> = ({selection, segmentWidth = 97}) => {
  const n = useNativeChrome();
  const items: Array<[RecordOrigin, string]> = [['all', 'All'], ['thisMac', 'This Mac'], ['fromIPhone', 'From iPhone']];
  return (
    <div style={{display: 'inline-flex', flex: 'none', height: 24, borderRadius: 7, background: n.bezel, position: 'relative'}}>
      {items.map(([id, label], i) => {
        const next = items[i + 1]?.[0];
        const separator = next !== undefined && id !== selection && next !== selection;
        return (
          <span
            key={id}
            style={{
              ...systemLabel(13),
              color: n.label,
              width: segmentWidth,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 7,
              background: selection === id ? n.selected : 'transparent',
              boxShadow: selection === id ? n.selectedShadow : 'none',
              position: 'relative',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
            {separator && <span style={{position: 'absolute', right: -0.5, top: 5, bottom: 5, width: 1, background: n.separator}} />}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Toggle(.switch).tint(toggleAccent) (macOS 26 style). Measured off state: track 44×20 #2D2E30,
 * pill knob 26×16 #E0E0E0 inset 2. On state VERIFY (knob assumed white at trailing end).
 */
export const SmallSwitch: React.FC<{on: boolean}> = ({on}) => {
  const {colors, isDark} = useMuesliTheme();
  const w = 44;
  const h = 20;
  const kw = 26;
  return (
    <div style={{width: w, height: h, flex: 'none', borderRadius: h / 2, background: on ? colors.toggleAccent : isDark ? '#2D2E30' : 'rgba(0,0,0,0.1)', position: 'relative'}}>
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: on ? w - kw - 2 : 2,
          width: kw,
          height: h - 4,
          borderRadius: (h - 4) / 2,
          background: on ? '#FFFFFF' : isDark ? '#E0E0E0' : '#FFFFFF',
          boxShadow: isDark ? 'none' : '0 0.5px 1.5px rgba(0,0,0,0.25)',
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------- Filters

/**
 * `.menuStyle(.borderlessButton)` as AppKit draws it (measured from reference): the label's
 * foregroundStyle is replaced by the window tint (MuesliTheme.accent), a pull-down chevron (≈6.5×4pt) follows
 * ≈4.5pt of ink gap after the label, symbols draw at the 13pt system size (not the label's 11pt),
 * and the button adds ≈5pt inset on each side. The label's own
 * padding and Capsule background did not render for the unfiltered state. VERIFY the filtered state
 * (accent.opacity(0.12) capsule) — no capture of it yet; drawn here as the Swift specifies.
 */
const BorderlessMenu: React.FC<{
  active: boolean;
  padX: number;
  padY: number;
  indicator: boolean;
  /** Measured leading inset and label→chevron gap (they differ slightly with the label's glyph bearings). */
  leading: number;
  chevronGap: number;
  children: React.ReactNode;
}> = ({active, padX, padY, indicator, leading, chevronGap, children}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', flex: 'none', padding: `0 5px 0 ${leading}px`, gap: chevronGap}}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'inherit',
          padding: active ? `${padY}px ${padX}px` : 0,
          background: active ? withAlpha(colors.accent, 0.12) : 'transparent',
          borderRadius: 9999,
        }}
      >
        {children}
      </div>
      {indicator && <Symbol name="chevron.down" size={8} weight="bold" color={colors.accent} />}
    </div>
  );
};

/** TimelineView.dateFilterMenu / DictationsView.dateFilterButton (line.3.horizontal.decrease 11pt + label when filtered). */
export const DateFilterMenu: React.FC<{filter?: DateFilterLabel; indicator?: boolean}> = ({filter = 'All time', indicator = true}) => {
  const {colors} = useMuesliTheme();
  const active = filter !== 'All time';
  return (
    <BorderlessMenu active={active} padX={8} padY={3} indicator={indicator} leading={3} chevronGap={2}>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
        <Symbol name="line.3.horizontal.decrease" size={13} weight="regular" color={colors.accent} />
        {active && <span style={{...font(11), color: colors.accent, whiteSpace: 'nowrap'}}>{filter}</span>}
      </span>
    </BorderlessMenu>
  );
};

/** TargetApplicationFilterMenu: square.grid.2x2 + "Apps", or the selected app's 16pt icon + name. */
export const AppFilterMenu: React.FC<{selection?: TargetApp; indicator?: boolean}> = ({selection, indicator = true}) => {
  const {colors} = useMuesliTheme();
  return (
    <BorderlessMenu active={!!selection} padX={8} padY={4} indicator={indicator} leading={3} chevronGap={2.5}>
      {/* HStack(spacing: 5); measured ink gap icon→text 6pt → 4 with the 13pt glyph's bearing. */}
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
        {selection ? (
          <>
            <TargetAppIcon app={selection} size={16} />
            <span style={{...font(11, 'medium'), color: colors.accent, whiteSpace: 'nowrap'}}>{selection.name}</span>
          </>
        ) : (
          <>
            <Symbol name="square.grid.2x2" size={13} weight="regular" color={colors.accent} />
            <span style={{...font(11, 'medium'), color: colors.accent}}>Apps</span>
          </>
        )}
      </span>
    </BorderlessMenu>
  );
};

/** TimelineView.privacyControl: Label("Privacy", eye.slash) 12 medium + private_mode switch. */
export const PrivacyControl: React.FC<{on: boolean}> = ({on}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, flex: 'none'}}>
      {/* Label: icon + title. Icon→title gap measured from reference: 8.5. */}
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 8.5, ...font(12, 'medium'), color: colors.textPrimary}}>
        <Symbol name="eye.slash" size={12} weight="medium" color={colors.textPrimary} />
        Privacy
      </span>
      {/* MuesliSettingControl on/off: HStack { Spacer(); Toggle } fixed-size. Measured: title ink → switch 15pt,
          i.e. HStack spacing 6 + ≈2.5. */}
      <div style={{width: 2.5, flex: 'none'}} />
      <SmallSwitch on={on} />
    </div>
  );
};

// ---------------------------------------------------------------- Sections / empty state

/** Day header: 12 semibold, textTertiary, leading 4. */
export const DayHeader: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {colors} = useMuesliTheme();
  return <div style={{...font(12, 'semibold'), color: colors.textTertiary, paddingLeft: spacing[4]}}>{children}</div>;
};

/** Empty state: 40pt thin symbol, title3 textSecondary, callout textTertiary, spacing 12. */
export const EmptyState: React.FC<{symbol: string; title: string; message: string; style?: React.CSSProperties}> = ({symbol, title, message, style}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing[12], ...style}}>
      {/* Weight "thin" is exported (scripts/symbols.d/timeline.json); Symbol's TS type only lists four weights. */}
      <Symbol name={symbol} size={40} weight={'thin' as 'regular'} color={colors.textTertiary} />
      <span style={{...type.title3, color: colors.textSecondary}}>{title}</span>
      <span style={{...type.callout, color: colors.textTertiary}}>{message}</span>
    </div>
  );
};
