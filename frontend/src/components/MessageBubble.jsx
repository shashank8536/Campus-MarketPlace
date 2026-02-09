import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, currentUserId }) => {
    // Convert both IDs to strings for comparison to handle ObjectId vs string mismatch
    // Add safety checks to prevent errors if sender is undefined
    const isSent = message?.sender?._id && currentUserId
        ? message.sender._id.toString() === currentUserId.toString()
        : false;

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        // Format as time for today, date for older
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
            {!isSent && (
                <div className="message-sender">{message.sender.name}</div>
            )}
            <div className="message-content">{message.content}</div>
            <div className="message-time">{formatTime(message.createdAt)}</div>
        </div>
    );
};

export default MessageBubble;
