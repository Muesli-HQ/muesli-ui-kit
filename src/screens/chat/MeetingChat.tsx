// MeetingChatView.swift @ v0.8.6 (+ MeetingChatResponseView, MeetingChatCitationView's
// MeetingChatSourcesView, MeetingChatAttachmentPreview, HoverMessageActions, MeetingChatCopyButton,
// MeetingChatWaitingLabel). Three presentations:
//  - index (Chat tab, no conversation): header, "Chat" title, Recent chats, composer
//  - conversation (Chat tab): header with "← Chat", turns (user bubble, answer with [n] citations,
//    Sources disclosure, Copy / Export), composer
//  - docked (DashboardRootView `.safeAreaInset(edge: .bottom)` on Timeline, Dictations, Meetings):
//    a compact composer pill, or an expanded backgroundDeep card with a 260pt conversation.
// The composer editor is an NSTextView (MeetingChatComposerEditor). Idle metrics are measured from
// the reference captures; the focused caret is not captured — VERIFY.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {AIIcon} from './AIIcon';
import {
  AIAttachment,
  AIAttachmentPreview,
  AIDisclosure,
  AIMessage,
  AIPromptInput,
  AIResponse,
  AIShimmer,
  AISourcePassage,
  AITool,
} from './aiElements';
import {MenuIndicator, clamp, lineSpaced, oneLine} from '../meetings/parts';
import {SOURCE_KIND_LABEL, type ChatActivity, type ChatCitation, type ChatFile, type ChatSession, type ChatSourceChoice, type ChatTurn} from './types';

// MARK: - Props

export type ComposerControl = 'at' | 'scope' | 'model' | 'plus' | 'attach' | 'send';
export type HeaderControl = 'back' | 'history' | 'skills' | 'open' | 'toggle' | 'newChat';

export interface ChatComposerProps {
  /** Text typed so far (animate by slicing). */
  text?: string;
  focused?: boolean;
  /** Draw the NSTextView insertion point at the end of the text (blink by toggling). */
  caretVisible?: boolean;
  /** Files attached to the draft (MeetingChatAttachmentPreview cards). */
  files?: ChatFile[];
  /** Meetings attached via @ or the docked page's suggested scope (AIAttachment chips). */
  attachedMeetings?: string[];
  /**
   * Scope button label when no meetings are attached: "Saved history" (new draft, default),
   * "All saved meetings", "<Folder> · This folder only", "N selected meetings", "Choose meetings".
   */
  scopeLabel?: string;
  /** MeetingChatScopePresentation.dateLabel, e.g. "Nov 2, 2026 – Nov 8, 2026". */
  dateLabel?: string;
  /** MeetingTextGenerationClient.model(config): the raw model ID, e.g. "gpt-6.1-sol". */
  modelLabel?: string;
  /** Reasoning effort label for ChatGPT/OpenAI, e.g. "Medium"; null hides it. */
  thinkingLabel?: string | null;
  /** A request is running: Stop replaces Send and footer controls disable. */
  busy?: boolean;
  error?: string;
  hovered?: ComposerControl;
  pressed?: ComposerControl;
  /** "@" suggestions above the composer. */
  mention?: {query: string; matches: ChatSourceChoice[]; index: number; attachedIds?: number[]};
}

