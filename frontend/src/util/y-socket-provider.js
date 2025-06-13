import * as Y from 'yjs';
import { io } from 'socket.io-client';
import { ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';
import { Awareness } from 'y-protocols/awareness';
import { encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';
import { undo as yUndo, redo as yRedo } from 'y-prosemirror';

import { selectionAwarenessPlugin } from './selection-awareness-plugin';
import { yCursorPlugin } from './y-cursor-plugin';
import { keymap } from 'prosemirror-keymap';

export function setupYjs(editor, roomId, user) {
    const ydoc = new Y.Doc();
    const type = ydoc.getXmlFragment('prosemirror');
    const awareness = new Awareness(ydoc);
    const socket = io('http://localhost:5000');

    // Set user metadata
    awareness.setLocalStateField('user', {
        name: user.name,
        color: user.color,
    });

    // Emit awareness updates
    awareness.on('update', ({ added, updated, removed }) => {
        const update = encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed]);
        socket.emit('awareness-update', update);
    });

    awareness.on('change', () => {
        // 👇 force ProseMirror to re-render decorations from awareness state
        editor.view.dispatch(editor.view.state.tr);
    });

    // Receive remote awareness
    socket.on('awareness-update', (update) => {
        applyAwarenessUpdate(awareness, new Uint8Array(update));
    });

    // Join room and sync doc
    socket.emit('join-room', { roomId });

    socket.on('sync', (update) => {
        Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    socket.on('update', (update) => {
        Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
    });

    ydoc.on('update', (update, origin) => {
        socket.emit('update', update);
    });
    // Register Yjs plugins
    editor.registerPlugin(ySyncPlugin(type));

    const origDispatchTransaction = editor.view.dispatchTransaction;

    editor.view.dispatchTransaction = (tr) => {
        ydoc.transact(() => {
            origDispatchTransaction(tr);
        }, ySyncPluginKey); // ✅ This tags the origin as 'local'
    };

    editor.registerPlugin(yUndoPlugin());
    editor.registerPlugin(selectionAwarenessPlugin(awareness));

    // ⚠️ IMPORTANT: Use `awareness.clientID`, not socket.id
    editor.registerPlugin(yCursorPlugin(awareness, awareness.clientID, false)); // don't show own cursor

    const updateCursorAwareness = () => {
        const { anchor, head } = editor.view.state.selection;
        const local = awareness.getLocalState();

        const current = local?.cursor || {};
        // Always update cursor field to force broadcast
        if (current.anchor !== anchor || current.head !== head) {
            awareness.setLocalStateField('cursor', { anchor, head });
        } else {
            // Force re-send to make sure others get update
            awareness.setLocalState(awareness.getLocalState());
        }
    };

    editor.view.dom.addEventListener('mouseup', updateCursorAwareness);
    editor.view.dom.addEventListener('keyup', updateCursorAwareness);
    editor.view.dom.addEventListener('selectionchange', updateCursorAwareness);
    editor.view.dom.addEventListener('mousemove', updateCursorAwareness); // optional for smoother update

    // Optional: trigger typing awareness
    let typingTimeout;

    editor.view.dom.addEventListener('input', () => {
        awareness.setLocalStateField('typing', Date.now());

        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            const local = awareness.getLocalState();
            if (local?.typing) {
                awareness.setLocalStateField('typing', 0); // 👈 set to 0, not null
            }
        }, 3000);
    });

    const undoManager = new Y.UndoManager(type, {
        trackedOrigins: new Set([ySyncPluginKey]),
    });

    editor.storage.undoManager = undoManager;

    editor.registerPlugin(
        keymap({
            'Mod-z': () => undoManager.undo(),
            'Mod-y': () => undoManager.redo(),
            'Mod-Shift-z': () => undoManager.redo(),
        }),
    );

    return { ydoc, awareness, socket, undoManager };
}
