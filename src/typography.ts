// MuesliTheme typography (MuesliTheme.swift @ v0.8.6). Point sizes map 1:1 to CSS px at 1×.
// Line height follows CoreText, which rounds Nunito Sans' ascent (1011/1000) and descent (353/1000)
// separately: 15pt → 15 + 5 = 20pt (measured in the app), where CSS `normal` would give 20.46.
import type {CSSProperties} from 'react';
import {generated as g} from './tokens/generated';
import {fontStack, monoFontStack} from './fonts';

export type SwiftWeight = 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';

/** Nunito Sans hhea metrics (unitsPerEm 1000, lineGap 0). */
export const NUNITO_ASCENT = 1.011;
export const NUNITO_DESCENT = 0.353;
/** CoreText line height for Nunito Sans at `size` (what SwiftUI Text uses for one line). */
export const coreTextLineHeight = (size: number) => Math.round(size * NUNITO_ASCENT) + Math.round(size * NUNITO_DESCENT);

/** AppFonts.postScriptName: <medium → Regular, <semibold → Medium, <bold → SemiBold, <heavy → Bold, else ExtraBold. */
export const cssWeight = (w: SwiftWeight = 'regular'): number =>
  ({ultralight: 400, thin: 400, light: 400, regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 800, black: 800})[w];

/** MuesliTheme.font(size:weight:) */
export const font = (size: number, weight: SwiftWeight = 'regular', opts: {mono?: boolean; italic?: boolean} = {}): CSSProperties => ({
  fontFamily: opts.mono ? monoFontStack : fontStack,
  fontSize: size,
  fontWeight: cssWeight(weight),
  fontStyle: opts.italic ? 'italic' : 'normal',
  // Monospaced text keeps the system font's own metrics.
  lineHeight: opts.mono ? 'normal' : `${coreTextLineHeight(size)}px`,
  letterSpacing: 0,
});

type Role = keyof typeof g.type;
const role = (r: Role) => font(g.type[r].size, g.type[r].weight as SwiftWeight);

/** Named roles: title1 26 bold · title2 20 semibold · title3 18 semibold · headline 15 semibold ·
 *  reading 15 · body 14 · callout 13 · caption 12 · captionMedium 12 medium · sectionHeading 12 semibold · metadata 11 medium. */
export const type = {
  largeTitle: role('largeTitle'),
  title1: role('title1'),
  title2: role('title2'),
  title3: role('title3'),
  headline: role('headline'),
  reading: role('reading'),
  body: role('body'),
  callout: role('callout'),
  caption: role('caption'),
  captionMedium: role('captionMedium'),
  sectionHeading: role('sectionHeading'),
  metadata: role('metadata'),
} as const;
