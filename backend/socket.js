import { Server } from 'socket.io';
import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';

const docsMap = new Map();

export function setupSocketIo(server) {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('a user connected');
        let currentRoomId = null;

        socket.on('join-room', ({ roomId, clientID }) => {
            currentRoomId = roomId;
            socket.join(roomId);
            socket.awarenessClientID = clientID;

            if (!docsMap.has(roomId)) {
                const doc = new Y.Doc();
                const awareness = new Awareness(doc);
                docsMap.set(roomId, { doc, awareness });
            }

            const { doc, awareness } = docsMap.get(roomId);

            // Send Yjs document state
            socket.emit('sync', Y.encodeStateAsUpdate(doc));

            // Send awareness states
            socket.emit('awareness-update', encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())));

            // Document update handler
            socket.on('update', (update) => {
                Y.applyUpdate(doc, new Uint8Array(update));
                socket.to(roomId).emit('update', update);
            });

            // Awareness update handler
            socket.on('awareness-update', (update) => {
                applyAwarenessUpdate(awareness, new Uint8Array(update), socket.awarenessClientID);
                socket.to(roomId).emit('awareness-update', update);
            });

            socket.on('message', ({ roomId, message, user }) => {
                io.to(roomId).emit('message', {
                    senderId: socket.id,
                    message,
                    user,
                });
            });

            socket.on('message-notification', (message) => {
                socket.to(roomId).emit('message-notification', { message, type: 'info' });
            });

            socket.on('disconnect', () => {
                if (!docsMap.has(currentRoomId)) return;

                const { awareness } = docsMap.get(currentRoomId);

                if (typeof socket.awarenessClientID === 'number') {
                    const update = encodeAwarenessUpdate(awareness, [], [], [socket.awarenessClientID]);
                    socket.to(currentRoomId).emit('awareness-update', update);
                }

                socket.to(currentRoomId).emit('message-notification', { message: `User has left`, type: 'info' });

                socket.leave(currentRoomId);

                // Cleanup room if empty
                if (io.sockets.adapter.rooms.get(currentRoomId)?.size === 0) {
                    docsMap.delete(currentRoomId);
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('a user disconnected');
        });
    });
}
