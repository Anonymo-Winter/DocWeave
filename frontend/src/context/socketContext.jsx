// SocketProvider.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import * as Y from 'yjs';
import { applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness.js';
import { useLogoutMutation } from '../api/userApi';
import { useNavigate, useParams } from 'react-router-dom';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

import { getYjsForDoc, whenIndexeddbSynced } from './yjsSetup';
import ErrorMessage from '../components/ErrorMessage';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const token = useSelector((state) => state.user.token);
    const user = useSelector((state) => state.user.user);
    const isOnline = useOfflineStatus();
    const navigate = useNavigate();
    const [logout] = useLogoutMutation();

    const socketRef = useRef(null);
    const updateQueue = useRef([]);

    const socketReadyRef = useRef(false);
    const indexeddbReadyRef = useRef(false);
    const joinedRef = useRef(false);
    const joinRoomRef = useRef(null);

    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [assignedColor, setAssignedColor] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState({
        state: 'disconnected',
        message: 'Unable to connect',
    });
    const { editorId } = useParams();
    const [fatalSocketError, setFatalSocketError] = useState(null);

    // ---- Yjs setup (one doc per tab) ----
    const yjsRef = useRef(null);
    if (!yjsRef.current) {
        yjsRef.current = getYjsForDoc(editorId);
    }

    const { ydoc, awareness, indexeddbProvider } = yjsRef.current;

    // ---- JOIN GATE ----
    const tryJoinRoom = () => {
        if (joinedRef.current || !socketReadyRef.current || !indexeddbReadyRef.current || !joinRoomRef.current) {
            return;
        }

        joinedRef.current = true;
        joinRoomRef.current();
    };

    // ---- IndexedDB readiness ----
    useEffect(() => {
        whenIndexeddbSynced(indexeddbProvider).then(() => {
            indexeddbReadyRef.current = true;
            tryJoinRoom();
        });
    }, [indexeddbProvider]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            try {
                awareness.setLocalState(null);
                socketRef.current?.emit('leave-room', { roomId: editorId });
            } catch {
                console.log('Error while leaving room');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [awareness]);

    // ---- Socket lifecycle ----
    useEffect(() => {
        const socket = io(import.meta.env.VITE_BACKEND_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            withCredentials: true,
            auth: { token },
        });

        socketRef.current = socket;

        // -------- JOIN ROOM FUNCTION --------
        joinRoomRef.current = () => {
            const roomId = editorId;

            socket.emit(
                'join-room',
                {
                    roomId,
                    clientID: awareness.clientID,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: 'editor',
                    },
                },
                ({ color }) => {
                    setAssignedColor(color);
                    setConnectionStatus({
                        state: 'connected',
                        message: 'Connected to collaboration server',
                    });

                    const stateVector = Y.encodeStateVector(ydoc);
                    socket.emit('request-sync', stateVector);
                },
            );
        };

        socket.on('error', (error) => {
            console.error('Socket error:', error);

            if (error === 'ACCESS_DENIED') {
                setFatalSocketError({
                    code: 'NO_ACCESS',
                    status: 403,
                    message: 'You do not have permission to access this document.',
                });
                socket.disconnect();
                return;
            }

            if (error === 'ROOM_NOT_FOUND') {
                setFatalSocketError({
                    code: 'DOC_NOT_FOUND',
                    status: 404,
                    message: 'The document you are looking for does not exist.',
                });
                socket.disconnect();
                return;
            }

            toast.error('Socket error', {
                description: String(error),
            });
        });

        // -------- SOCKET EVENTS --------
        socket.on('connect', () => {
            socketReadyRef.current = true;
            setIsConnected(true);
            tryJoinRoom();
        });

        socket.on('disconnect', () => {
            // 🔴 CRITICAL FIX
            joinedRef.current = false;
            socketReadyRef.current = false;
            awareness.setLocalState(null);
            setIsConnected(false);

            setConnectionStatus({
                state: 'disconnected',
                message: isOnline ? 'Disconnected from server' : "You're offline. Changes will sync when reconnected.",
            });
        });

        socket.on('sync-update', (serverUpdate) => {
            Y.applyUpdate(ydoc, new Uint8Array(serverUpdate), 'sync');

            updateQueue.current.forEach((u) => socket.emit('update', u));
            updateQueue.current = [];
        });

        socket.on('update', (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
        });

        socket.on('awareness-update', (update) => {
            applyAwarenessUpdate(awareness, new Uint8Array(update), 'remote');
        });

        socket.on('active-users', setActiveUsers);

        socket.on('connect_error', async (err) => {
            console.error('Connect error:', err);

            if (err.message?.includes('Auth')) {
                socket.disconnect();
                await logout().unwrap();
                navigate('/login');
                return;
            }

            setFatalSocketError({
                code: 'SOCKET_FAILED',
                status: 503,
                message: 'Unable to establish a real-time connection. Please refresh the page.',
            });
        });

        // -------- YJS EVENTS --------
        const handleYdocUpdate = (update, origin) => {
            if (origin === 'remote' || origin === 'sync') return;

            if (socket.connected) {
                socket.emit('update', new Uint8Array(update));
            } else {
                updateQueue.current.push(update);
            }
        };

        const handleAwarenessUpdate = ({ added, updated, removed }, origin) => {
            if (origin != 'local') return;
            if (!socket.connected) return;
            const update = encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed]);
            socket.emit('awareness-update', update);
        };

        ydoc.on('update', handleYdocUpdate);
        awareness.on('update', handleAwarenessUpdate);

        socket.on('assign-color', ({ color }) => {
            setAssignedColor(color);

            awareness.setLocalState({
                user: {
                    id: user._id,
                    name: user.name,
                    color,
                    role: 'editor',
                },
            });
        });
        // awareness.on('update', ({ added, updated, removed }, origin) => {
        //     if (origin === 'local') {
        //         console.log('LOCAL awareness update', { added, updated, removed });
        //     }
        // });
        // -------- CLEANUP --------
        return () => {
            ydoc.off('update', handleYdocUpdate);
            awareness.off('update', handleAwarenessUpdate);

            awareness.setLocalState(null);

            joinRoomRef.current = null;
            joinedRef.current = false;
            socketReadyRef.current = false;
            indexeddbReadyRef.current = false;

            socket.disconnect();
        };
    }, [token]);

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef,
                isConnected,
                connectionStatus,
                ydoc,
                awareness,
                assignedColor,
                activeUsers,
                fatalSocketError,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error('useSocket must be used within SocketProvider');
    return ctx;
};