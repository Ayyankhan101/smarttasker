import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        const newSocket = io('http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('[Socket] Connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('[Socket] Error:', err.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}