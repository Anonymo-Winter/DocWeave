// socket-server.js
import { Server } from 'socket.io';
import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';

const docsMap = new Map();

export function setupSocketIo(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        let currentRoomId = null;

        socket.on('join-room', ({ roomId }) => {
            currentRoomId = roomId;
            socket.join(roomId);

            if (!docsMap.has(roomId)) {
                const doc = new Y.Doc();
                const awareness = new Awareness(doc);
                docsMap.set(roomId, { doc, awareness });
            }

            const { doc, awareness } = docsMap.get(roomId);

            // Send current Yjs document state
            socket.emit('sync', Y.encodeStateAsUpdate(doc));

            // Send initial awareness
            socket.emit('awareness-update', encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())));

            socket.on('update', (update) => {
                Y.applyUpdate(doc, new Uint8Array(update));
                socket.to(roomId).emit('update', update);
            });

            socket.on('awareness-update', (update) => {
                applyAwarenessUpdate(awareness, new Uint8Array(update), socket.id);
                socket.to(roomId).emit('awareness-update', update);
            });

            socket.on('disconnect', () => {
                // awareness.removeStates([socket.id], 'disconnect');
                const update = encodeAwarenessUpdate(awareness, [], [], [socket.id]);
                socket.to(roomId).emit('awareness-update', update);
                socket.leave(roomId);
            });
        });
    });
}
