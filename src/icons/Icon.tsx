import React from 'react';
import {glyphs, type GlyphKey} from './generated';

type MaskProps = {src: string; width: number; height: number; color: string; style?: React.CSSProperties};

/** Paints `color` through a black-on-transparent glyph mask, so every glyph is tintable like a template image. */
const Mask: React.FC<MaskProps> = ({src, width, height, color, style}) => (
  <span
    aria-hidden
    style={{
      display: 'inline-block',
      flex: 'none',
      width,
      height,
      backgroundColor: color,
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskSize: '100% 100%',
      maskSize: '100% 100%',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      ...style,
    }}
  />
);

export type SymbolWeight = 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';

/**
 * An SF Symbol, sized as SwiftUI does for `Image(systemName:).font(.system(size:weight:))`.
 * Add new name/weight pairs to ui-kit/scripts/symbols.d/<group>.json and run ui-kit/scripts/export-icons.sh.
 */
export const Symbol: React.FC<{name: string; size: number; weight?: SymbolWeight; color: string; style?: React.CSSProperties}> = ({
  name,
  size,
  weight = 'medium',
  color,
  style,
}) => {
  const key = `${name}@${weight}` as GlyphKey;
  const glyph = glyphs[key];
  if (!glyph) throw new Error(`SF Symbol "${key}" not exported. Add it to ui-kit/scripts/symbols.d/<group>.json and run ui-kit/scripts/export-icons.sh.`);
  return <Mask src={glyph.src} width={glyph.w * size} height={glyph.h * size} color={color} style={style} />;
};

/** TimeTurnerIcon.swift: a 20×20pt template image drawn at its natural size (not scaled by font size). */
export const TimeTurnerIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Mask src={glyphs['time-turner'].src} width={size} height={size} color={color} />
);

/** VidshotIcon.swift: four corner brackets and a play triangle, stroke max(1, side × 0.09). */
export const VidshotIcon: React.FC<{color: string; size: number}> = ({color, size}) => {
  const s = size;
  const inset = s * 0.11;
  const arm = s * 0.25;
  const corners: Array<[boolean, boolean]> = [[false, false], [true, false], [false, true], [true, true]];
  const d = corners
    .map(([h, v]) => {
      const cx = h ? s - inset : inset;
      const cy = v ? s - inset : inset;
      const dx = h ? -arm : arm;
      const dy = v ? -arm : arm;
      return `M${cx + dx} ${cy} L${cx} ${cy} L${cx} ${cy + dy}`;
    })
    .join(' ');
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{flex: 'none', display: 'block'}} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={Math.max(1, s * 0.09)} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${s * 0.42} ${s * 0.31} L${s * 0.69} ${s * 0.5} L${s * 0.42} ${s * 0.69} Z`} fill={color} />
    </svg>
  );
};

/**
 * The muesli waveform mark (MenuBarIconRenderer.makeMuesliMark): extracted from the canonical
 * app icon, drawn 14pt tall inside an 18pt canvas. `box` scales that canvas, like
 * `.resizable().scaledToFit().frame(width: box, height: box)` in the sidebar header (box 22).
 */
export const MuesliMark: React.FC<{color: string; box?: number}> = ({color, box = 18}) => {
  const g = glyphs['muesli-mark'];
  const height = (14 * box) / 18;
  const width = (height * g.w) / g.h;
  return (
    <span style={{width: box, height: box, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
      <Mask src={g.src} width={width} height={height} color={color} />
    </span>
  );
};
