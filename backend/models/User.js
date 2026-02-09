const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [
            {
                validator: function (email) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
                },
                message: 'Please add a valid email'
            },
            {
                validator: function (email) {
                    return email.endsWith('@gla.ac.in');
                },
                message: 'Only @gla.ac.in email addresses are allowed'
            }
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    campusId: {
        type: String,
        required: [true, 'Please add a campus ID'],
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: ''
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    emailVerificationExpires: {
        type: Date,
        select: false
    },
    // Rating and review fields
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
    const crypto = require('crypto');

    // Generate random token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to emailVerificationToken field
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // Set expiry to 24 hours
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    return verificationToken;
};

// Verify email token
userSchema.statics.verifyEmailToken = async function (token) {
    const crypto = require('crypto');

    // Hash the incoming token
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with matching token that hasn't expired
    const user = await this.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    });

    return user;
};

// Method to update user's average rating
userSchema.methods.updateRating = async function () {
    const Review = require('./Review');

    const stats = await Review.aggregate([
        {
            $match: { reviewee: this._id }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        this.averageRating = Math.round(stats[0].averageRating * 10) / 10; // Round to 1 decimal
        this.totalReviews = stats[0].totalReviews;
    } else {
        this.averageRating = 0;
        this.totalReviews = 0;
    }

    await this.save();
};

module.exports = mongoose.model('User', userSchema);
