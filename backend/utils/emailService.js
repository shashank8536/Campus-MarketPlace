const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Send verification email
const sendVerificationEmail = async (email, token, userName) => {
    try {
        const transporter = createTransporter();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Campus Marketplace'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verify Your Email - Campus Marketplace',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 30px 20px;
                            text-align: center;
                            color: white;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .content h2 {
                            color: #667eea;
                            margin-top: 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 14px 32px;
                            margin: 20px 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white !important;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            font-size: 16px;
                        }
                        .button:hover {
                            opacity: 0.9;
                        }
                        .info-box {
                            background-color: #f8f9fa;
                            border-left: 4px solid #667eea;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                        }
                        .divider {
                            height: 1px;
                            background-color: #e0e0e0;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 Campus Marketplace</h1>
                            <p>GLA University Student Platform</p>
                        </div>
                        <div class="content">
                            <h2>Welcome, ${userName}! 👋</h2>
                            <p>Thank you for joining Campus Marketplace, the exclusive platform for GLA University students.</p>
                            <p>To get started, please verify your email address by clicking the button below:</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                            </div>
                            
                            <div class="info-box">
                                <strong>⏰ Important:</strong> This verification link will expire in 24 hours.
                            </div>
                            
                            <div class="divider"></div>
                            
                            <p style="font-size: 14px; color: #666;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="font-size: 12px; word-break: break-all; color: #667eea;">
                                ${verificationUrl}
                            </p>
                            
                            <div class="divider"></div>
                            
                            <p style="font-size: 12px; color: #999;">
                                If you didn't create an account, please ignore this email.
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Campus Marketplace - GLA University</p>
                            <p>This is an automated email, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email (for future use)
const sendPasswordResetEmail = async (email, token, userName) => {
    try {
        const transporter = createTransporter();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Campus Marketplace'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Request - Campus Marketplace',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
                        .content { padding: 30px; }
                        .button { display: inline-block; padding: 14px 32px; margin: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
                        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset</h1>
                        </div>
                        <div class="content">
                            <h2>Hello, ${userName}</h2>
                            <p>We received a request to reset your password. Click the button below to proceed:</p>
                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </div>
                            <p style="font-size: 14px; color: #666;">This link will expire in 1 hour.</p>
                            <p style="font-size: 12px; color: #999;">If you didn't request a password reset, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Campus Marketplace - GLA University</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
