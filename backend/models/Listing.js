const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    type: {
        type: String,
        required: [true, 'Please specify listing type'],
        enum: ['buy', 'sell', 'exchange'],
        lowercase: true
    },
    price: {
        type: Number,
        min: 0,
        default: null
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Electronics', 'Books', 'Clothing', 'Furniture', 'Sports', 'Other'],
        default: 'Other'
    },
    images: [{
        filename: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    // Keep imageUrl for backward compatibility (will use first image or placeholder)
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/400x300?text=No+Image'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'exchanged', 'completed', 'inactive'],
        default: 'available'
    },
    exchangedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        default: null
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);
