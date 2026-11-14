// MeetingNotesView.swift @ v0.8.6 — line-by-line Markdown notes in a 720pt reading column,
// plus the RelatedMeetingsSection footer (MeetingDetailView.swift) when meetings share people.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {layout, spacing} from '../../tokens/theme';
import {type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {glyphs, type GlyphKey} from '../../icons/generated';
import {lineSpaced} from './parts';
import {renderInline} from './inline';

export interface RelatedMeeting {
  title: string;
  sharedNames: string[];
  startLabel: string;
}

export interface MeetingNotesProps {
  markdown: string;
  /** Line index tinted surfaceSelected (a chat citation's referenced passage). */
  highlightedLine?: number;
  /** Lines shown so far (for a "notes being written" reveal). Defaults to all. */
  visibleLines?: number;
  /** RelatedMeetingsSection rows ("Meetings with shared people"). */
  related?: RelatedMeeting[];
  scrollY?: number;
}

const READING = 15; // MuesliTheme.reading()
// Nunito Sans ascent: the first baseline sits this far below the text's top (lineSpaced trims the extra).
const BASELINE = 1.011 * READING;

/** indentLevel: leading spaces (tab = 4) / 2, capped at 4. */
const indentLevel = (raw: string) => {
  let n = 0;
  for (const ch of raw) {
    if (ch === ' ') n += 1;
    else if (ch === '\t') n += 4;
    else break;
  }
  return Math.min(Math.floor(n / 2), 4);
};

const ListIcon: React.FC<{name?: string; color: string}> = ({name, color}) => {
  const {colors} = useMuesliTheme();
  if (!name) {
    // Circle 4×4 textTertiary, .offset(y: -2), sitting on the first baseline.
    return (
      <div style={{width: 14, flex: 'none', position: 'relative', alignSelf: 'stretch'}}>
        <div style={{position: 'absolute', left: 5, top: BASELINE - 4 - 2, width: 4, height: 4, borderRadius: '50%', background: colors.textTertiary}} />
      </div>
    );
  }
  // Image(systemName:).font(.system(size: 12)) on the first text baseline. VERIFY symbol baseline offset.
  const g = glyphs[`${name}@regular` as GlyphKey];
  const h = g ? g.h * 12 : 12;
  return (
    <div style={{width: 14, flex: 'none', position: 'relative', alignSelf: 'stretch'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: BASELINE - h + 1.5, display: 'flex', justifyContent: 'center'}}>
        <Symbol name={name} size={12} weight="regular" color={color} />
      </div>
    </div>
  );
};

const NotesLine: React.FC<{raw: string}> = ({raw}) => {
  const {colors} = useMuesliTheme();
  const line = raw.trim();
  const indent = indentLevel(raw) * spacing[20];
  const inline = (t: string) => renderInline(t, {linkColor: colors.accent});
  const textStyle: React.CSSProperties = {...type.reading, color: colors.textPrimary, ...lineSpaced(READING, 5), flex: 1, minWidth: 0};

  if (line === '') return <div style={{height: spacing[8]}} />;
  if (line.startsWith('# ')) return <div style={{...type.title1, color: colors.textPrimary, paddingTop: spacing[8]}}>{line.slice(2)}</div>;
  if (line.startsWith('## ')) return <div style={{...type.title3, color: colors.textPrimary, paddingTop: spacing[12]}}>{line.slice(3)}</div>;
  if (line.startsWith('### ')) return <div style={{...type.headline, color: colors.textPrimary, paddingTop: spacing[4]}}>{line.slice(4)}</div>;

  const listRow = (text: string, icon?: string, iconColor = colors.textTertiary) => (
    <div style={{display: 'flex', gap: spacing[8], paddingLeft: indent}}>
      <ListIcon name={icon} color={iconColor} />
      <div style={textStyle}>{inline(text)}</div>
    </div>
  );
  if (line.startsWith('- [ ] ')) return listRow(line.slice(6), 'square');
  if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) return listRow(line.slice(6), 'checkmark.square', colors.success);
  if (line.startsWith('- ')) return listRow(line.slice(2));

  const numbered = line.match(/^(\d+\.)\s+(.+)$/);
  if (numbered) {
    return (
      <div style={{display: 'flex', alignItems: 'baseline', gap: spacing[8], paddingLeft: indent}}>
        <span style={{...type.reading, color: colors.textTertiary, width: 22, textAlign: 'right', flex: 'none'}}>{numbered[1]}</span>
        <div style={textStyle}>{inline(numbered[2])}</div>
      </div>
    );
  }
  return <div style={textStyle}>{inline(line)}</div>;
};

export const MeetingNotes: React.FC<MeetingNotesProps> = ({markdown, highlightedLine, visibleLines, related, scrollY = 0}) => {
  const {colors} = useMuesliTheme();
  const lines = markdown.split('\n');
  const shown = visibleLines === undefined ? lines : lines.slice(0, visibleLines);
  return (
    <div style={{width: '100%', height: '100%', overflow: 'hidden'}}>
      <div style={{transform: `translateY(${-scrollY}px)`, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            width: '100%',
            maxWidth: layout.readingWidth + spacing[24] * 2,
            boxSizing: 'border-box',
            padding: `${spacing[16]}px ${spacing[24]}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[4],
          }}
        >
          {shown.map((l, i) => (
            <div key={i} style={{background: i === highlightedLine ? colors.surfaceSelected : 'transparent'}}>
              <NotesLine raw={l} />
            </div>
          ))}
          {related && related.length > 0 && (visibleLines === undefined || visibleLines >= lines.length) && (
            <div style={{paddingTop: spacing[24], display: 'flex', flexDirection: 'column', gap: spacing[8]}}>
              <div style={{...type.title3, color: colors.textPrimary}}>Meetings with shared people</div>
              {related.slice(0, 5).map((r, i) => (
                <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 3}}>
                  <span style={{...type.body, color: colors.textPrimary}}>{r.title}</span>
                  <span style={{...type.caption, color: colors.textSecondary}}>{`${r.sharedNames.join(', ')} · ${r.startLabel}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
