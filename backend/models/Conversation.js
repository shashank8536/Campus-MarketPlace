const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure exactly 2 participants
conversationSchema.pre('validate', function (next) {
    if (this.participants.length !== 2) {
        next(new Error('A conversation must have exactly 2 participants'));
    } else {
        next();
    }
});

// Compound index for fast lookups - conversations between two users about a specific listing
conversationSchema.index({ participants: 1, listing: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Method to get unread count for a specific user
conversationSchema.methods.getUnreadCount = async function (userId) {
    const Message = mongoose.model('Message');

    const count = await Message.countDocuments({
        conversation: this._id,
        sender: { $ne: userId },
        readBy: { $ne: userId }
    });

    return count;
};

module.exports = mongoose.model('Conversation', conversationSchema);
