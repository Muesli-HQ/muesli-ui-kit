// Inline Markdown, as Foundation's `AttributedString(markdown:, .inlineOnlyPreservingWhitespace)`
// renders it in SwiftUI Text (MarkdownInlineParser.swift, AIResponse.swift @ v0.8.6):
// **strong** → bold face, *emphasis* → italic, `code` → system monospace, [text](url) → link in the
// window tint (DashboardRootView sets `.tint(MuesliTheme.accent)`). VERIFY link colour on macOS 26.
import React from 'react';
import {monoFontStack} from '../../fonts';

export interface InlineOptions {
  linkColor: string;
  /** Called for each link; return a node to replace the default link rendering (e.g. citations). */
  renderLink?: (text: string, href: string, key: number) => React.ReactNode | undefined;
}

const TOKEN = /(\[\[[^\]]+\]\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|_[^_\s][^_]*_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export function renderInline(text: string, opts: InlineOptions): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const t = m[0];
    if (t.startsWith('**') || t.startsWith('__')) {
      out.push(<strong key={key++} style={{fontWeight: 700}}>{renderInline(t.slice(2, -2), opts)}</strong>);
    } else if (t.startsWith('`')) {
      out.push(<code key={key++} style={{fontFamily: monoFontStack, fontSize: '0.92em'}}>{t.slice(1, -1)}</code>);
    } else if (t.startsWith('[')) {
      // `[[n]](href)` (chat citation: link text "[n]") or `[text](href)`.
      const lm = t.match(/^\[(\[[^\]]+\]|[^\]]+)\]\(([^)]+)\)$/);
      if (lm) {
        const custom = opts.renderLink?.(lm[1], lm[2], key);
        out.push(custom ?? <span key={key} style={{color: opts.linkColor}}>{lm[1]}</span>);
        key++;
      } else out.push(t);
    } else {
      out.push(<em key={key++} style={{fontStyle: 'italic'}}>{renderInline(t.slice(1, -1), opts)}</em>);
    }
    last = idx + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
