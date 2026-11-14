// macOS app icons as NSWorkspace returns them (what TargetApplicationIconView draws), exported at
// 128px from this Mac's installed apps. Apps without an icon here (e.g. Cursor) intentionally fall
// back to the `app.dashed` placeholder, exactly as the app does when the bundle is not installed.
import slack from './app-icons/slack.png';
import mail from './app-icons/mail.png';
import notes from './app-icons/notes.png';
import messages from './app-icons/messages.png';
import safari from './app-icons/safari.png';
import chrome from './app-icons/chrome.png';
import xcode from './app-icons/xcode.png';
import terminal from './app-icons/terminal.png';
import zoom from './app-icons/zoom.png';

export const APP_ICONS = {slack, mail, notes, messages, safari, chrome, xcode, terminal, zoom} as const;