export interface MeetingChatProps {
  docked?: boolean;
  /** Docked only: the bar is expanded into the conversation card. */
  expanded?: boolean;
  sessions: ChatSession[];
  /** The open conversation; undefined shows the index (or a fresh draft when docked). */
  selectedSessionId?: string;
  turns?: ChatTurn[];
  /** Live state of the newest turn while it is pending / just finished (activityTurnID). */
  phase?: string;
  activities?: ChatActivity[];
  activitiesExpanded?: boolean;
  /** Characters of the newest turn's answer shown so far. 0.8.6 writes the answer in one piece; use for a type-on. */
  revealedChars?: number;
  /** Turn id whose Sources disclosure is open. */
  expandedSourcesTurnId?: string;
  /** Turn id + side whose hover actions (Copy / Export) are visible. */
  hoveredMessage?: {turnId: string; role: 'user' | 'assistant'};
  /** AIShimmer sweep phase 0…1 for pending labels. */
  shimmerSweep?: number;
  composer?: ChatComposerProps;
  headerHovered?: HeaderControl;
  /** Recent chats row hovered on the index (session id). */
  hoveredSessionId?: string;
  /** Conversation scroll offset (points). */
  scrollY?: number;
  /** A popover or menu anchored above the composer (model picker, quick actions). */
  composerOverlay?: React.ReactNode;
  /** Distance of the overlay's right edge from the composer's right edge. */
  composerOverlayRight?: number;
  /** Popover anchored over the conversation (citation). */
  conversationOverlay?: React.ReactNode;
}

// MARK: - Small pieces

const quietFg = (c: ReturnType<typeof useMuesliTheme>['colors']) => c.textPrimary;
const st = (hovered: boolean, pressed?: boolean): ControlState => (pressed ? 'pressed' : hovered ? 'highlighted' : 'rest');

/** Label { Text } icon: { … } — SwiftUI's title-and-icon spacing. Measured from reference ("New chat", "Skills"): 8pt. */
const IconLabel: React.FC<{icon: React.ReactNode; text: string; gap?: number; style?: React.CSSProperties}> = ({icon, text, gap = 8, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap, ...style}}>
    {icon}
    <span>{text}</span>
  </span>
);

/** `.menuStyle(.borderlessButton)` menu (label glyphs in the accent tint + chevron), measured on Meetings. */
const MenuChevron = MenuIndicator;

// MARK: - Header

const ChatHeader: React.FC<{docked: boolean; expanded: boolean; inConversation: boolean; sessionTitle?: string; hovered?: HeaderControl}> = ({
  docked,
  expanded,
  inConversation,
  sessionTitle,
  hovered,
}) => {
  const {colors} = useMuesliTheme();
  const fg = quietFg(colors);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', background: docked ? colors.backgroundDeep : colors.backgroundBase, flex: 'none'}}>
      {!docked && inConversation && (
        <>
          <Button kind="quiet" state={st(hovered === 'back')}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 8px', minHeight: 32, color: fg, ...type.body}}>
              <AIIcon name="arrowLeft" color={fg} />
              <span>Chat</span>
            </span>
          </Button>
          <div style={{width: 1, height: 16, background: colors.surfaceBorder, flex: 'none'}} />
        </>
      )}
      <Button kind="quiet" state={st(hovered === 'history')} style={{width: 32, height: 32}}>
        <AIIcon name="clock" color={fg} />
      </Button>
      {/* Menu { skills } label: { Label("Skills", systemImage: "sparkles") }.buttonStyle(.muesli(.quiet)).
          Measured from reference: no pull-down chevron, label in textPrimary, no extra inset. */}
      <Button kind="quiet" state={st(hovered === 'skills')}>
        <span style={{display: 'inline-flex', alignItems: 'center', height: 28, color: fg, ...type.body}}>
          <IconLabel icon={<Symbol name="sparkles" size={14} weight="regular" color={fg} />} text="Skills" />
        </span>
      </Button>
      {docked ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0}}>
          <span style={{...font(13, 'semibold'), color: colors.textPrimary}}>Chat</span>
          {sessionTitle && <span style={{...type.caption, color: colors.textSecondary, ...oneLine}}>{sessionTitle}</span>}
        </div>
      ) : (
        <span style={{...font(13, 'medium'), color: colors.textSecondary, ...oneLine}}>{sessionTitle ?? 'Chat'}</span>
      )}
      <div style={{flex: 1}} />
      {docked && (
        <>
          <Button kind="quiet" state={st(hovered === 'open')} style={{width: 32, height: 32}}>
            <AIIcon name="arrowUpRight" color={fg} />
          </Button>
          {(expanded || inConversation) && (
            <Button kind="quiet" state={st(hovered === 'toggle')} style={{width: 32, height: 32}}>
              <AIIcon name={expanded ? 'chevronDown' : 'chevronUp'} color={fg} />
            </Button>
          )}
        </>
      )}
      <Button kind="quiet" state={st(hovered === 'newChat')}>
        <span style={{display: 'inline-flex', alignItems: 'center', padding: '0 8px', height: 32, color: fg, ...type.body}}>
          <IconLabel icon={<AIIcon name="squarePen" color={fg} />} text="New chat" />
        </span>
      </Button>
    </div>
  );
};

