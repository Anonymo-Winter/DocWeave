import * as Y from 'yjs';
import { ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { io } from 'socket.io-client';
import { keymap } from 'prosemirror-keymap';

export function setupYjs(editor, roomId, user) {
    const ydoc = new Y.Doc();
    const socket = io('http://localhost:5000');
    socket.emit('join-room', { roomId });

    socket.on('sync', (update) => {
        try {
            const binary = update instanceof Uint8Array ? update : new Uint8Array(update);
            Y.applyUpdate(ydoc, binary);
        } catch (err) {
            console.error('Failed to apply sync:', err);
        }
    });

    socket.on('update', (update) => {
        try {
            const binary = update instanceof Uint8Array ? update : new Uint8Array(update);
            Y.applyUpdate(ydoc, binary);
        } catch (err) {
            console.error('Failed to apply update:', err);
        }
    });

    ydoc.on('update', (update) => {
        socket.emit('update', update);
    });

    const type = ydoc.getXmlFragment('prosemirror');

    editor.registerPlugin(ySyncPlugin(type));
    // editor.registerPlugin(yCursorPlugin({ provider: null, user }));
    editor.registerPlugin(yUndoPlugin());

    return {
        undo: () => editor.state.tr.setMeta(yUndoPlugin, { undo: true }),
        redo: () => editor.state.tr.setMeta(yUndoPlugin, { redo: true }),
    };
}
