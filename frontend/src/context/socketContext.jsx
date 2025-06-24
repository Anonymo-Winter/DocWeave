// SocketProvider.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const token = useSelector((state) => state.user.token);
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState({
        state: 'disconnected',
        message: 'Unable to connect',
    });

    const hasShownInitialConnection = useRef(false);

    useEffect(() => {
        let customReconnectInterval = null;
        const socket = io('http://192.168.200.30:5000', {
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

        // On connect
        socket.on('connect', () => {
            setIsConnected(true);
            setConnectionStatus({
                state: 'connected',
                message: 'Connected to collaboration server. Real-time collaboration is active',
            });

            socket.emit('message-notification', 'User has opened the document');

            if (!hasShownInitialConnection.current) {
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
        });

        // On disconnect
        socket.on('disconnect', (reason) => {
            setIsConnected(false);

            const readableReason =
                {
                    'transport close': 'Network closed unexpectedly',
                    'ping timeout': 'Ping timeout – network unstable',
                    'io server disconnect': 'Disconnected by server',
                    'io client disconnect': 'Disconnected manually',
                    'transport error': 'Network transport error',
                }[reason] || 'Disconnected';

            setConnectionStatus({ state: 'disconnected', message: readableReason });

            if (reason !== 'io client disconnect') {
                toast.warning('Disconnected', {
                    description: readableReason,
                });
            }
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
        socket.on('connect_error', (err) => {
            console.error('Connect error:', err.message);
            setConnectionStatus({ state: 'disconnected', message: err.message });

            if (!hasShownInitialConnection.current) {
                // toast.error('Connection failed', {
                //     description: 'Unable to reach the server',
                //     duration: 4000,
                // });
            }

            if (err.message.includes('auth')) {
                toast.error('Authentication failed', {
                    description: 'Please log in again',
                    duration: 6000,
                });
            }
        });

        return () => {
            if (socket.connected) {
                socket.disconnect();
                toast.info('Disconnected', {
                    description: 'Left collaboration session',
                    duration: 2000,
                });
            }
        };
    }, [token]);

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef,
                isConnected,
                connectionStatus,
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

export default SocketProvider;
