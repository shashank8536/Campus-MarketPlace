const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = async () => {
    // For development/testing, use ethereal.email (fake SMTP)
    // For production, replace with Gmail or other SMTP credentials

    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_HOST) {
        // Production configuration
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Development/testing with ethereal.email
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        console.log('📧 Using Ethereal Email for testing');
        console.log(`Test account: ${testAccount.user}`);

        return transporter;
    }
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
    try {
        const transporter = await createTransporter();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verify-email/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Campus Marketplace" <noreply@campus-marketplace.com>',
            to: email,
            subject: 'Verify Your Campus Marketplace Account',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 Campus Marketplace</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome, ${name}! 👋</h2>
                            <p>Thank you for signing up for Campus Marketplace - your trusted platform for buying, selling, and exchanging items within the GLA campus community.</p>
                            
                            <p>To complete your registration and start exploring listings, please verify your email address by clicking the button below:</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationUrl}" class="button">✅ Verify Email Address</a>
                            </div>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
                                ${verificationUrl}
                            </p>
                            
                            <p><strong>⏰ This link will expire in 24 hours.</strong></p>
                            
                            <p>If you didn't create an account with Campus Marketplace, please ignore this email.</p>
                            
                            <div class="footer">
                                <p>Campus Marketplace - GLA University<br>
                                Connecting students, one trade at a time 🤝</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Welcome to Campus Marketplace, ${name}!
                
                Please verify your email address by visiting the following link:
                ${verificationUrl}
                
                This link will expire in 24 hours.
                
                If you didn't create an account, please ignore this email.
                
                - Campus Marketplace Team
            `
        };

        const info = await transporter.sendMail(mailOptions);

        // In development, log the ethereal URL to view the email
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n' + '='.repeat(80));
            console.log('📧 VERIFICATION EMAIL SENT!');
            console.log('='.repeat(80));
            console.log('📬 To:', email);
            console.log('🔗 PREVIEW URL (Click to view email):');
            console.log('👉', nodemailer.getTestMessageUrl(info));
            console.log('='.repeat(80) + '\n');
        }

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send verification email');
    }
};

module.exports = {
    sendVerificationEmail
};
