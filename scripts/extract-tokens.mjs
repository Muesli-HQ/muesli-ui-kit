#!/usr/bin/env node
// Generates ui-kit/src/tokens/generated.ts from the app's MuesliTheme.swift at a release tag.
// Usage: node ui-kit/scripts/extract-tokens.mjs [gitRef=v0.8.6] [repo=../../muesli, a muesli checkout next to this repo]
// Fails loudly if an expected role disappears, so a new release can't silently drift.
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ref = process.argv[2] ?? 'v0.8.6';
const repo = process.argv[3] ?? process.env.MUESLI_REPO ?? new URL('../../../muesli', import.meta.url).pathname;
const themePath = 'native/MuesliNative/Sources/MuesliNativeApp/MuesliTheme.swift';
const src = execFileSync('git', ['-C', repo, 'show', `${ref}:${themePath}`], {encoding: 'utf8'});
const commit = execFileSync('git', ['-C', repo, 'rev-list', '-n1', ref], {encoding: 'utf8'}).trim();

const hex = (s) => '#' + s.replace(/^0x/i, '').padStart(6, '0').toUpperCase();
const all = (re) => [...src.matchAll(re)];

// 1. Adaptive hex pairs: `static let fooHex = (dark: 0x.., light: 0x..)`
const adaptive = {};
for (const m of all(/static let (\w+)Hex = \(dark: (0x[0-9A-Fa-f]+), light: (0x[0-9A-Fa-f]+)\)/g)) {
  adaptive[m[1]] = {dark: hex(m[2]), light: hex(m[3])};
}
// backgroundDeep is split into two constants.
const deepDark = src.match(/backgroundDeepDarkHex = (0x[0-9A-Fa-f]+)/);
const deepLight = src.match(/backgroundDeepLightHex = (0x[0-9A-Fa-f]+)/);
if (deepDark && deepLight) adaptive.backgroundDeep = {dark: hex(deepDark[1]), light: hex(deepLight[1])};

// 2. Alpha roles: Color.adaptiveAlpha(dark: .white, darkAlpha: 0.07, light: .black, lightAlpha: 0.08)
const alpha = {};
for (const m of all(/static let (\w+)Standard = Color\.adaptiveAlpha\(\s*dark: \.(white|black), darkAlpha: ([\d.]+),\s*light: \.(white|black), lightAlpha: ([\d.]+)\s*\)/g)) {
  alpha[m[1]] = {dark: {base: m[2], alpha: +m[3]}, light: {base: m[4], alpha: +m[5]}};
}

// 3. Ultra Dark overrides: `static var foo: Color { appearance.ultraDark ? X : ... }`
const ultraDark = {};
for (const m of all(/static var (\w+): Color \{\s*appearance\.ultraDark \? (.+?) : /g)) {
  const v = m[2].trim();
  let out;
  let mm;
  if ((mm = v.match(/^Color\(hex: (0x[0-9A-Fa-f]+|darkInkHex)\)$/))) out = mm[1] === 'darkInkHex' ? '#000000' : hex(mm[1]);
  else if ((mm = v.match(/^Color\.white\.opacity\(([\d.]+)\)$/))) out = `rgba(255,255,255,${mm[1]})`;
  else if (v === '.white' || v === 'Color.white') out = '#FFFFFF';
  else if (v === '.black' || v === 'Color.black') out = '#000000';
  else out = {ref: v};
  ultraDark[m[1]] = out;
}

// 4. Fixed colors: `static let foo = Color(hex: 0x..)`
const fixed = {};
for (const m of all(/static let (\w+)\s*= Color\(hex: (0x[0-9A-Fa-f]+)\)/g)) fixed[m[1]] = hex(m[2]);
for (const m of all(/static let (\w+Hex) = (0x[0-9A-Fa-f]+)\s*$/gm)) fixed[m[1]] = hex(m[2]);

// 5. Accent defaults
const accentDark = src.match(/defaultAccentDarkHex = (0x[0-9A-Fa-f]+)/);
const accentLight = src.match(/defaultAccentLightHex = (0x[0-9A-Fa-f]+)/);

// 6. Numeric constants (tints, spacing, radii, widths)
const numbers = {};
for (const m of all(/static let (\w+): (?:Double|CGFloat) = ([\d.]+)/g)) numbers[m[1]] = +m[2];

// 7. Typography helpers: `static func title1() -> Font { font(size: 26, weight: .bold) }`
const type = {};
for (const m of all(/static func (\w+)\(\) -> Font \{ font\(size: (\d+)(?:, weight: \.(\w+))?\) \}/g)) {
  type[m[1]] = {size: +m[2], weight: m[3] ?? 'regular'};
}
const largeTitle = src.match(/case \.largeTitle: return font\(size: (\d+), weight: \.(\w+)\)/);
if (largeTitle) type.largeTitle = {size: +largeTitle[1], weight: largeTitle[2]};

const required = {
  adaptive: ['backgroundDeep', 'backgroundBase', 'backgroundRaised', 'backgroundHover', 'surfacePrimary', 'surfaceSelected', 'destructiveText', 'successText', 'warningText'],
  alpha: ['surfaceBorder', 'textPrimary', 'textSecondary', 'textTertiary'],
  fixed: ['recording', 'transcribing', 'success', 'recordingFillHex', 'joinActionHex', 'joinActionSecondaryHex', 'darkInkHex'],
  numbers: ['accentTintRest', 'accentTintHover', 'accentTintPressed', 'accentShadeHover', 'accentShadePressed', 'destructiveTintRest', 'destructiveTintHover', 'destructiveTintPressed', 'pageTop', 'pageInset', 'readingWidth', 'spacing4', 'spacing8', 'spacing12', 'spacing16', 'spacing20', 'spacing24', 'spacing32', 'cornerSmall', 'cornerMedium', 'cornerLarge', 'cornerXL'],
  type: ['title1', 'title2', 'title3', 'headline', 'reading', 'body', 'callout', 'caption', 'captionMedium', 'sectionHeading', 'metadata'],
};
const groups = {adaptive, alpha, fixed, numbers, type};
const missing = Object.entries(required).flatMap(([g, keys]) => keys.filter((k) => !(k in groups[g])).map((k) => `${g}.${k}`));
if (!accentDark || !accentLight) missing.push('defaultAccent');
if (missing.length) {
  console.error(`MuesliTheme.swift at ${ref} is missing expected roles:\n  ${missing.join('\n  ')}\nUpdate extract-tokens.mjs for the new theme structure.`);
  process.exit(1);
}

const data = {
  source: {repo: 'Muesli-HQ/muesli', ref, commit, file: themePath},
  adaptive, alpha, ultraDark, fixed,
  defaultAccent: {dark: hex(accentDark[1]), light: hex(accentLight[1])},
  numbers, type,
};
const out = join(dirname(fileURLToPath(import.meta.url)), '../src/tokens/generated.ts');
writeFileSync(out, `// GENERATED by ui-kit/scripts/extract-tokens.mjs from ${themePath} @ ${ref} (${commit.slice(0, 10)}).\n// Do not edit by hand; re-run the script for a new release.\n\nexport const generated = ${JSON.stringify(data, null, 2)} as const;\n`);
console.log(`tokens: ${Object.keys(adaptive).length} adaptive, ${Object.keys(alpha).length} alpha, ${Object.keys(ultraDark).length} ultra-dark, ${Object.keys(fixed).length} fixed, ${Object.keys(numbers).length} numbers, ${Object.keys(type).length} type → ${out}`);
