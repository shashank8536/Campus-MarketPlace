const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Listing = require('../models/Listing');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: 'Please login to continue' });
    }
    next();
};

// Get all conversations for logged-in user
router.get('/conversations', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        const conversations = await Conversation.find({
            participants: userId
        })
            .populate('participants', 'name email campusId')
            .populate('listing', 'title images imageUrl')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });

        // Add unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await conv.getUnreadCount(userId);
                return {
                    ...conv.toObject(),
                    unreadCount
                };
            })
        );

        res.json({ success: true, conversations: conversationsWithUnread });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get messages for a specific conversation
router.get('/:conversationId', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { conversationId } = req.params;

        // Verify conversation exists and user is a participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Get messages
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            },
            {
                $addToSet: { readBy: userId }
            }
        );

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start or get existing conversation
router.post('/conversations/start', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { receiverId, listingId } = req.body;

        if (!receiverId || !listingId) {
            return res.status(400).json({ success: false, message: 'Receiver and listing are required' });
        }

        // Verify listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] },
            listing: listingId
        })
            .populate('participants', 'name email campusId')
            .populate('listing', 'title images imageUrl')
            .populate('lastMessage');

        // Create new conversation if doesn't exist
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, receiverId],
                listing: listingId
            });

            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'name email campusId')
                .populate('listing', 'title images imageUrl');
        }

        res.json({ success: true, conversation });
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Send a message (REST API fallback, main method is Socket.io)
router.post('/send', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { conversationId, content } = req.body;

        if (!conversationId || !content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Conversation and content are required' });
        }

        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Create message
        const message = await Message.create({
            conversation: conversationId,
            sender: userId,
            content: content.trim(),
            readBy: [userId]
        });

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Populate and return
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name email');

        res.json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark conversation as read
router.put('/:conversationId/read', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { conversationId } = req.params;

        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Mark all messages as read
        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            },
            {
                $addToSet: { readBy: userId }
            }
        );

        res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
