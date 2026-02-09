const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Listing = require('../models/Listing');
const ExchangeRequest = require('../models/ExchangeRequest');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { revieweeId, listingId, exchangeRequestId, rating, comment } = req.body;

        // Validation
        if (!revieweeId || !listingId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Please provide reviewee, listing, and rating'
            });
        }

        // Check if user is trying to review themselves
        if (req.user._id.toString() === revieweeId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot review yourself'
            });
        }

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // Check if reviewee exists
        const reviewee = await User.findById(revieweeId);
        if (!reviewee) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify transaction exists (either user bought the item or exchanged)
        let hasTransaction = false;

        // Check if it's an exchange
        if (exchangeRequestId) {
            const exchange = await ExchangeRequest.findById(exchangeRequestId);
            if (exchange && exchange.status === 'accepted') {
                // Verify user was part of the exchange
                if (exchange.requester.toString() === req.user._id.toString() ||
                    exchange.requestedFrom.toString() === req.user._id.toString()) {
                    hasTransaction = true;
                }
            }
        } else {
            // For regular purchases, check if the listing belongs to the reviewee
            // and user is the one reviewing (buyer reviewing seller)
            if (listing.seller.toString() === revieweeId) {
                hasTransaction = true;
            }
        }

        if (!hasTransaction) {
            return res.status(403).json({
                success: false,
                message: 'You can only review users you have transacted with'
            });
        }

        // Check for duplicate review
        const existingReview = await Review.findOne({
            reviewer: req.user._id,
            listing: listingId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this transaction'
            });
        }

        // Create review
        const review = await Review.create({
            reviewer: req.user._id,
            reviewee: revieweeId,
            listing: listingId,
            exchangeRequest: exchangeRequestId || null,
            rating,
            comment: comment || ''
        });

        // Update reviewee's average rating
        await reviewee.updateRating();

        // Populate reviewer info
        await review.populate('reviewer', 'name email');
        await review.populate('listing', 'title');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });

    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews for a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.userId })
            .populate('reviewer', 'name email')
            .populate('listing', 'title')
            .sort({ createdAt: -1 });

        const user = await User.findById(req.params.userId);

        res.json({
            success: true,
            reviews,
            averageRating: user?.averageRating || 0,
            totalReviews: user?.totalReviews || 0
        });

    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/reviews/listing/:listingId
// @desc    Get reviews for a listing's seller
// @access  Public
router.get('/listing/:listingId', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.listingId).populate('seller');

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        const reviews = await Review.find({ reviewee: listing.seller._id })
            .populate('reviewer', 'name email')
            .populate('listing', 'title')
            .sort({ createdAt: -1 })
            .limit(5); // Latest 5 reviews

        res.json({
            success: true,
            reviews,
            seller: {
                id: listing.seller._id,
                name: listing.seller.name,
                averageRating: listing.seller.averageRating,
                totalReviews: listing.seller.totalReviews
            }
        });

    } catch (error) {
        console.error('Get listing reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/reviews/check/:listingId
// @desc    Check if user can review this listing
// @access  Private
router.get('/check/:listingId', protect, async (req, res) => {
    try {
        const existingReview = await Review.findOne({
            reviewer: req.user._id,
            listing: req.params.listingId
        });

        res.json({
            success: true,
            canReview: !existingReview,
            hasReviewed: !!existingReview
        });

    } catch (error) {
        console.error('Check review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
