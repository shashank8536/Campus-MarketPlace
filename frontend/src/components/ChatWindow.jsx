import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { apiClient } from '../config/api';
import './ChatWindow.css';

const ChatWindow = ({ conversation, onClose, isEmbedded = false }) => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const [otherUser, setOtherUser] = useState(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Find the other participant
    useEffect(() => {
        if (conversation && user) {
            const other = conversation.participants.find(p => p._id !== user._id);
            setOtherUser(other);
        }
    }, [conversation, user]);

    // Fetch messages when conversation changes
    useEffect(() => {
        if (!conversation) return;

        const fetchMessages = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/api/messages/${conversation._id}`);
                if (response.success) {
                    setMessages(response.messages);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Join conversation room via socket
        if (socket) {
            socket.emit('join_conversation', conversation._id);
        }

        return () => {
            // Leave conversation room when unmounting
            if (socket) {
                socket.emit('leave_conversation', conversation._id);
            }
        };
    }, [conversation, socket]);

    // Listen for new messages via socket
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            console.log('Received message via socket:', data);
            console.log('Current conversation ID:', conversation?._id);

            if (data.conversationId === conversation?._id) {
                console.log('Message belongs to this conversation, adding to UI');
                // Remove any optimistic messages with temp IDs and add the real message
                setMessages(prev => {
                    const filtered = prev.filter(msg => !msg._id.toString().startsWith('temp-'));
                    return [...filtered, data.message];
                });
            } else {
                console.log('Message belongs to a different conversation');
            }
        };

        console.log('Setting up receive_message listener');
        socket.on('receive_message', handleNewMessage);

        return () => {
            console.log('Cleaning up receive_message listener');
            socket.off('receive_message', handleNewMessage);
        };
    }, [socket, conversation]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setSending(true);

        console.log('Sending message:', {
            content: messageContent,
            conversationId: conversation._id,
            receiverId: otherUser?._id,
            socketConnected: socket?.connected
        });

        // Create optimistic message for immediate UI update
        const optimisticMessage = {
            _id: `temp-${Date.now()}`,
            content: messageContent,
            sender: {
                _id: user._id,
                name: user.name
            },
            createdAt: new Date().toISOString(),
            readBy: [user._id]
        };

        // Add message optimistically
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            if (socket && socket.connected) {
                console.log('Sending via Socket.io');
                // Send via socket for real-time delivery
                socket.emit('send_message', {
                    conversationId: conversation._id,
                    content: messageContent,
                    receiverId: otherUser?._id
                });

                // Socket.io messages will be replaced by the server response via receive_message event
            } else {
                console.log('Socket not connected, using REST API');
                // Fallback to REST API
                const response = await apiClient.post('/api/messages/send', {
                    conversationId: conversation._id,
                    content: messageContent
                });

                console.log('REST API response:', response);

                if (response.success) {
                    // Replace optimistic message with real one
                    setMessages(prev =>
                        prev.map(msg =>
                            msg._id === optimisticMessage._id ? response.message : msg
                        )
                    );
                } else {
                    // Remove optimistic message on failure
                    setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
                    alert('Failed to send message');
                    setNewMessage(messageContent);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
            alert('Failed to send message');
            setNewMessage(messageContent); // Restore message
        } finally {
            setSending(false);
        }
    };

    if (!conversation) {
        return (
            <div className="chat-window empty">
                <p>Select a conversation to start messaging</p>
            </div>
        );
    }

    const getListingImage = () => {
        if (conversation.listing?.images?.length > 0) {
            return conversation.listing.images[0].url;
        }
        return conversation.listing?.imageUrl || 'https://via.placeholder.com/50';
    };

    return (
        <div className={`chat-window ${isEmbedded ? 'embedded' : ''}`}>
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-info">
                    <img
                        src={getListingImage()}
                        alt={conversation.listing?.title}
                        className="listing-thumb"
                    />
                    <div className="chat-header-text">
                        <h3>{otherUser?.name || 'User'}</h3>
                        <p className="listing-title">{conversation.listing?.title}</p>
                    </div>
                </div>
                {onClose && (
                    <button className="close-btn" onClick={onClose}>✕</button>
                )}
            </div>

            {/* Messages */}
            <div className="messages-container">
                {loading ? (
                    <div className="loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                currentUserId={user._id}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form className="message-input-container" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    className="message-input"
                />
                <button
                    type="submit"
                    className="send-btn"
                    disabled={!newMessage.trim() || sending}
                >
                    {sending ? '...' : '➤'}
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
