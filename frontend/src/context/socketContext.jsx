import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = io('http://localhost:5000');
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('message-notification', `User has opened the document`);
            toast.success('Connected to server');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('disconnected');
            socket.emit('message-notification', `User has left`);
            toast.error('Disconnected from server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return <SocketContext.Provider value={{ socket: socketRef, isConnected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within a SocketProvider');
    return context;
};
