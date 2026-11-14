// Resolves MuesliTheme roles for one appearance, mirroring MuesliTheme.swift and
// MuesliAccentPalette.swift at v0.8.6. Raw values come from ./generated.ts.
import {generated as g} from './generated';

export type Appearance = 'dark' | 'light' | 'ultraDark';

// ---- MuesliContrast (WCAG 2.x, 8-bit sRGB ints) ----
const toInt = (hex: string) => parseInt(hex.replace('#', ''), 16);
const toHex = (n: number) => '#' + n.toString(16).padStart(6, '0').toUpperCase();

export function luminance(hex: number): number {
  const ch = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch((hex >> 16) & 0xff) + 0.7152 * ch((hex >> 8) & 0xff) + 0.0722 * ch(hex & 0xff);
}
export function contrastRatio(a: number, b: number): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
export function mix(color: number, target: number, amount: number): number {
  const ch = (shift: number) => {
    const from = (color >> shift) & 0xff;
    const to = (target >> shift) & 0xff;
    return Math.round(from + (to - from) * amount);
  };
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
const composite = (color: number, opacity: number, base: number) => mix(base, color, opacity);

// ---- MuesliAccentPalette ----
const SHADE_STEPS = 50;
const DERIVATION_TARGET = 6.0 + 0.1;
const INK = toInt(g.fixed.darkInkHex);
const WHITE = 0xffffff;

function textSurfaceHexes(dark: boolean): number[] {
  const roles = ['backgroundDeep', 'backgroundBase', 'backgroundRaised', 'backgroundHover', 'surfacePrimary', 'surfaceSelected'] as const;
  return roles.map((r) => toInt(g.adaptive[r][dark ? 'dark' : 'light']));
}

function accentTextFor(fill: number, dark: boolean): number {
  const tints = [g.numbers.accentTintRest, g.numbers.accentTintHover, g.numbers.accentTintPressed];
  const tinted = textSurfaceHexes(dark).slice(0, 3).flatMap((base) => tints.map((t) => composite(fill, t, base)));
  const backgrounds = [...textSurfaceHexes(dark), ...tinted];
  const target = dark ? WHITE : INK;
  for (let step = 0; step <= SHADE_STEPS; step++) {
    const candidate = mix(fill, target, step / SHADE_STEPS);
    if (backgrounds.every((b) => contrastRatio(candidate, b) >= DERIVATION_TARGET)) return candidate;
  }
  return target;
}

function badgeFillFor(fill: number): number {
  for (let step = 0; step <= SHADE_STEPS; step++) {
    const candidate = mix(fill, 0x000000, step / SHADE_STEPS);
    if (contrastRatio(WHITE, candidate) >= 4.6) return candidate;
  }
  return 0x000000;
}

export function accentPalette(fillHex: string, dark: boolean) {
  const fill = toInt(fillHex);
  const onFill = contrastRatio(WHITE, fill) >= contrastRatio(INK, fill) ? WHITE : INK;
  const stateShade = onFill === WHITE || luminance(fill) > 0.6 ? INK : WHITE;
  return {
    fill: toHex(fill),
    onFill: toHex(onFill),
    text: toHex(accentTextFor(fill, dark)),
    stateShade: toHex(stateShade),
    badgeFill: toHex(badgeFillFor(fill)),
  };
}

// ---- Resolved theme ----
const rgba = (hex: string, a: number) => {
  const n = toInt(hex);
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${a})`;
};
const alphaRole = (role: keyof typeof g.alpha, dark: boolean) => {
  const r = g.alpha[role][dark ? 'dark' : 'light'];
  return rgba(r.base === 'white' ? '#FFFFFF' : '#000000', r.alpha);
};

export interface MuesliTheme {
  appearance: Appearance;
  isDark: boolean;
  colors: {
    backgroundDeep: string; backgroundBase: string; backgroundRaised: string; backgroundHover: string;
    surfacePrimary: string; surfaceSelected: string; surfaceBorder: string;
    textPrimary: string; textSecondary: string; textTertiary: string;
    accent: string; toggleAccent: string; onAccent: string; accentText: string; accentStateShade: string; accentSubtle: string; badgeFill: string;
    recording: string; transcribing: string; success: string;
    recordingFill: string; onRecordingFill: string; onSuccess: string;
    joinAction: string; joinActionSecondary: string; onJoinAction: string;
    destructiveText: string; successText: string; warningText: string;
  };
  /** Opacity constants for tinted fills and state shades. */
  opacity: {
    accentTintRest: number; accentTintHover: number; accentTintPressed: number;
    accentShadeHover: number; accentShadePressed: number;
    destructiveTintRest: number; destructiveTintHover: number; destructiveTintPressed: number;
  };
}

/**
 * @param appearance dark | light | ultraDark (Ultra Dark is a dark appearance with overrides)
 * @param accentOverrideHex a saved custom accent, or undefined for the adaptive default
 */
export function resolveTheme(appearance: Appearance = 'dark', accentOverrideHex?: string): MuesliTheme {
  const dark = appearance !== 'light';
  const side = dark ? 'dark' : 'light';
  const ud = appearance === 'ultraDark';
  const U = g.ultraDark as Record<string, string>;
  const pick = (role: string, standard: string) => (ud && typeof U[role] === 'string' ? U[role] : standard);

  const fillHex = accentOverrideHex ?? g.defaultAccent[side];
  const pal = accentPalette(fillHex, dark);
  const accent = ud ? '#FFFFFF' : pal.fill;

  return {
    appearance,
    isDark: dark,
    colors: {
      backgroundDeep: pick('backgroundDeep', g.adaptive.backgroundDeep[side]),
      backgroundBase: pick('backgroundBase', g.adaptive.backgroundBase[side]),
      backgroundRaised: pick('backgroundRaised', g.adaptive.backgroundRaised[side]),
      backgroundHover: pick('backgroundHover', g.adaptive.backgroundHover[side]),
      surfacePrimary: pick('surfacePrimary', g.adaptive.surfacePrimary[side]),
      surfaceSelected: pick('surfaceSelected', g.adaptive.surfaceSelected[side]),
      surfaceBorder: pick('surfaceBorder', alphaRole('surfaceBorder', dark)),
      textPrimary: pick('textPrimary', alphaRole('textPrimary', dark)),
      textSecondary: pick('textSecondary', alphaRole('textSecondary', dark)),
      textTertiary: pick('textTertiary', alphaRole('textTertiary', dark)),
      accent,
      toggleAccent: pal.fill,
      onAccent: ud ? g.fixed.darkInkHex : pal.onFill,
      accentText: ud ? '#FFFFFF' : pal.text,
      accentStateShade: ud ? g.fixed.darkInkHex : pal.stateShade,
      accentSubtle: rgba(accent, g.numbers.accentTintRest),
      badgeFill: pal.badgeFill,
      recording: g.fixed.recording,
      transcribing: g.fixed.transcribing,
      success: g.fixed.success,
      recordingFill: g.fixed.recordingFillHex,
      onRecordingFill: '#FFFFFF',
      onSuccess: g.fixed.darkInkHex,
      joinAction: g.fixed.joinActionHex,
      joinActionSecondary: g.fixed.joinActionSecondaryHex,
      onJoinAction: g.fixed.darkInkHex,
      destructiveText: g.adaptive.destructiveText[side],
      successText: g.adaptive.successText[side],
      warningText: g.adaptive.warningText[side],
    },
    opacity: {
      accentTintRest: g.numbers.accentTintRest,
      accentTintHover: g.numbers.accentTintHover,
      accentTintPressed: g.numbers.accentTintPressed,
      accentShadeHover: g.numbers.accentShadeHover,
      accentShadePressed: g.numbers.accentShadePressed,
      destructiveTintRest: g.numbers.destructiveTintRest,
      destructiveTintHover: g.numbers.destructiveTintHover,
      destructiveTintPressed: g.numbers.destructiveTintPressed,
    },
  };
}

/** Composites a colour over another at an opacity, returning an rgba string (for overlays). */
export const withAlpha = rgba;

export const spacing = {
  4: g.numbers.spacing4, 8: g.numbers.spacing8, 12: g.numbers.spacing12, 16: g.numbers.spacing16,
  20: g.numbers.spacing20, 24: g.numbers.spacing24, 32: g.numbers.spacing32,
} as const;
export const radius = {
  small: g.numbers.cornerSmall, medium: g.numbers.cornerMedium, large: g.numbers.cornerLarge, xl: g.numbers.cornerXL,
} as const;
export const layout = {
  pageTop: g.numbers.pageTop,
  pageInset: g.numbers.pageInset,
  readingWidth: g.numbers.readingWidth,
  /** DashboardRootView: expanded / collapsed sidebar widths. */
  sidebarWidth: 240,
  sidebarCollapsedWidth: 68,
  /** RecentHistoryWindowController default frame (measured: the 32pt titlebar is inside it). */
  windowWidth: 1120,
  windowHeight: 790,
  /** SwiftUI content area below the titlebar: 1120 × 758. Use for content-only compositions. */
  contentHeight: 758,
} as const;
