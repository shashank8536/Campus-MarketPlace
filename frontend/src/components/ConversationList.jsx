import React from 'react';
import './ConversationList.css';

const ConversationList = ({ conversations, selectedId, onSelect, currentUserId }) => {
    const getOtherUser = (participants) => {
        return participants.find(p => p._id !== currentUserId);
    };

    const getListingImage = (listing) => {
        if (listing?.images?.length > 0) {
            return listing.images[0].url;
        }
        return listing?.imageUrl || 'https://via.placeholder.com/60';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    if (!conversations || conversations.length === 0) {
        return (
            <div className="conversation-list empty">
                <div className="empty-state">
                    <span className="empty-icon">💬</span>
                    <p>No conversations yet</p>
                    <small>Start chatting with sellers!</small>
                </div>
            </div>
        );
    }

    return (
        <div className="conversation-list">
            {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation.participants);
                const isSelected = conversation._id === selectedId;
                const hasUnread = conversation.unreadCount > 0;

                return (
                    <div
                        key={conversation._id}
                        className={`conversation-item ${isSelected ? 'selected' : ''} ${hasUnread ? 'unread' : ''}`}
                        onClick={() => onSelect(conversation)}
                    >
                        <img
                            src={getListingImage(conversation.listing)}
                            alt={conversation.listing?.title}
                            className="conversation-image"
                        />
                        <div className="conversation-content">
                            <div className="conversation-header">
                                <h4 className="conversation-name">{otherUser?.name || 'User'}</h4>
                                <span className="conversation-time">
                                    {conversation.lastMessageAt ? formatTime(conversation.lastMessageAt) : ''}
                                </span>
                            </div>
                            <p className="conversation-listing">{conversation.listing?.title}</p>
                            {conversation.lastMessage && (
                                <p className="conversation-preview">
                                    {conversation.lastMessage.content}
                                </p>
                            )}
                        </div>
                        {hasUnread && (
                            <div className="unread-badge">{conversation.unreadCount}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;
