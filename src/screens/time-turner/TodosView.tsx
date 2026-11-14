// TimeTurnerTodosView (TimeTurnerTodosView.swift @ v0.8.6).
// Card: padding 18, backgroundRaised, radius 16 (no stroke), maxWidth 820; VStack spacing 14.
// Row: HStack spacing 12, padding 10; focused row → accent @ 12% in an r8 rounded rect.
import React from 'react';
import {useMuesliTheme} from '../../theme/MuesliThemeProvider';
import {font, type} from '../../typography';
import {Symbol} from '../../icons/Icon';
import {Button, type ControlState} from '../../primitives/Button';
import {withAlpha} from '../../tokens/theme';
import {SMALL_CONTROL_SYMBOL_SIZE, MenuButton, NativeButton, NativeSymbol, Spinner, envFont, useLabelColors, type NativeState} from './native';
import {NativeMenuList, reminderMenuItems} from './RecapPopovers';

export interface TimeTurnerTodo {
  id: string;
  title: string;
  /** "6 Nov 2026 at 6:02 PM" → rendered as "Created …". */
  createdLabel: string;
  /** "7 Nov 2026 at 9:00 AM" → "Reminder …" (open to-dos only). */
  reminderLabel?: string;
  completed: boolean;
}

export interface TimeTurnerTodosProps {
  items: TimeTurnerTodo[];
  loaded?: boolean;
  /** appState.timeTurnerFocusedTodo (opened from a notification). */
  focusedId?: string;
  /** "Completed (n)" disclosure expanded. */
  showCompleted?: boolean;
  /** Trash button hover/press state per id (MuesliButtonStyle .quiet). */
  trashState?: Record<string, ControlState>;
  deletingIds?: string[];
  error?: string;
  /** Per-row control states, for videos: the plain check button dims while pressed. */
  controlStates?: Record<string, TodoControlStates>;
  /** Open reminder menu (pull-down under the bell) and its highlighted item. */
  reminderMenu?: {id: string; highlighted?: number};
}

export interface TodoControlStates {
  checkPressed?: boolean;
  bell?: NativeState;
  open?: NativeState;
}

const TodoRow: React.FC<{item: TimeTurnerTodo; focused: boolean; trashState: ControlState; deleting: boolean; controls?: TodoControlStates; menuHighlighted?: number | null}> = ({
  item,
  focused,
  trashState,
  deleting,
  controls = {},
  menuHighlighted = null,
}) => {
  const {colors} = useMuesliTheme();
  const label = useLabelColors();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 10,
        borderRadius: 8,
        background: focused ? withAlpha(colors.accent, 0.12) : 'transparent',
        opacity: deleting ? 0.45 : 1,
      }}
    >
      {/* plain button, no font → environment body (14) */}
      <span style={{display: 'flex', opacity: controls.checkPressed ? 0.7 : 1}}>
        <Symbol name={item.completed ? 'checkmark.circle.fill' : 'circle'} size={14} weight="regular" color={colors.textPrimary} />
      </span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0}}>
        <span style={{...type.body, color: colors.textPrimary, textDecoration: item.completed ? 'line-through' : undefined}}>{item.title}</span>
        <span style={{...type.caption, color: label.secondary}}>Created {item.createdLabel}</span>
        {item.reminderLabel && !item.completed ? <span style={{...type.caption, color: label.secondary}}>Reminder {item.reminderLabel}</span> : null}
      </div>
      <span style={{flex: 1}} />
      {!item.completed ? (
        <div style={{position: 'relative', display: 'flex'}}>
          <MenuButton symbol={item.reminderLabel ? 'bell.badge' : 'bell'} state={menuHighlighted !== null ? 'pressed' : controls.bell} />
          {menuHighlighted !== null ? (
            // Pull-down menu: opens under the control, left edges aligned.
            <div style={{position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 30}}>
              <NativeMenuList items={reminderMenuItems(!!item.reminderLabel)} highlighted={menuHighlighted < 0 ? undefined : menuHighlighted} width={150} />
            </div>
          ) : null}
        </div>
      ) : null}
      <NativeButton iconOnly size="small" state={controls.open}>
        <NativeSymbol name="arrow.up.forward.square" size={SMALL_CONTROL_SYMBOL_SIZE} color={colors.textPrimary} />
      </NativeButton>
      <Button kind="quiet" state={trashState} style={{width: 28, height: 28}}>
        {deleting ? <Spinner size={14} /> : <Symbol name="trash" size={12} weight="regular" color={colors.destructiveText} />}
      </Button>
    </div>
  );
};

export const TimeTurnerTodosView: React.FC<TimeTurnerTodosProps> = ({items, loaded = true, focusedId, showCompleted = false, trashState = {}, deletingIds = [], error, controlStates = {}, reminderMenu}) => {
  const {colors} = useMuesliTheme();
  const label = useLabelColors();
  const open = items.filter((i) => !i.completed);
  const completed = items.filter((i) => i.completed);
  const row = (i: TimeTurnerTodo) => (
    <TodoRow
      key={i.id}
      item={i}
      focused={focusedId === i.id}
      trashState={trashState[i.id] ?? 'rest'}
      deleting={deletingIds.includes(i.id)}
      controls={controlStates[i.id]}
      menuHighlighted={reminderMenu?.id === i.id ? (reminderMenu.highlighted ?? -1) : null}
    />
  );
  return (
    <div
      style={{
        padding: 18,
        background: colors.backgroundRaised,
        borderRadius: 16,
        maxWidth: 820,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxSizing: 'border-box',
        ...envFont,
        color: colors.textPrimary,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center'}}>
        <span style={font(18, 'semibold')}>Open to-dos</span>
        <span style={{flex: 1}} />
        <span style={{...type.caption, color: label.secondary}}>Newest first</span>
      </div>
      {error ? <div style={{color: label.secondary}}>{error}</div> : null}
      {!loaded ? (
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Spinner size={20} />
        </div>
      ) : open.length === 0 ? (
        <div style={type.body}>No open to-dos. Follow-ups from saved recaps appear here.</div>
      ) : null}
      {loaded ? open.map(row) : null}
      {loaded && completed.length ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          {/* DisclosureGroup: VERIFY triangle glyph + spacing */}
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <Symbol name={showCompleted ? 'chevron.down' : 'chevron.right'} size={10} weight="semibold" color={label.secondary} />
            <span>Completed ({completed.length})</span>
          </div>
          {showCompleted ? <div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 16}}>{completed.map(row)}</div> : null}
        </div>
      ) : null}
    </div>
  );
};