// MARK: - Recent chats (index)

const RecentChats: React.FC<{sessions: ChatSession[]; hoveredId?: string}> = ({sessions, hoveredId}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: '0 24px 24px'}}>
      {sessions.length === 0 ? (
        <span style={{...type.body, color: colors.textSecondary}}>Your conversations will appear here.</span>
      ) : (
        <>
          <span style={{...type.caption, color: colors.textSecondary, paddingTop: 16}}>Recent chats</span>
          {sessions.map((s) => (
            <div key={s.id} style={{margin: '0 -8px'}}>
              <Button kind="quiet" compresses={false} state={hoveredId === s.id ? 'highlighted' : 'rest'} style={{display: 'flex', justifyContent: 'stretch'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', width: '100%', color: colors.textPrimary}}>
                  <AIIcon name="clock" color={colors.textSecondary} />
                  <span style={{...type.body, ...oneLine}}>{s.title}</span>
                  <div style={{flex: 1}} />
                  <span style={{...type.caption, color: colors.textTertiary, flex: 'none'}}>{s.dateLabel}</span>
                </div>
              </Button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// MARK: - Turn

/** Replace `[[key]]` with `[[n]](muesli-citation:///key)` in citation order (MeetingChatView.attributedAnswer). */
function linkCitations(answer: string, citations: ChatCitation[]): string {
  let md = answer;
  citations.forEach((c, i) => {
    md = md.split(`[[${c.key}]]`).join(`[[${i + 1}]](muesli-citation:///${c.key})`);
  });
  return md;
}

/** Hide a half-typed `[[…` marker or `[x](…` link at the reveal edge. */
function revealSlice(md: string, chars?: number): string {
  if (chars === undefined || chars >= md.length) return md;
  let s = md.slice(0, Math.max(0, chars));
  s = s.replace(/\[\[[^\]]*\]?\]?(\([^)]*)?$/, '').replace(/\[[^\]]*\]?(\([^)]*)?$/, '');
  return s;
}

/** MeetingChatSourceGroup.grouped + label */
function groupSources(citations: ChatCitation[]) {
  const groups: {id: number; title: string; dateLabel: string; passages: {number: number; c: ChatCitation}[]}[] = [];
  citations.forEach((c, i) => {
    let g = groups.find((x) => x.id === c.meetingId);
    if (!g) {
      g = {id: c.meetingId, title: c.title, dateLabel: c.dateLabel, passages: []};
      groups.push(g);
    }
    g.passages.push({number: i + 1, c});
  });
  return groups;
}
export const sourcesLabel = (citations: ChatCitation[]) => {
  const meetings = new Set(citations.map((c) => c.meetingId)).size;
  return `${meetings} meeting${meetings === 1 ? '' : 's'} · ${citations.length} passage${citations.length === 1 ? '' : 's'}`;
};

const SourcesView: React.FC<{citations: ChatCitation[]; expanded: boolean}> = ({citations, expanded}) => {
  const {colors} = useMuesliTheme();
  return (
    <AIDisclosure title={sourcesLabel(citations)} icon="bookOpen" expanded={expanded}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8}}>
        {groupSources(citations).map((g) => (
          <div key={g.id} style={{display: 'flex', flexDirection: 'column', gap: 7}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
              <AIIcon name="fileText" size={15} color={colors.textSecondary} style={{alignSelf: 'center'}} />
              <span style={{...font(13, 'medium'), color: colors.textPrimary, ...clamp(2)}}>{g.title}</span>
              <div style={{flex: 1}} />
              <span style={{...type.metadata, color: colors.textSecondary, flex: 'none'}}>{g.dateLabel}</span>
            </div>
            {g.passages.map((p) => (
              <AISourcePassage
                key={p.c.key}
                number={p.number}
                metadata={SOURCE_KIND_LABEL[p.c.kind] + (p.c.timestamp ? ` · ${p.c.timestamp}` : '')}
                preview={p.c.excerpt.split(/\s+/).join(' ')}
              />
            ))}
          </div>
        ))}
      </div>
    </AIDisclosure>
  );
};

const FilePreviews: React.FC<{files: ChatFile[]; editable: boolean}> = ({files, editable}) => {
  const visual = files.some((f) => f.kind === 'pdf' || f.kind === 'image');
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 8, height: visual ? 180 : 76, overflow: 'hidden'}}>
      {files.map((f) => (
        <AIAttachmentPreview
          key={f.id}
          title={f.name}
          detail={`${{pdf: 'PDF', image: 'Image', markdown: 'Markdown', text: 'Text'}[f.kind]} · ${f.sizeLabel}`}
          icon={f.kind === 'image' ? 'image' : 'fileText'}
          thumbnail={f.thumbnail}
          showsPreview={f.kind === 'pdf' || f.kind === 'image'}
          removable={editable}
        />
      ))}
    </div>
  );
};

/** MeetingChatCopyButton: Label("Copy", AIIcon.copy), minWidth 64, caption, textSecondary, borderless. */
const CopyAction: React.FC = () => {
  const {colors} = useMuesliTheme();
  return (
    <span style={{minWidth: 64, display: 'inline-flex', color: colors.textSecondary, ...type.caption}}>
      <IconLabel icon={<AIIcon name="copy" color={colors.textSecondary} />} text="Copy" />
    </span>
  );
};

const TurnView: React.FC<{
  turn: ChatTurn;
  isActivityTurn: boolean;
  phase?: string;
  activities?: ChatActivity[];
  activitiesExpanded?: boolean;
  revealedChars?: number;
  sourcesExpanded: boolean;
  hoveredRole?: 'user' | 'assistant';
  shimmerSweep?: number;
}> = ({turn, isActivityTurn, phase, activities = [], activitiesExpanded, revealedChars, sourcesExpanded, hoveredRole, shimmerSweep}) => {
  const {colors} = useMuesliTheme();
  const pending = turn.state === 'finding' || turn.state === 'writing';
  const answerFull = turn.answer ? linkCitations(turn.answer, turn.citations) : undefined;
  const answer = answerFull !== undefined ? revealSlice(answerFull, revealedChars) : undefined;
  const answerDone = answerFull !== undefined && (revealedChars === undefined || revealedChars >= answerFull.length);
  const hasFiles = !!turn.files && turn.files.length > 0;
  const waiting = phase ?? (turn.state === 'finding' ? 'Finding meeting context' : 'Thinking…');
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 20, width: '100%'}}>
      {/* HoverMessageActions(alignment: .trailing) */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4}}>
        <div style={{width: hasFiles ? '100%' : undefined, maxWidth: '100%'}}>
          <AIMessage role="user">
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, width: hasFiles ? '100%' : undefined}}>
              {hasFiles && <FilePreviews files={turn.files!} editable={false} />}
              <span style={{...type.body, color: colors.textPrimary, ...lineSpaced(14, 4)}}>{turn.question}</span>
            </div>
          </AIMessage>
        </div>
        <div style={{opacity: hoveredRole === 'user' ? 1 : 0}}>
          <CopyAction />
        </div>
      </div>

      {/* HoverMessageActions(alignment: .leading) */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4}}>
        <AIMessage role="assistant">
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            {pending && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0'}}>
                <AIShimmer text={waiting} sweep={shimmerSweep} style={{...type.callout, color: colors.textSecondary}} />
                {isActivityTurn && activities.length > 0 && (
                  <AIDisclosure title={`${activities.length} research steps`} icon="search" expanded={activitiesExpanded}>
                    <ActivityRows activities={activities} />
                  </AIDisclosure>
                )}
              </div>
            )}
            {!pending && isActivityTurn && activities.length > 0 && (
              <AIDisclosure title={`Research · ${activities.length} steps`} icon="search" expanded={activitiesExpanded}>
                <ActivityRows activities={activities} />
              </AIDisclosure>
            )}
            {answer !== undefined && (
              <>
                <AIResponse
                  markdown={answer}
                  renderLink={(text, href, key) =>
                    href.startsWith('muesli-citation:') ? (
                      <span key={key} style={{color: colors.accent}}>
                        {text}
                      </span>
                    ) : undefined
                  }
                />
                {answerDone && turn.citations.length > 0 && <SourcesView citations={turn.citations} expanded={sourcesExpanded} />}
              </>
            )}
            {answer === undefined && !pending && (
              <span style={{...type.callout, color: colors.textSecondary}}>
                <IconLabel
                  icon={<AIIcon name="circleAlert" color={colors.textSecondary} />}
                  text={turn.error ?? (turn.state === 'stopped' ? 'Request stopped' : 'Request interrupted')}
                />
              </span>
            )}
          </div>
        </AIMessage>
        {answer !== undefined && (
          <div style={{opacity: hoveredRole === 'assistant' && answerDone ? 1 : 0, display: 'flex', alignItems: 'center', gap: 14, color: colors.textSecondary, ...type.caption}}>
            <CopyAction />
            {/* Menu … .menuStyle(.borderlessButton): label in the accent tint + chevron (as measured on Meetings). VERIFY. */}
            <span style={{display: 'inline-flex', alignItems: 'center', color: colors.accent}}>
              <IconLabel icon={<AIIcon name="download" color={colors.accent} />} text="Export" />
              <MenuChevron color={colors.accent} />
            </span>
            {turn.hasEditedDraft && <AIIcon name="check" color={colors.textSecondary} />}
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityRows: React.FC<{activities: ChatActivity[]}> = ({activities}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
    {activities.map((a, i) => (
      <AITool key={i} title={a.title} state={a.state} />
    ))}
  </div>
);

// MARK: - Composer

/** NSTextView insertion point (controlAccentColor). VERIFY width and system accent on macOS 26. */
const Caret: React.FC = () => {
  const {isDark} = useMuesliTheme();
  return <span style={{display: 'inline-block', width: 2, height: 17, marginBottom: -3, marginLeft: 0.5, background: isDark ? '#0A84FF' : '#007AFF', borderRadius: 1}} />;
};

const MentionSuggestions: React.FC<{mention: NonNullable<ChatComposerProps['mention']>; scoped: boolean}> = ({mention, scoped}) => {
  const {colors} = useMuesliTheme();
  return (
    <div style={{background: colors.backgroundBase, borderRadius: 12, overflow: 'hidden', boxShadow: `inset 0 0 0 1px ${colors.surfaceBorder}`}}>
      <div style={{display: 'flex', alignItems: 'center', padding: 12}}>
        <span style={{...font(12, 'semibold'), color: colors.textPrimary}}>
          <IconLabel icon={<AIIcon name="atSign" color={colors.textPrimary} />} text="Attach a meeting" />
        </span>
        <div style={{flex: 1}} />
        <span style={{...font(10), color: colors.textSecondary}}>↑↓ Choose · ↵ Attach · Esc Close</span>
      </div>
      <div style={{height: 1, background: colors.surfaceBorder}} />
      {mention.matches.length === 0 ? (
        <div style={{...type.callout, color: colors.textSecondary, padding: 14}}>{`No saved meetings match “${mention.query}”.`}</div>
      ) : (
        <div style={{height: Math.min(mention.matches.length, 3) * 53, overflow: 'hidden'}}>
          {mention.matches.map((m, i) => (
            <div key={m.id} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: i === mention.index ? colors.surfaceSelected : 'transparent'}}>
              <AIIcon name="fileText" color={colors.textSecondary} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0}}>
                <span style={{...font(13, 'medium'), color: colors.textPrimary, ...oneLine}}>{m.title}</span>
                <span style={{...type.caption, color: colors.textSecondary}}>{m.dateLabel}</span>
              </div>
              <div style={{flex: 1}} />
              {mention.attachedIds?.includes(m.id) && <AIIcon name="check" color={colors.textSecondary} />}
            </div>
          ))}
        </div>
      )}
      {!scoped && (
        <>
          <div style={{height: 1, background: colors.surfaceBorder}} />
          <div style={{...type.caption, color: colors.textSecondary, padding: 10}}>Attaching a meeting narrows this chat to attached meetings and clears date filters.</div>
        </>
      )}
    </div>
  );
};

