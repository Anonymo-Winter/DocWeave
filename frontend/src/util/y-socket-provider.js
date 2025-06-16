import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';
import { ySyncPlugin, ySyncPluginKey, yUndoPlugin } from 'y-prosemirror';
import { keymap } from 'prosemirror-keymap';
import { yCursorPlugin } from './y-cursor-plugin';
import { selectionAwarenessPlugin } from './selection-awareness-plugin';

export function setupYjs(editor, roomId, user, socket) {
    const ydoc = new Y.Doc();
    const type = ydoc.getXmlFragment('prosemirror');
    const awareness = new Awareness(ydoc);

    // Add user to awareness
    awareness.setLocalStateField('user', { name: user.name, color: user.color });

    // Send awareness update to server
    awareness.on('update', ({ added, updated, removed }) => {
        const update = encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed]);
        socket?.emit('awareness-update', update);
    });

    // Trigger re-render of decorations
    awareness.on('change', () => {
        editor.view.dispatch(editor.view.state.tr);
    });

    // Handle incoming awareness update
    socket.on('awareness-update', (update) => {
        applyAwarenessUpdate(awareness, new Uint8Array(update));
    });

    // Join room and send clientID
    socket.emit('join-room', {
        roomId,
        clientID: awareness.clientID,
    });

    socket.on('sync', (update) => {
        Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    socket.on('update', (update) => {
        Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
    });

    socket.on('disconnect', () => {
        const update = encodeAwarenessUpdate(awareness, [], [], [awareness.clientID]);
        socket.emit('awareness-update', update);
    });

    ydoc.on('update', (update, origin) => {
        socket.emit('update', update);
    });

    // Register plugins
    editor.registerPlugin(ySyncPlugin(type));
    editor.registerPlugin(yUndoPlugin());
    editor.registerPlugin(selectionAwarenessPlugin(awareness));
    editor.registerPlugin(yCursorPlugin(awareness, awareness.clientID, false));

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

    // Track cursor changes
    const updateCursorAwareness = () => {
        const { anchor, head } = editor.view.state.selection;
        const local = awareness.getLocalState();
        if (!local) return;
        const current = local.cursor || {};
        if (current.anchor !== anchor || current.head !== head) {
            awareness.setLocalStateField('cursor', { anchor, head });
        } else {
            awareness.setLocalState(local); // Force resend
        }
    };

    ['mouseup', 'keyup', 'mousemove', 'selectionchange'].forEach((e) => {
        editor.view.dom.addEventListener(e, updateCursorAwareness);
    });

    // Typing awareness
    let typingTimeout;
    editor.view.dom.addEventListener('input', () => {
        awareness.setLocalStateField('typing', Date.now());
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            awareness.setLocalStateField('typing', 0);
        }, 3000);
    });

    return { ydoc, awareness, socket, undoManager };
}
