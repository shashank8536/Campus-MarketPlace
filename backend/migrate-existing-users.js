// Migration script to mark all existing users as verified
// Run this ONCE to update existing users in the database

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const migrateExistingUsers = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📊 Connected to MongoDB');

        // Update all users to mark them as verified
        const result = await User.updateMany(
            {
                $or: [
                    { isEmailVerified: { $exists: false } },
                    { isEmailVerified: false }
                ]
            },
            {
                $set: { isEmailVerified: true },
                $unset: {
                    emailVerificationToken: "",
                    emailVerificationExpires: ""
                }
            }
        );

        console.log('✅ Migration complete!');
        console.log(`📝 Updated ${result.modifiedCount} existing users`);
        console.log(`   All existing users can now log in without email verification`);
        console.log('');
        console.log('ℹ️  New users registering from now on will need to verify their email.');

        // Close connection
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateExistingUsers();
