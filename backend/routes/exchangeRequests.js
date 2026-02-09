const express = require('express');
const router = express.Router();
const ExchangeRequest = require('../models/ExchangeRequest');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// @route   POST /api/exchange-requests
// @desc    Create new exchange request
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { requestedItemId, offeredItemId, message } = req.body;

        // Validate both items exist
        const requestedItem = await Listing.findById(requestedItemId).populate('seller');
        const offeredItem = await Listing.findById(offeredItemId).populate('seller');

        if (!requestedItem || !offeredItem) {
            return res.status(404).json({ message: 'One or both items not found' });
        }

        // Validate both items are exchange type
        if (requestedItem.type !== 'exchange' || offeredItem.type !== 'exchange') {
            return res.status(400).json({ message: 'Both items must be of type "exchange"' });
        }

        // Validate user owns the offered item
        if (offeredItem.seller._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only offer your own items' });
        }

        // Validate user doesn't own the requested item
        if (requestedItem.seller._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot request your own item' });
        }

        // Validate both items are available
        if (requestedItem.status !== 'available' || offeredItem.status !== 'available') {
            return res.status(400).json({ message: 'Both items must be available for exchange' });
        }

        // Check for existing pending request
        const existingRequest = await ExchangeRequest.findOne({
            requester: req.user._id,
            requestedItem: requestedItemId,
            offeredItem: offeredItemId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request for this exchange' });
        }

        // Create exchange request
        const exchangeRequest = await ExchangeRequest.create({
            requester: req.user._id,
            requestedItem: requestedItemId,
            offeredItem: offeredItemId,
            requestedItemOwner: requestedItem.seller._id,
            message: message || ''
        });

        // Populate and return
        const populatedRequest = await ExchangeRequest.findById(exchangeRequest._id)
            .populate('requester', 'name email campusId')
            .populate('requestedItem')
            .populate('offeredItem')
            .populate('requestedItemOwner', 'name email');

        res.status(201).json({
            success: true,
            data: populatedRequest
        });
    } catch (error) {
        console.error('Create exchange request error:', error);
        res.status(500).json({ message: error.message || 'Server error creating exchange request' });
    }
});

// @route   GET /api/exchange-requests/received
// @desc    Get exchange requests received by current user
// @access  Private
router.get('/received', protect, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { requestedItemOwner: req.user._id };

        if (status && status !== 'all') {
            filter.status = status;
        }

        const requests = await ExchangeRequest.find(filter)
            .populate('requester', 'name email campusId phoneNumber')
            .populate('requestedItem')
            .populate('offeredItem')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error('Get received requests error:', error);
        res.status(500).json({ message: 'Server error fetching received requests' });
    }
});

// @route   GET /api/exchange-requests/sent
// @desc    Get exchange requests sent by current user
// @access  Private
router.get('/sent', protect, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { requester: req.user._id };

        if (status && status !== 'all') {
            filter.status = status;
        }

        const requests = await ExchangeRequest.find(filter)
            .populate('requestedItemOwner', 'name email campusId phoneNumber')
            .populate('requestedItem')
            .populate('offeredItem')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error('Get sent requests error:', error);
        res.status(500).json({ message: 'Server error fetching sent requests' });
    }
});

// @route   PUT /api/exchange-requests/:id/accept
// @desc    Accept an exchange request
// @access  Private
router.put('/:id/accept', protect, async (req, res) => {
    try {
        const exchangeRequest = await ExchangeRequest.findById(req.params.id)
            .populate('requestedItem')
            .populate('offeredItem');

        if (!exchangeRequest) {
            return res.status(404).json({ message: 'Exchange request not found' });
        }

        // Verify user is the requested item owner
        if (exchangeRequest.requestedItemOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only accept requests for your own items' });
        }

        // Verify request is still pending
        if (exchangeRequest.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been responded to' });
        }

        // Update both listings to exchanged status
        await Listing.findByIdAndUpdate(exchangeRequest.requestedItem._id, {
            status: 'exchanged',
            exchangedWith: exchangeRequest.offeredItem._id
        });

        await Listing.findByIdAndUpdate(exchangeRequest.offeredItem._id, {
            status: 'exchanged',
            exchangedWith: exchangeRequest.requestedItem._id
        });

        // Update exchange request
        exchangeRequest.status = 'accepted';
        exchangeRequest.respondedAt = new Date();
        await exchangeRequest.save();

        const populatedRequest = await ExchangeRequest.findById(exchangeRequest._id)
            .populate('requester', 'name email')
            .populate('requestedItem')
            .populate('offeredItem')
            .populate('requestedItemOwner', 'name email');

        res.json({
            success: true,
            message: 'Exchange request accepted! Both items have been marked as exchanged.',
            data: populatedRequest
        });
    } catch (error) {
        console.error('Accept exchange request error:', error);
        res.status(500).json({ message: 'Server error accepting exchange request' });
    }
});

// @route   PUT /api/exchange-requests/:id/reject
// @desc    Reject an exchange request
// @access  Private
router.put('/:id/reject', protect, async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const exchangeRequest = await ExchangeRequest.findById(req.params.id);

        if (!exchangeRequest) {
            return res.status(404).json({ message: 'Exchange request not found' });
        }

        // Verify user is the requested item owner
        if (exchangeRequest.requestedItemOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only reject requests for your own items' });
        }

        // Verify request is still pending
        if (exchangeRequest.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been responded to' });
        }

        // Update exchange request
        exchangeRequest.status = 'rejected';
        exchangeRequest.rejectionReason = rejectionReason || 'No reason provided';
        exchangeRequest.respondedAt = new Date();
        await exchangeRequest.save();

        const populatedRequest = await ExchangeRequest.findById(exchangeRequest._id)
            .populate('requester', 'name email')
            .populate('requestedItem')
            .populate('offeredItem')
            .populate('requestedItemOwner', 'name email');

        res.json({
            success: true,
            message: 'Exchange request rejected',
            data: populatedRequest
        });
    } catch (error) {
        console.error('Reject exchange request error:', error);
        res.status(500).json({ message: 'Server error rejecting exchange request' });
    }
});

// @route   DELETE /api/exchange-requests/:id
// @desc    Cancel a pending exchange request
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const exchangeRequest = await ExchangeRequest.findById(req.params.id);

        if (!exchangeRequest) {
            return res.status(404).json({ message: 'Exchange request not found' });
        }

        // Verify user is the requester
        if (exchangeRequest.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only cancel your own requests' });
        }

        // Verify request is still pending
        if (exchangeRequest.status !== 'pending') {
            return res.status(400).json({ message: 'You can only cancel pending requests' });
        }

        // Update to cancelled status instead of deleting (for audit trail)
        exchangeRequest.status = 'cancelled';
        exchangeRequest.respondedAt = new Date();
        await exchangeRequest.save();

        res.json({
            success: true,
            message: 'Exchange request cancelled'
        });
    } catch (error) {
        console.error('Cancel exchange request error:', error);
        res.status(500).json({ message: 'Server error cancelling exchange request' });
    }
});

// @route   GET /api/exchange-requests/count/pending
// @desc    Get count of pending received requests (for badge)
// @access  Private
router.get('/count/pending', protect, async (req, res) => {
    try {
        const count = await ExchangeRequest.countDocuments({
            requestedItemOwner: req.user._id,
            status: 'pending'
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get pending count error:', error);
        res.status(500).json({ message: 'Server error getting pending count' });
    }
});

module.exports = router;
