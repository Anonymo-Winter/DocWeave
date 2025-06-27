// server/socket.js
import { Server } from 'socket.io';
import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';
import jwt from 'jsonwebtoken';

const tailwindBaseHexColors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
    '#9ca3af', // grey
];

function hashStringToIndex(str, arrayLength) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % arrayLength;
}

const docsMap = new Map();
const roomUsers = new Map();

export function setupSocketIo(server) {
    const io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://192.168.200.30:5173',
                'http://192.168.200.30:5174',
            ],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            socket.emit('error', 'Authentication Error');
            return next(new Error('Authentication Error'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            socket.user = decoded;
            next();
        } catch {
            socket.emit('error', 'Authentication Error');
            return next(new Error('Authentication Error'));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.user;
        let currentRoomId = null;
        let currentClientID = null;

        console.log('[User Connected]:', user.name);

        socket.on('join-room', ({ roomId, clientID, user: userData }, callback) => {
            // console.log(`[User ${userData.name} joined room ${roomId}] with clientID: ${clientID}`);
            currentRoomId = roomId;
            currentClientID = clientID;
            socket.join(roomId);
            // Assign consistent color using hash
            const colorIndex = hashStringToIndex(userData.id + roomId, tailwindBaseHexColors.length);
            const assignedColor = tailwindBaseHexColors[colorIndex];

            if (!roomUsers.has(roomId)) {
                roomUsers.set(roomId, new Map());
            }

            const usersInRoom = roomUsers.get(roomId);

            if (!usersInRoom.has(userData.id)) {
                usersInRoom.set(userData.id, {
                    user: userData,
                    sockets: new Set(),
                });
            }

            usersInRoom.get(userData.id).sockets.add(socket.id);

            // Emit updated list
            io.to(roomId).emit(
                'active-users',
                Array.from(usersInRoom.values()).map((entry) => entry.user),
            );

            // Create Yjs doc + awareness if new
            if (!docsMap.has(roomId)) {
                const doc = new Y.Doc();
                const awareness = new Awareness(doc);
                docsMap.set(roomId, { doc, awareness });
            }

            const { doc, awareness } = docsMap.get(roomId);

            // Send current awareness states to the new user
            const awarenessStates = Array.from(awareness.getStates().keys());
            if (awarenessStates.length > 0) {
                socket.emit('awareness-update', encodeAwarenessUpdate(awareness, awarenessStates));
            }

            // Send color assignment
            socket.emit('assign-color', { color: assignedColor });
            if (callback) callback({ color: assignedColor });

            // Handle document updates
            socket.on('update', (update) => {
                try {
                    Y.applyUpdate(doc, new Uint8Array(update));
                    socket.to(roomId).emit('update', update);
                } catch (error) {
                    console.error('Error applying document update:', error);
                }
            });

            socket.on('sync', () => {
                socket.emit('sync', Y.encodeStateAsUpdate(doc));
            });

            // Handle awareness updates - FIXED
            socket.on('awareness-update', (update) => {
                try {
                    const { awareness } = docsMap.get(roomId);
                    // Apply the update to the server awareness
                    applyAwarenessUpdate(awareness, new Uint8Array(update));
                    // Broadcast to other clients in the room
                    socket.to(roomId).emit('awareness-update', update);
                } catch (error) {
                    console.error('Error applying awareness update:', error);
                }
            });

            socket.on('message', (data, callback) => {
                try {
                    console.log('[Server] Received message:', data);

                    // Optionally validate data
                    const { roomId, message, user, sender } = data;
                    if (!roomId || !message || !user || !sender) {
                        return callback({ status: 'error', error: 'Invalid Message' });
                    }

                    // Broadcast message to others in the room
                    socket.to(roomId).emit('message', { ...data, roomId: undefined, sent: true });

                    // ✅ Acknowledge back to the sender
                    callback({ status: 'ok', receivedAt: Date.now() });
                } catch (err) {
                    console.error('[Server Error]', err);
                    callback({ status: 'error', error: 'Internal server error' });
                }
            });

            socket.on('message-notification', (data) => {
                const { roomId, message } = data;
                if (!roomId) {
                    socket.emit('error', 'Room ID not provided');
                    return;
                }
                if (!message) {
                    socket.emit('error', 'Message not provided');
                    return;
                }
                socket.to(roomId).emit('message-notification', { ...data, roomId: undefined });
            });

            socket.on('leave-room', ({ roomId: leaveRoomId }) => {
                handleLeaveRoom(socket, leaveRoomId || currentRoomId, currentClientID);
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', user.name);
            if (currentRoomId && currentClientID) {
                handleLeaveRoom(socket, currentRoomId, currentClientID);
            }
        });

        // Centralized leave room handler
        function handleLeaveRoom(socket, roomId, clientID) {
            if (!docsMap.has(roomId)) return;

            const { awareness } = docsMap.get(roomId);

            // Remove awareness state for this client
            if (typeof clientID === 'number') {
                awareness.setLocalState(null);

                const awarenessUpdate = encodeAwarenessUpdate(awareness, [], [], [clientID]);
                socket.to(roomId).emit('awareness-update', awarenessUpdate);
            }

            if (roomUsers.has(roomId)) {
                const usersInRoom = roomUsers.get(roomId);
                for (const [userId, entry] of usersInRoom.entries()) {
                    if (entry.sockets.has(socket.id)) {
                        entry.sockets.delete(socket.id);

                        // If user has no other open sockets in the room, remove user
                        if (entry.sockets.size === 0) {
                            usersInRoom.delete(userId);
                        }

                        break;
                    }
                }

                // Emit updated list
                io.to(roomId).emit(
                    'active-users',
                    Array.from(usersInRoom.values()).map((entry) => entry.user),
                );

                if (usersInRoom.size === 0) {
                    roomUsers.delete(roomId);
                }
            }

            socket.leave(roomId);

            // Clean up empty rooms
            if (io.sockets.adapter.rooms.get(roomId)?.size === 0) {
                console.log(`Cleaning up empty room: ${roomId}`);
                docsMap.delete(roomId);
            }
        }
    });
}
