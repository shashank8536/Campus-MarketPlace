const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// @route   GET /api/listings
// @desc    Get all active listings (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, search, category, minPrice, maxPrice, sortBy } = req.query;

        let query = { isActive: true };

        // Filter by type if provided
        if (type && ['buy', 'sell', 'exchange'].includes(type.toLowerCase())) {
            query.type = type.toLowerCase();
        }

        // Filter by category if provided
        if (category && category !== 'All') {
            query.category = category;
        }

        // Search in title and description if search term provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Price range filter (skip for exchange type)
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Build sort object
        let sort = { createdAt: -1 }; // Default: newest first
        if (sortBy === 'price-asc') {
            sort = { price: 1 };
        } else if (sortBy === 'price-desc') {
            sort = { price: -1 };
        } else if (sortBy === 'popular') {
            sort = { viewCount: -1 };
        }

        const listings = await Listing.find(query)
            .populate('seller', 'name email campusId')
            .sort(sort);

        res.json({ success: true, count: listings.length, data: listings });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/listings/my
// @desc    Get current user's listings
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const listings = await Listing.find({ seller: req.session.userId })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: listings.length, data: listings });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/listings/:id
// @desc    Get single listing and increment view count
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        ).populate('seller', 'name email campusId phoneNumber');

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, data: listing });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/listings/user/:userId
// @desc    Get all listings from a specific user (User Profile)
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.params.userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const listings = await Listing.find({
            seller: req.params.userId,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                campusId: user.campusId,
                phoneNumber: user.phoneNumber,
                createdAt: user.createdAt
            },
            listings,
            listingCount: listings.length
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/listings/:id/status
// @desc    Update listing status (mark as sold/completed)
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;

        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check if user is the seller
        if (listing.seller.toString() !== req.session.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        listing.status = status;
        if (status === 'sold' || status === 'completed') {
            listing.isActive = false;
        }

        await listing.save();

        res.json({ success: true, data: listing });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', protect, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, type, price, category } = req.body;

        // Process uploaded images
        const images = req.files ? req.files.map(file => ({
            filename: file.filename,
            url: `/uploads/${file.filename}`
        })) : [];

        // Set imageUrl to first image or placeholder
        const imageUrl = images.length > 0
            ? images[0].url
            : 'https://via.placeholder.com/400x300?text=No+Image';

        const listing = await Listing.create({
            title,
            description,
            type,
            price: type === 'exchange' ? null : price,
            category,
            images,
            imageUrl,
            seller: req.session.userId
        });

        const populatedListing = await Listing.findById(listing._id)
            .populate('seller', 'name email campusId');

        res.status(201).json({ success: true, data: populatedListing });
    } catch (error) {
        // Clean up uploaded files if listing creation fails
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check if user is the seller
        if (listing.seller.toString() !== req.session.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
        }

        const { title, description, type, price, category, imageUrl, isActive, status } = req.body;

        listing = await Listing.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                type,
                price: type === 'exchange' ? null : price,
                category,
                imageUrl,
                isActive,
                status: status || listing.status
            },
            { new: true, runValidators: true }
        ).populate('seller', 'name email campusId phoneNumber');

        res.json({ success: true, data: listing });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check if user is the seller
        if (listing.seller.toString() !== req.session.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
        }

        await listing.deleteOne();

        res.json({ success: true, message: 'Listing deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
