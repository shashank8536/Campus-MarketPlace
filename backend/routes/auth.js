const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/emailService');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, campusId } = req.body;

        // Verify campus email domain
        if (!email.toLowerCase().endsWith('@gla.ac.in')) {
            return res.status(400).json({
                success: false,
                message: 'You must use your GLA campus email address (@gla.ac.in)'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user (not verified yet)
        const user = await User.create({
            name,
            email,
            password,
            campusId,
            isEmailVerified: false
        });

        // Generate verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        try {
            const emailResult = await sendVerificationEmail(email, name, verificationToken);

            // Log preview URL in development
            if (emailResult.previewUrl) {
                console.log('\n🔗 Email Preview URL:', emailResult.previewUrl);
            }
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Delete user if email fails to send
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        // Don't create session yet - require email verification first
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            email: user.email
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
                emailNotVerified: true
            });
        }

        // Create session
        req.session.userId = user._id;

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                campusId: user.campusId
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email with token
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with valid token
        const user = await User.verifyEmailToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with that email address'
            });
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified. You can log in.'
            });
        }

        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        try {
            const emailResult = await sendVerificationEmail(email, user.name, verificationToken);

            if (emailResult.previewUrl) {
                console.log('\n🔗 Email Preview URL:', emailResult.previewUrl);
            }
        } catch (emailError) {
            console.error('Email error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'Verification email sent! Please check your inbox.'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                campusId: user.campusId
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phoneNumber } = req.body;

        // Find user
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                campusId: user.campusId,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
