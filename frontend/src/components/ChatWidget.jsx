import React, { useEffect } from 'react';
import ChatWindow from './ChatWindow';
import { useSocket } from '../context/SocketContext';
import './ChatWidget.css';

const ChatWidget = () => {
    const { activeConversation, isWidgetOpen, isWidgetMinimized, closeChatWidget, toggleMinimize } = useSocket();

    if (!isWidgetOpen || !activeConversation) {
        return null;
    }

    return (
        <div className={`chat-widget ${isWidgetMinimized ? 'minimized' : ''}`}>
            {isWidgetMinimized ? (
                <div className="widget-minimized-header" onClick={toggleMinimize}>
                    <span className="widget-title">
                        {activeConversation.participants.find(p => p._id !== activeConversation.participants[0]._id)?.name || 'Chat'}
                    </span>
                    <div className="widget-controls">
                        <button className="widget-btn close-widget" onClick={(e) => {
                            e.stopPropagation();
                            closeChatWidget();
                        }}>✕</button>
                    </div>
                </div>
            ) : (
                <div className="widget-expanded">
                    <div className="widget-header">
                        <div className="widget-controls">
                            <button className="widget-btn minimize-widget" onClick={toggleMinimize}>—</button>
                            <button className="widget-btn close-widget" onClick={closeChatWidget}>✕</button>
                        </div>
                    </div>
                    <ChatWindow conversation={activeConversation} isEmbedded={true} />
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
