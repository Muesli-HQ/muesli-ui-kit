// Nunito Sans — the app-wide text family (AppFonts.swift / MuesliTheme.font @ v0.8.6).
// SF Symbols use exported glyphs (../icons); code uses the system monospace like the app.
import regular from './NunitoSans-Regular.ttf';
import italic from './NunitoSans-Italic.ttf';
import medium from './NunitoSans-Medium.ttf';
import semibold from './NunitoSans-SemiBold.ttf';
import bold from './NunitoSans-Bold.ttf';
import boldItalic from './NunitoSans-BoldItalic.ttf';
import extraBold from './NunitoSans-ExtraBold.ttf';

export const MUESLI_FONT_FAMILY = 'Muesli Nunito Sans';
export const fontStack = `'${MUESLI_FONT_FAMILY}', 'Nunito Sans', system-ui, sans-serif`;
/** macOS system UI (menu bar, alerts, other apps' chrome). */
export const systemFontStack = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif`;
export const monoFontStack = `ui-monospace, 'SF Mono', Menlo, monospace`;

const faces: Array<[string, string, string]> = [
  [regular, '400', 'normal'], [italic, '400', 'italic'], [medium, '500', 'normal'],
  [semibold, '600', 'normal'], [bold, '700', 'normal'], [boldItalic, '700', 'italic'], [extraBold, '800', 'normal'],
];

let loading: Promise<void> | null = null;
/** Registers all Nunito Sans faces once. Await before rendering frames (e.g. inside delayRender). */
export function loadMuesliFonts(): Promise<void> {
  if (loading) return loading;
  loading = Promise.all(
    faces.map(async ([src, weight, style]) => {
      const face = new FontFace(MUESLI_FONT_FAMILY, `url(${src})`, {weight, style});
      await face.load();
      document.fonts.add(face);
    }),
  ).then(() => undefined);
  return loading;
}
