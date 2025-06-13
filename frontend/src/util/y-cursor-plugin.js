import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export function yCursorPlugin(awareness, clientID, showOwnCursor = false) {
    return new Plugin({
        key: new PluginKey('yjs-cursor'),
        state: {
            init() {
                return DecorationSet.empty;
            },
            apply(tr, set) {
                return set.map(tr.mapping, tr.doc);
            },
        },
        props: {
            decorations(state) {
                const decorations = [];
                const now = Date.now();

                awareness.getStates().forEach((userState, id) => {
                    if (!userState.cursor || (!showOwnCursor && id === clientID)) return;

                    const { anchor, head } = userState.cursor;
                    const user = userState.user || { name: 'Anonymous', color: 'gray' };
                    const typingTimestamp = userState.typing || 0;
                    const isTyping = now - typingTimestamp < 3000;

                    const from = Math.min(anchor, head);
                    const to = Math.max(anchor, head);

                    // Selection highlight
                    if (from !== to) {
                        decorations.push(
                            Decoration.inline(from, to, {
                                style: `background-color: ${user.color}33`,
                                class: 'yjs-selection-highlight',
                            }),
                        );
                    }

                    // Cursor and label
                    const cursorEl = document.createElement('div');
                    cursorEl.className = 'yjs-cursor';
                    // Pass dynamic user color as CSS variable for border color
                    cursorEl.style.setProperty('--user-color', user.color);
                    cursorEl.setAttribute('data-user-name', user.name);
                    cursorEl.title = user.name;

                    let widget;
                    if (isTyping) {
                        const labelEl = document.createElement('span');
                        labelEl.className = 'cursor-label';
                        labelEl.textContent = user.name;
                        labelEl.style.setProperty('--user-color', user.color);
                        const wrapper = document.createElement('span');
                        wrapper.style.position = 'relative';
                        wrapper.className = 'yjs-cursor-wrapper';
                        wrapper.appendChild(cursorEl);
                        wrapper.appendChild(labelEl);
                        widget = Decoration.widget(anchor, () => wrapper, { side: 1 });
                    } else {
                        widget = Decoration.widget(anchor, () => cursorEl, { side: 1 });
                    }

                    decorations.push(widget);
                });

                return DecorationSet.create(state.doc, decorations);
            },
        },
    });
}
