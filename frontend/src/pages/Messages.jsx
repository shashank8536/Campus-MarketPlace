import React, { useState, useEffect } from 'react';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { apiClient } from '../config/api';
import './Messages.css';

const Messages = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/api/messages/conversations');
                if (response.success) {
                    setConversations(response.conversations);
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchConversations();
        }
    }, [user]);

    // Listen for new messages to update conversation list
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = async () => {
            // Refresh conversations to update last message and order
            try {
                const response = await apiClient.get('/api/messages/conversations');
                if (response.success) {
                    setConversations(response.conversations);
                }
            } catch (error) {
                console.error('Error refreshing conversations:', error);
            }
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('new_message_notification', handleNewMessage);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('new_message_notification', handleNewMessage);
        };
    }, [socket]);


    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
    };

    if (loading) {
        return (
            <div className="messages-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="messages-page">
            <div className="messages-container">
                <div className="conversations-panel">
                    <div className="panel-header">
                        <h2>Messages</h2>
                    </div>
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversation?._id}
                        onSelect={handleSelectConversation}
                        currentUserId={user?._id}
                    />
                </div>
                <div className="chat-panel">
                    {selectedConversation ? (
                        <ChatWindow conversation={selectedConversation} />
                    ) : (
                        <div className="no-conversation-selected">
                            <span className="empty-icon">💬</span>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the list to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
