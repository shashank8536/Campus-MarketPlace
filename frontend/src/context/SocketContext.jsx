import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Chat widget state
    const [activeConversation, setActiveConversation] = useState(null);
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize socket connection when user is authenticated
    useEffect(() => {
        if (user) {
            const newSocket = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
                autoConnect: true
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setIsConnected(true);
                newSocket.emit('authenticate', user._id);
            });


            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            // Listen for new message notifications
            newSocket.on('new_message_notification', (data) => {
                console.log('New message notification:', data);
                // Update unread count
                setUnreadCount(prev => prev + 1);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            // Clean up socket if user logs out
            if (socket) {
                socket.close();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user]);

    // Open chat widget with a specific conversation
    const openChatWidget = useCallback((conversation) => {
        setActiveConversation(conversation);
        setIsWidgetOpen(true);
        setIsWidgetMinimized(false);
    }, []);

    // Close chat widget
    const closeChatWidget = useCallback(() => {
        setIsWidgetOpen(false);
        setActiveConversation(null);
        setIsWidgetMinimized(false);
    }, []);

    // Toggle minimize/maximize
    const toggleMinimize = useCallback(() => {
        setIsWidgetMinimized(prev => !prev);
    }, []);

    const value = {
        socket,
        isConnected,
        activeConversation,
        isWidgetOpen,
        isWidgetMinimized,
        unreadCount,
        setUnreadCount,
        openChatWidget,
        closeChatWidget,
        toggleMinimize
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
