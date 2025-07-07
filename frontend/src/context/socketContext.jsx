// SocketProvider.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { applyAwarenessUpdate, Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness.js';
import * as Y from 'yjs';
import { useLogoutMutation } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const token = useSelector((state) => state.user.token);
    const isOnline = useOfflineStatus();
    const updateQueue = useRef([]);
    const user = useSelector((state) => state.user.user);
    const socketRef = useRef(null);
    const [snapshots, setSnapshots] = useState([]);
    const ydocRef = useRef(null);
    const awarenessRef = useRef(null);
    if (!ydocRef.current) ydocRef.current = new Y.Doc();
    if (!awarenessRef.current) awarenessRef.current = new Awareness(ydocRef.current);

    const docName = 'doc123'; // same room/document name
    const indexeddbProviderRef = useRef(null);

    const ydoc = ydocRef.current;
    const awareness = awarenessRef.current;
    const [isConnected, setIsConnected] = useState(false);
    const [users, setActiveUsers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState({
        state: 'disconnected',
        message: 'Unable to connect',
    });
    const [assignedColor, setAssignedColor] = useState(null);

    const hasShownInitialConnection = useRef(false);
    const navigate = useNavigate();

    const [logout] = useLogoutMutation();

    useEffect(() => {
        if (!indexeddbProviderRef.current) {
            indexeddbProviderRef.current = new IndexeddbPersistence(docName, ydocRef.current);
            indexeddbProviderRef.current.once('synced', () => {
                console.log('[IndexedDB] Document loaded from local storage');
                socketRef.current?.emit('sync');
            });
        }
    }, []);

    useEffect(() => {
        let customReconnectInterval = null;
        const socket = io(import.meta.env.VITE_BACKEND_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 8000,
            withCredentials: true,
            auth: { token },
        });

        socketRef.current = socket;
        const bc = new BroadcastChannel('collab-tabs');
        let isPrimaryTab = true;

        // Listen to other tabs
        bc.onmessage = (event) => {
            if (event.data === 'active-tab-check') {
                bc.postMessage('active-tab-exists');
                isPrimaryTab = false;
            } else if (event.data === 'active-tab-exists') {
                isPrimaryTab = false;
            }
        };

        // Ask if any other tab is already active
        bc.postMessage('active-tab-check');

        // On connect
        const roomId = 'doc123';
        socket.on('connect', () => {
            setIsConnected(true);

            setTimeout(() => {
                socket.emit(
                    'join-room',
                    {
                        roomId,
                        clientID: awareness.clientID,
                        user: {
                            name: user.name,
                            email: user.email,
                            color: assignedColor + '',
                            id: user._id,
                            role: 'editor',
                        },
                    },
                    ({ color }) => {
                        setConnectionStatus({
                            state: 'connected',
                            message: 'Connected to collaboration server. Real-time collaboration is active',
                        });
                        setAssignedColor(color);
                        awareness.setLocalState(null);
                        awareness.setLocalState({
                            user: { name: user.name, color, id: user._id, role: 'editor' },
                        });

                        const stateVector = Y.encodeStateVector(ydoc);
                        socket.emit('request-sync', stateVector);
                        socket.once('sync-update', (serverUpdate) => {
                            Y.applyUpdate(ydoc, new Uint8Array(serverUpdate), 'sync');

                            // Now safely flush buffered updates after merging state
                            updateQueue.current.forEach((u) => {
                                socket.emit('update', u);
                            });
                            updateQueue.current = [];
                        });

                        // also force awareness re-sync
                        const current = awarenessRef.current.getLocalState();
                        awarenessRef.current.setLocalState(null);
                        setTimeout(() => {
                            awarenessRef.current.setLocalState(current);
                        }, 100);

                        // socket.emit('sync');

                        if (isPrimaryTab) {
                            socket.emit('message-notification', {
                                roomId: 'doc123',
                                user: { name: 'System', color: '#6B7280' },
                                message: `${user.name} has opened the document`,
                                timestamp: new Date().toISOString(),
                                type: 'system',
                            });
                        }
                    },
                );

                if (hasShownInitialConnection.current === false) {
                    toast.success('Connected', {
                        description: 'Real-time collaboration is active',
                        duration: 3000,
                    });
                    hasShownInitialConnection.current = true;
                } else {
                    toast.success('Reconnected', {
                        description: 'Connection restored successfully',
                        duration: 2000,
                    });
                }
            }, 200);
        });

        socket.on('sync', (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update), 'sync');
        });

        ydocRef.current.on('update', (update) => {
            if (socket.connected) {
                socket.emit('update', update);
            } else {
                // console.log('Buffered update while offline:', update);
                updateQueue.current.push(update); // buffer updates while offline
            }
        });

        // On disconnect
        socket.on('disconnect', (reason) => {
            setIsConnected(false);

            const readableReason =
                {
                    'transport close': 'Network closed unexpectedly',
                    'ping timeout': 'Ping timeout - network unstable',
                    'io server disconnect': 'Disconnected by server',
                    'io client disconnect': 'Disconnected manually',
                    'transport error': 'Network transport error',
                }[reason] || 'Disconnected';

            if (!isOnline) {
                setConnectionStatus({
                    state: 'disconnected',
                    message: "You're offline. Changes will sync when reconnected.",
                });
            } else {
                setConnectionStatus({ state: 'disconnected', message: readableReason });
            }

            if (reason !== 'io client disconnect') {
                toast.warning('Disconnected', {
                    description: readableReason,
                });
            }
        });

        socket.on('active-users', (users) => {
            setActiveUsers(users); // optional state hook
        });

        // Reconnection attempt
        socket.io.on('reconnect_attempt', (attempt) => {
            const max = socket.io.opts.reconnectionAttempts;
            setConnectionStatus({
                state: 'reconnecting',
                message: `Reconnecting (Attempt ${attempt} of ${max})`,
            });
        });

        // Reconnection failed
        socket.io.on('reconnect_failed', () => {
            setIsConnected(false);
            setConnectionStatus({
                state: 'failed',
                message: 'Unable to reconnect. Please check your network.',
            });

            if (!customReconnectInterval) {
                customReconnectInterval = setInterval(() => {
                    if (!socket.connected) {
                        console.log('Custom retrying connection...');
                        socket.connect();
                    } else {
                        clearInterval(customReconnectInterval);
                        customReconnectInterval = null;
                    }
                }, 10000); // retry every 10s
            }
        });

        // Reconnect error
        socket.io.on('reconnect_error', (error) => {
            console.error('Reconnect error:', error.message);
            if (error.message === 'websocket error') {
                setConnectionStatus({
                    state: 'disconnected',
                    message: 'Unable to reconnect. Please check your network.',
                });
            } else {
                setConnectionStatus({ state: 'disconnected', message: error.message });
            }

            if (error.message.includes('auth')) {
                toast.error('Authentication failed', {
                    description: 'Please log in again',
                    duration: 6000,
                });
            }
        });

        // Connection error
        socket.on('connect_error', async (err) => {
            console.error('Connect error:', err);
            setConnectionStatus({ state: 'disconnected', message: err.message });

            if (err.message.includes('Auth')) {
                socket.disconnect();
                toast.error('Authentication failed', {
                    description: 'Please log in again',
                    duration: 6000,
                });
                await logout().unwrap();
                navigate('/login');
            }
            if (!hasShownInitialConnection.current) {
                toast.error('Connection failed', {
                    description: err.message,
                    duration: 4000,
                });
            }
        });

        socket.on('awareness-update', (update) => {
            applyAwarenessUpdate(awareness, new Uint8Array(update));
        });

        awareness.on('update', ({ added, updated, removed }) => {
            if (socket.connected) {
                const update = encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed]);
                socket?.emit('awareness-update', update);
            }
        });

        socket.on('update', (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
        });

        socket.on('error', (data) => {
            toast.error(data);
        });

        const handleUnload = () => {
            awareness.setLocalState(null);

            if (isPrimaryTab) {
                socket.emit('message-notification', {
                    roomId: 'doc123',
                    user: { name: 'System', color: '#6B7280' },
                    message: `${user.name} has left the document`,
                    timestamp: new Date().toISOString(),
                    type: 'system',
                });
            }
            if (isPrimaryTab && user?._id) {
                const payload = {
                    userId: user._id,
                    userName: user.name,
                    roomId: 'doc123',
                };

                const blob = new Blob([JSON.stringify(payload)], {
                    type: 'application/json',
                });

                navigator.sendBeacon('http://192.168.200.30:5000/user-left', blob);
            }
        };
        window.addEventListener('unload', handleUnload);

        return () => {
            awareness.setLocalState(null);
            if (socket.connected && isPrimaryTab) {
                socket.emit('message-notification', {
                    roomId: 'doc123',
                    user: { name: 'System', color: '#6B7280' },
                    message: `${user.name} has left the document`,
                    timestamp: new Date().toISOString(),
                    type: 'system',
                });
                socket.disconnect();
                toast.info('Disconnected', {
                    description: 'Left collaboration session',
                    duration: 2000,
                });
            }
            window.removeEventListener('unload', handleUnload);
            bc.close();
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
                awarenessRef,
                assignedColor,
                activeUsers: users,
                snapshots,
                addSnapshot: (snap) => setSnapshots((prev) => [...prev, snap]),
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within a SocketProvider');
    return context;
};
