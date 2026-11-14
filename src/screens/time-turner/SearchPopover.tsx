// TimeTurnerSearchView (TimeTurnerView.swift @ v0.8.6): a 580×460 popover, padding 18, spacing 12.
// Query text, app filter, date restriction, results, hovered row and loading are props.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {CaptureImage} from './CaptureImage';
import {Checkbox, NativeButton, NativeDivider, PopoverSurface, PopUpPicker, RoundedTextField, Spinner, envFont} from './native';
import {captureSource, formatDateTimeStandard, type TimeTurnerCapture} from './model';
import {TimeTurnerEmptyState} from './EmptyState';

export interface TimeTurnerSearchResult {
  capture: TimeTurnerCapture;
  /** Day label of the capture ("6 Nov 2026"). */
  dayLabel: string;
}

export interface TimeTurnerSearchProps {
  /** Text typed so far. */
  query: string;
  /** Show a text caret in the field. */
  caret?: boolean;
  /** App picker selection label ("All apps" by default). */
  appLabel?: string;
  /** "On date" checkbox; when true the date picker shows `dateText`. */
  restrictDate?: boolean;
  dateText?: string;
  results: TimeTurnerSearchResult[];
  /** Highlighted (hovered) result id. VERIFY: plain buttons show no hover fill in the source; this is a subtle cue for video. */
  hoveredResultId?: string;
  loading?: boolean;
  /** Show "Load more" below the results (cursor != nil). */
  hasMore?: boolean;
  /** Arrow x within the popover (pt from its left edge). */
  arrowX?: number;
}

export const TimeTurnerSearchPopover: React.FC<TimeTurnerSearchProps> = ({
  query,
  caret = false,
  appLabel = 'All apps',
  restrictDate = false,
  dateText = '11/6/2026',
  results,
  hoveredResultId,
  loading = false,
  hasMore = false,
  arrowX,
}) => {
  const {colors} = useMuesliTheme();
  const secondary = colors.textSecondary;
  const showEmpty = results.length === 0 && !hasMore && !loading;
  return (
    <PopoverSurface width={580} height={460} arrowX={arrowX}>
      <div style={{padding: 18, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12, ...envFont, color: colors.textPrimary}}>
        <div style={{...type.headline}}>Search screen history</div>
        <RoundedTextField placeholder="Search captured text or window titles" text={query} focused caret={caret} />
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div style={{width: 260, flex: 'none'}}>
            <PopUpPicker label="App" value={appLabel} width={260} />
          </div>
          <Checkbox label="On date" checked={restrictDate} />
          {restrictDate ? (
            <div style={{...envFont, padding: '0 6px', height: 22, display: 'flex', alignItems: 'center', borderRadius: 5, background: 'rgba(127,127,127,0.12)', fontVariantNumeric: 'tabular-nums'}}>{dateText}</div>
          ) : null}
        </div>
        <NativeDivider />
        {showEmpty ? (
          <TimeTurnerEmptyState title="No matching captures" symbol="magnifyingglass" detail="Try different words, another app, or a wider date range." />
        ) : (
          <div style={{flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8}}>
            {results.map(({capture, dayLabel}) => (
              <div
                key={capture.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 8,
                  borderRadius: 8,
                  flex: 'none',
                  background: hoveredResultId === capture.id ? colors.backgroundHover : 'transparent',
                }}
              >
                <div style={{width: 100, height: 64, flex: 'none', overflow: 'hidden'}}>
                  <CaptureImage capture={capture} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1}}>
                  <span style={{...font(13, 'medium'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{captureSource(capture)}</span>
                  <span style={{...type.caption, color: secondary}}>{formatDateTimeStandard(dayLabel, capture.time)}</span>
                  <span style={{...type.caption, color: secondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{capture.text}</span>
                </div>
                <Symbol name="arrow.up.right" size={14} weight="regular" color={colors.textPrimary} />
              </div>
            ))}
            {hasMore && !loading ? (
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <NativeButton>Load more</NativeButton>
              </div>
            ) : null}
          </div>
        )}
        {loading ? (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Spinner size={16} />
          </div>
        ) : null}
        <div style={{...type.caption, color: secondary, flex: 'none'}}>Matches captured words and phrases · newest first</div>
      </div>
    </PopoverSurface>
  );
};
