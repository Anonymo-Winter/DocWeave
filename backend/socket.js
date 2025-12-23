// server/socket.js
import { Server } from 'socket.io';
import * as Y from 'yjs';
import jwt from 'jsonwebtoken';
import Document from './models/document.model.js';
import mongoose from 'mongoose';
import { resolveUserRole } from './controllers/doc.controller.js';

const tailwindBaseHexColors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#9ca3af',
];

function hashStringToIndex(str, arrayLength) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % arrayLength;
}

/**
 * Server state:
 * - docsMap: holds ONLY the shared Y.Doc (CRDT content).
 *   IMPORTANT: server does NOT store or mutate awareness.
 */
const docsMap = new Map(); // roomId -> { doc: Y.Doc }

/**
 * For active users list / chat UI:
 * roomUsers: roomId -> Map(userId -> { user, sockets:Set<string> })
 */
const roomUsers = new Map();

export function setupSocketIo(server) {
    const io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
    });

    // --- Auth middleware ---
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication Error'));

        try {
            socket.user = jwt.verify(token, process.env.JWT_KEY);
            next();
        } catch (e) {
            next(new Error('Authentication Error'));
        }
    });

    io.on('connection', (socket) => {
        const authedUser = socket.user;

        let currentRoomId = null;
        let currentClientID = null; // kept for compatibility with your client payload; not used for awareness
        let currentUserData = null;

        console.log('[User Connected]:', authedUser?.name);

        // --- Ensure doc exists for room ---
        const getRoomState = (roomId) => {
            if (!docsMap.has(roomId)) {
                const doc = new Y.Doc();
                // Ensure a consistent fragment exists (tiptap Collaboration uses field name)
                doc.getXmlFragment('default');
                docsMap.set(roomId, { doc });
            }
            return docsMap.get(roomId);
        };

        const emitActiveUsers = (roomId) => {
            const usersInRoom = roomUsers.get(roomId);
            io.to(roomId).emit(
                'active-users',
                usersInRoom ? Array.from(usersInRoom.values()).map((entry) => entry.user) : [],
            );
        };

        const handleLeaveRoom = (roomId) => {
            if (!roomId) return;

            // Remove socket from roomUsers
            if (roomUsers.has(roomId) && currentUserData?.id) {
                const usersInRoom = roomUsers.get(roomId);
                const entry = usersInRoom.get(currentUserData.id);

                if (entry) {
                    entry.sockets.delete(socket.id);
                    if (entry.sockets.size === 0) usersInRoom.delete(currentUserData.id);
                }

                if (entry && entry.sockets.size === 0) {
                    socket.to(roomId).emit('message-notification', {
                        roomId,
                        type: 'system',
                        message: `${currentUserData.name} has left the document`,
                        sentAt: Date.now(),
                    });
                }

                if (usersInRoom.size === 0) roomUsers.delete(roomId);
                emitActiveUsers(roomId);
            }

            socket.leave(roomId);

            // Cleanup doc if room is empty
            if (io.sockets.adapter.rooms.get(roomId)?.size === 0) {
                docsMap.delete(roomId);
            }
        };

        // =========================
        // JOIN ROOM
        // =========================
        socket.on('join-room', async ({ roomId, clientID, user: userData }, callback = () => {}) => {
            const userId = authedUser?.id;
            try {
                if (!roomId || typeof clientID !== 'number' || !userData?.id) {
                    callback({ error: 'Invalid join-room payload' });
                    return;
                }

                const role = await resolveUserRole({ userId, docId: roomId });
                if (!role) {
                    socket.emit('error', 'ACCESS_DENIED');
                    return;
                }

                // If switching rooms
                if (currentRoomId && currentRoomId !== roomId) {
                    handleLeaveRoom(currentRoomId);
                }

                currentRoomId = roomId;
                currentClientID = clientID;
                currentUserData = userData;

                socket.join(roomId);
                socket.data.docId = roomId;
                socket.data.role = role;

                // Assign deterministic color (no DB persistence in this version)
                // Fetch document metadata
                if (!mongoose.Types.ObjectId.isValid(roomId)) {
                    callback({ error: 'Invalid room ID' });
                    return;
                }
                const docMeta = await Document.findById(roomId);

                if (!docMeta) {
                    callback({ error: 'Document not found' });
                    return;
                }

                // Get or assign color
                let assignedColor = docMeta.userColors?.get(userData.id);

                if (!assignedColor) {
                    const colorIndex = hashStringToIndex(userData.id + roomId, tailwindBaseHexColors.length);
                    assignedColor = tailwindBaseHexColors[colorIndex];

                    docMeta.userColors.set(userData.id, assignedColor);
                    await docMeta.save();
                }

                // Track active users for UI
                if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
                const usersInRoom = roomUsers.get(roomId);

                if (!usersInRoom.has(userData.id)) {
                    usersInRoom.set(userData.id, {
                        user: { ...userData, color: assignedColor },
                        sockets: new Set(),
                    });
                }

                usersInRoom.get(userData.id).sockets.add(socket.id);
                const entry = usersInRoom.get(userData.id);
                if (entry.sockets.size === 1 && socket.recovered !== true) {
                    socket.to(roomId).emit('message-notification', {
                        roomId,
                        type: 'system',
                        message: `${userData.name} has opened the document`,
                        sentAt: Date.now(),
                    });
                }

                emitActiveUsers(roomId);

                // Ensure Y.Doc exists for room
                getRoomState(roomId);

                const { doc } = getRoomState(roomId);
                socket.emit('sync', Y.encodeStateAsUpdate(doc));

                // Tell client its color (client sets local awareness itself)
                socket.emit('assign-color', { color: assignedColor });
                callback({ color: assignedColor });
            } catch (e) {
                console.error('join-room error:', e);
                callback({ error: 'join-room failed' });
            }
        });

        // When the socket is about to leave rooms (tab close / refresh / transport teardown)
        socket.on('disconnecting', () => {
            handleLeaveRoom(currentRoomId);
        });

        // =========================
        // DOC UPDATES (CRDT)
        // =========================
        socket.on('update', (update) => {
            if (!currentRoomId) return;

            const role = socket.data.role;
            if (role !== 'EDITOR' && role !== 'OWNER') return;

            try {
                const { doc } = getRoomState(currentRoomId);
                Y.applyUpdate(doc, new Uint8Array(update));
                socket.to(currentRoomId).emit('update', update);
            } catch (e) {
                console.error('Error applying document update:', e);
            }
        });

        // =========================
        // SYNC
        // =========================
        socket.on('request-sync', (stateVector) => {
            if (!currentRoomId) return;

            try {
                const { doc } = getRoomState(currentRoomId);
                const diff = Y.encodeStateAsUpdate(doc, new Uint8Array(stateVector));
                socket.emit('sync-update', diff);
            } catch (e) {
                console.error('request-sync error:', e);
            }
        });

        socket.on('sync', () => {
            if (!currentRoomId) return;

            try {
                const { doc } = getRoomState(currentRoomId);
                socket.emit('sync', Y.encodeStateAsUpdate(doc));
            } catch (e) {
                console.error('sync error:', e);
            }
        });

        // =========================
        // AWARENESS (DUMB RELAY ONLY)
        // =========================
        socket.on('awareness-update', (update) => {
            if (!currentRoomId) return;
            if (socket.data.role == 'VIEWER') return;
            // DO NOT apply/encode/store awareness on server.
            socket.to(currentRoomId).emit('awareness-update', update);
        });

        // =========================
        // CHAT
        // =========================
        socket.on('message', (data, callback = () => {}) => {
            try {
                const { roomId, message, user, senderUserId } = data || {};
                if (!roomId || !message || !user) {
                    callback({ status: 'error', error: 'Invalid Message' });
                    return;
                }

                socket.to(roomId).emit('message', {
                    ...data,
                    senderUserId,
                    sentAt: Date.now(),
                });

                callback({ status: 'ok', receivedAt: Date.now() });
            } catch (err) {
                console.error('[Server Error]', err);
                callback({ status: 'error', error: 'Internal server error' });
            }
        });

        socket.on('message-notification', (data) => {
            const { roomId, message } = data || {};
            if (!roomId || !message) return;
            socket.to(roomId).emit('message-notification', { ...data, sentAt: Date.now() });
        });

        // =========================
        // LEAVE ROOM
        // =========================
        socket.on('leave-room', ({ roomId } = {}) => {
            handleLeaveRoom(roomId || currentRoomId);
            if ((roomId || currentRoomId) === currentRoomId) {
                currentRoomId = null;
                currentClientID = null;
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', authedUser?.name);
            // disconnecting already called handleLeaveRoom, but calling again is safe.
            handleLeaveRoom(currentRoomId);
        });
    });
}
