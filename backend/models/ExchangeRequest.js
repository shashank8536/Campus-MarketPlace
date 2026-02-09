const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    offeredItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    requestedItemOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    },
    message: {
        type: String,
        trim: true,
        maxlength: [300, 'Message cannot exceed 300 characters']
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [200, 'Rejection reason cannot exceed 200 characters']
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
exchangeRequestSchema.index({ requester: 1, status: 1 });
exchangeRequestSchema.index({ requestedItemOwner: 1, status: 1 });
exchangeRequestSchema.index({ requestedItem: 1, offeredItem: 1 });

// Prevent duplicate pending requests for same item pair
exchangeRequestSchema.index(
    { requester: 1, requestedItem: 1, offeredItem: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