export const ChatComposer: React.FC<ChatComposerProps & {compact: boolean; overlay?: React.ReactNode; overlayRight?: number}> = ({
  text = '',
  focused = false,
  caretVisible,
  files = [],
  attachedMeetings = [],
  scopeLabel = 'Saved history',
  dateLabel,
  modelLabel = 'gpt-6.1-sol',
  thinkingLabel = 'Medium',
  busy = false,
  error,
  hovered,
  pressed,
  mention,
  compact,
  overlay,
  overlayRight = 0,
}) => {
  const {colors} = useMuesliTheme();
  const fg = quietFg(colors);
  const disabled = busy;
  const canSend = !disabled && (text.trim() !== '' || files.length > 0);
  const s = (c: ComposerControl): ControlState => (disabled && c !== 'send' ? 'disabled' : st(hovered === c, pressed === c));
  const showCaret = caretVisible ?? focused;
  // Quiet labels dim to 0.45 when disabled (MuesliButtonChrome.styledLabel).
  const dim = (c: ComposerControl) => (s(c) === 'disabled' ? 0.45 : 1);

  const editor = (
    // MeetingChatComposerLayout.height: min(144, max(34, ceil(lineHeight) + 16)) — one Nunito 14 line → 36pt.
    // Measured from reference (docked pill, Chat tab): pill 44pt tall incl. 1pt stroke, fill backgroundRaised,
    // radius 24 (capsule at this height), placeholder textTertiary with its top 9pt below the editor top, 5pt in.
    <div style={{position: 'relative', minHeight: 36, padding: '9px 5px 7px', boxSizing: 'border-box', ...font(14), color: colors.textPrimary, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 144, overflow: 'hidden'}}>
      {text === '' && (
        <span style={{position: 'absolute', left: 5, top: 9, ...type.body, color: colors.textTertiary, pointerEvents: 'none'}}>What’s on your mind? Type / for skills.</span>
      )}
      <span>{text}</span>
      {showCaret && <Caret />}
    </div>
  );

  const footer = (
    <div style={{display: 'flex', alignItems: 'center', gap: 2, marginLeft: -6}}>
      <Button kind="quiet" state={s('at')} style={{width: 28, height: 28, opacity: dim('at')}}>
        <AIIcon name="atSign" color={fg} />
      </Button>
      <Button kind="quiet" state={s('scope')} style={{opacity: dim('scope'), minWidth: 0}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 6px', height: 28, color: fg, minWidth: 0}}>
          <AIIcon name="slidersHorizontal" color={fg} />
          {attachedMeetings.length === 0 && <span style={{...type.caption, ...oneLine}}>{scopeLabel}</span>}
          {dateLabel && <span style={{...type.caption, ...oneLine}}>{dateLabel}</span>}
        </span>
      </Button>
      <div style={{flex: 1, minWidth: 4}} />
      <Button kind="quiet" state={s('model')} style={{opacity: dim('model')}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 6px', height: 28, color: colors.textSecondary, ...type.caption}}>
          <span style={oneLine}>{modelLabel}</span>
          {thinkingLabel && <span style={{color: colors.textSecondary, ...oneLine}}>{'· ' + thinkingLabel}</span>}
          <AIIcon name="chevronDown" size={10} color={colors.textSecondary} />
        </span>
      </Button>
      {/* Menu { quick actions } label: { AIIcon(.plus) }.menuStyle(.borderlessButton): accent tint + chevron,
          5.5pt insets, as measured on the Meetings sort menu. VERIFY (composer footer not in the reference). */}
      <span style={{display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 5.5px', opacity: dim('plus')}}>
        <AIIcon name="plus" color={colors.accent} />
        <MenuChevron color={colors.accent} />
      </span>
      <Button kind="quiet" state={s('attach')} style={{width: 28, height: 28, opacity: dim('attach')}}>
        <AIIcon name="paperclip" color={colors.textSecondary} />
      </Button>
      {busy ? (
        <Button kind="secondary" shape={{kind: 'circle'}} state={st(hovered === 'send', pressed === 'send')} style={{width: 32, height: 32, flex: 'none'}}>
          <AIIcon name="square" color={colors.textPrimary} />
        </Button>
      ) : (
        // Disabled primary: surfacePrimary fill, textTertiary glyph, full opacity (MuesliButtonChrome).
        <Button
          kind="primary"
          shape={{kind: 'circle'}}
          state={canSend ? st(hovered === 'send', pressed === 'send') : 'disabled'}
          style={{width: 32, height: 32, flex: 'none', opacity: 1}}
        >
          <AIIcon name="arrowUp" size={16} color={canSend ? colors.onAccent : colors.textTertiary} />
        </Button>
      )}
    </div>
  );

  const header =
    attachedMeetings.length > 0 || files.length > 0 ? (
      <>
        {attachedMeetings.length > 0 && (
          <div style={{display: 'flex', alignItems: 'center', gap: 6, height: 30, overflow: 'hidden'}}>
            {attachedMeetings.map((t, i) => (
              <AIAttachment key={i} title={t} />
            ))}
          </div>
        )}
        {files.length > 0 && <FilePreviews files={files} editable />}
      </>
    ) : null;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 24px 12px', position: 'relative', flex: 'none'}}>
      {overlay && <div style={{position: 'absolute', right: 24 + overlayRight, bottom: '100%', zIndex: 5}}>{overlay}</div>}
      {error && <span style={{...type.callout, color: colors.warningText}}>{error}</span>}
      {mention && <MentionSuggestions mention={mention} scoped={attachedMeetings.length > 0} />}
      <AIPromptInput focused={focused} compact={compact} header={header} editor={editor} footer={footer} />
      {files.length > 0 && (
        <span style={{...type.caption, color: colors.textSecondary}}>
          Originals stay in place. Your selected AI provider receives images and the document pages it requests. PDF page images need a vision-capable model.
        </span>
      )}
      {!compact && <span style={{...font(10), color: colors.textSecondary, textAlign: 'right'}}>↵ Send · ⇧↵ New line</span>}
    </div>
  );
};

// MARK: - MeetingChat

export const MeetingChat: React.FC<MeetingChatProps> = ({
  docked = false,
  expanded = false,
  sessions,
  selectedSessionId,
  turns = [],
  phase,
  activities,
  activitiesExpanded,
  revealedChars,
  expandedSourcesTurnId,
  hoveredMessage,
  shimmerSweep,
  composer = {},
  headerHovered,
  hoveredSessionId,
  scrollY = 0,
  composerOverlay,
  composerOverlayRight,
  conversationOverlay,
}) => {
  const {colors} = useMuesliTheme();
  const session = sessions.find((s) => s.id === selectedSessionId);
  const inConversation = selectedSessionId !== undefined;
  const c = composer;
  const compact =
    !c.focused && !(c.text ?? '') && !(c.files?.length ?? 0) && !c.busy && !expanded && !c.error && !composerOverlay;
  const showHeader = !docked || expanded || (!compact && inConversation);
  const showConversation = !docked ? inConversation : expanded && turns.length > 0;
  const lastId = turns[turns.length - 1]?.id;

  const conversation = (
    <div style={{position: 'relative', height: docked ? 260 : undefined, flex: docked ? 'none' : 1, minHeight: 0, overflow: 'hidden'}}>
      <div style={{transform: `translateY(${-scrollY}px)`, display: 'flex', justifyContent: 'center'}}>
        <div style={{width: '100%', maxWidth: 752, boxSizing: 'border-box', padding: 24, display: 'flex', flexDirection: 'column', gap: 28}}>
          {turns.map((t) => (
            <TurnView
              key={t.id}
              turn={t}
              isActivityTurn={t.id === lastId}
              phase={t.id === lastId ? phase : undefined}
              activities={t.id === lastId ? activities : undefined}
              activitiesExpanded={activitiesExpanded}
              revealedChars={t.id === lastId ? revealedChars : undefined}
              sourcesExpanded={expandedSourcesTurnId === t.id}
              hoveredRole={hoveredMessage?.turnId === t.id ? hoveredMessage.role : undefined}
              shimmerSweep={shimmerSweep}
            />
          ))}
        </div>
      </div>
      {conversationOverlay}
    </div>
  );

  const body = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: docked ? undefined : '100%',
        background: docked && expanded ? colors.backgroundDeep : colors.backgroundBase,
        borderRadius: docked && expanded ? 20 : 0,
        boxShadow: docked && expanded ? `inset 0 0 0 1px ${colors.surfaceBorder}` : undefined,
        overflow: docked && expanded ? 'hidden' : undefined,
      }}
    >
      {showHeader && <ChatHeader docked={docked} expanded={expanded} inConversation={inConversation} sessionTitle={session?.title} hovered={headerHovered} />}
      {docked && expanded && <div style={{height: 1, background: colors.surfaceBorder, flex: 'none'}} />}
      {!docked && !inConversation ? (
        <div style={{flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center'}}>
          <div style={{width: '100%', maxWidth: 752, paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 12}}>
            <div style={{...type.title1, color: colors.textPrimary, padding: '0 24px'}}>Chat</div>
            <RecentChats sessions={sessions} hoveredId={hoveredSessionId} />
          </div>
        </div>
      ) : (
        showConversation && conversation
      )}
      {!docked && inConversation && !showConversation && <div style={{flex: 1}} />}
      <ChatComposer {...c} compact={compact} overlay={composerOverlay} overlayRight={composerOverlayRight} />
    </div>
  );

  return (
    <div style={{background: colors.backgroundBase, height: docked ? undefined : '100%', padding: docked && expanded ? '12px 16px' : 0, flex: 'none', position: 'relative'}}>
      {body}
    </div>
  );
};

/**
 * DashboardRootView: on Timeline, Dictations and Meetings the detail VStack gets
 * `.safeAreaInset(edge: .bottom) { MeetingChatView(docked: true) }`, so the page ends above the bar.
 */
export const DockedChatLayout: React.FC<{page: React.ReactNode; chat: React.ReactNode}> = ({page, chat}) => (
  <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
    <div style={{flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden'}}>{page}</div>
    {chat}
  </div>
);
