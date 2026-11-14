// CotypistInputMethod/CotypistController.m @ v0.8.6 — how the inline suggestion ("ghost") is drawn.
//
// The input method never draws its own window. It calls setMarkedText on the focused app with the
// suggestion as marked text: foreground [NSColor colorWithWhite:0.5 alpha:1.0], NSUnderlineStyleNone,
// clear underline colour (and the private "chromatic" flag for clients that support it). selectionRange
// is (0, 0), so the caret stays at the START of the marked text: the grey words sit ahead of the caret.
// There is no hint, badge or popover. Tab inserts the whole ghost; Option-Right inserts its next word
// (leading spaces, then up to the next space — NextWordLength) and the rest stays as ghost; any other key
// clears it. The ghost font is the host app's own font.
//
// VERIFY per host app: non-chromatic clients may still draw marked-text decoration differently.
import React from 'react';
import {systemFont} from '../settings/controls';

/** NextWordLength: leading spaces, then up to the next space. */
export function nextWordLength(text: string): number {
  let i = 0;
  while (i < text.length && text[i] === ' ') i++;
  while (i < text.length && text[i] !== ' ') i++;
  return i;
}

/** Splits a suggestion after `acceptedWords` Option-Right presses into [inserted, remainingGhost]. */
export function splitAccepted(suggestion: string, acceptedWords: number): [string, string] {
  let rest = suggestion;
  let taken = '';
  for (let n = 0; n < acceptedWords && rest.length; n++) {
    const len = nextWordLength(rest);
    taken += rest.slice(0, len);
    rest = rest.slice(len);
  }
  // accept(rest:) drops a remainder that is only whitespace
  if (!rest.trim().length) rest = '';
  return [taken, rest];
}

/** The ghost colour: NSColor(white: 0.5, alpha: 1). */
export const COTYPIST_GHOST_COLOR = 'rgb(128,128,128)';

export interface CotypistSuggestionProps {
  /** Text the user has typed (already in the field, before the caret). */
  typed: string;
  /** The suggestion Muesli returned (shown as grey marked text after the caret). */
  suggestion?: string;
  /** Option-Right presses so far: each moves one word from ghost into real text. */
  acceptedWords?: number;
  /** Tab: the whole ghost becomes real text and the ghost is gone. */
  acceptedAll?: boolean;
  /** Caret blink state (props, not timers). */
  caretVisible?: boolean;
  /** Host app text colour and font (the ghost uses the host font). */
  textColor?: string;
  caretColor?: string;
  fontStyle?: React.CSSProperties;
}

/** Inline run: typed text, caret, then the grey ghost. Drop it into any text-field mock. */
export const CotypistSuggestion: React.FC<CotypistSuggestionProps> = ({
  typed,
  suggestion = '',
  acceptedWords = 0,
  acceptedAll = false,
  caretVisible = true,
  textColor = 'rgba(0,0,0,0.85)',
  caretColor,
  fontStyle = systemFont(15),
}) => {
  const [taken, ghost] = acceptedAll ? [suggestion, ''] : splitAccepted(suggestion, acceptedWords);
  const fs = typeof fontStyle.fontSize === 'number' ? fontStyle.fontSize : 15;
  return (
    <span style={{...fontStyle, color: textColor, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
      {typed}
      {taken}
      {/* Caret: zero-width so it never shifts the ghost. */}
      <span style={{display: 'inline-block', width: 0, position: 'relative', verticalAlign: 'baseline'}}>
        <span
          style={{
            position: 'absolute',
            left: -1,
            bottom: -fs * 0.22,
            width: 2,
            height: fs * 1.2,
            borderRadius: 1,
            background: caretColor ?? textColor,
            opacity: caretVisible ? 1 : 0,
          }}
        />
      </span>
      {ghost ? <span style={{color: COTYPIST_GHOST_COLOR, textDecoration: 'none'}}>{ghost}</span> : null}
    </span>
  );
};

/**
 * A generic host editor (a plain macOS text area) to stage the suggestion in: neutral chrome, system font.
 * Not Muesli UI — it stands in for whatever app the user types into. `appearance` is the host app's.
 */
export const CotypistEditor: React.FC<
  CotypistSuggestionProps & {
    appearance?: 'light' | 'dark';
    width?: number;
    height?: number;
    title?: string;
    /** Lines shown above the active line (already-written context). */
    before?: string;
  }
> = ({appearance = 'light', width = 640, height = 220, title, before, ...props}) => {
  const dark = appearance === 'dark';
  const text = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)';
  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        borderRadius: 12,
        background: dark ? '#1E1E1E' : '#FFFFFF',
        boxShadow: dark ? '0 0 0 0.5px rgba(255,255,255,0.12), 0 12px 40px rgba(0,0,0,0.45)' : '0 0 0 0.5px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.18)',
        padding: '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflow: 'hidden',
      }}
    >
      {title ? <div style={{...systemFont(13, 600), color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'}}>{title}</div> : null}
      <div style={{...systemFont(15), lineHeight: 1.45, color: text}}>
        {before ? <span style={{whiteSpace: 'pre-wrap'}}>{before}</span> : null}
        <CotypistSuggestion textColor={text} fontStyle={{...systemFont(15), lineHeight: 1.45}} {...props} />
      </div>
    </div>
  );
};
