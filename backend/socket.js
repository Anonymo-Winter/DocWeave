import { Server } from 'socket.io';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';

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
        console.log('New client connected:', socket.id);
        let currentRoomId = null;

        socket.on('join-room', ({ roomId }) => {
            currentRoomId = roomId;
            socket.join(currentRoomId);

            // Create doc + awareness if not present
            if (!docsMap.has(currentRoomId)) {
                const doc = new Y.Doc();
                const awareness = new Awareness(doc);
                docsMap.set(currentRoomId, { doc, awareness });
            }

            const { doc, awareness } = docsMap.get(currentRoomId);

            // Send initial sync state
            const state = Y.encodeStateAsUpdate(doc);
            socket.emit('sync', state);

            // --- Yjs document updates ---
            socket.on('update', (update) => {
                try {
                    const binary = update instanceof Uint8Array ? update : new Uint8Array(update);
                    Y.applyUpdate(doc, binary);
                    socket.to(currentRoomId).emit('update', binary);
                } catch (err) {
                    console.error('Failed to apply update:', err);
                }
            });

            // --- Awareness: Receive and broadcast awareness updates ---
            socket.on('awareness-update', (update) => {
                // broadcast to others in the room
                socket.to(currentRoomId).emit('awareness-update', update);
            });

            // --- Handle disconnects (optional: cleanup awareness states) ---
            socket.on('disconnect', () => {
                if (currentRoomId) {
                    socket.leave(currentRoomId);
                    console.log('Disconnected from room:', currentRoomId);
                }
            });
        });
    });

    return io;
}
