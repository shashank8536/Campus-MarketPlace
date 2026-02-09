const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Who wrote the review
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Who is being reviewed
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Which listing was involved
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    // For exchanges (optional)
    exchangeRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExchangeRequest'
    },
    // Star rating (1-5)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    // Written review (optional)
    comment: {
        type: String,
        maxlength: 500,
        trim: true
    }
}, {
    timestamps: true
});

// Ensure one review per reviewer per listing
reviewSchema.index({ reviewer: 1, listing: 1 }, { unique: true });

// Prevent self-reviews
reviewSchema.pre('save', function (next) {
    if (this.reviewer.toString() === this.reviewee.toString()) {
        next(new Error('You cannot review yourself'));
    }
    next();
});

module.exports = mongoose.model('Review', reviewSchema);
