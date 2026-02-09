import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { apiUrl } from '../config/api';
import './VerifyEmail.css';

const VerificationPending = () => {
    const location = useLocation();
    const email = location.state?.email || '';
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // success or error
    const [canResend, setCanResend] = useState(true);

    const handleResend = async () => {
        if (!email) {
            setMessage('Email address not found. Please register again.');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(apiUrl('/api/auth/resend-verification'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                setCanResend(false);

                // Re-enable resend after 60 seconds
                setTimeout(() => {
                    setCanResend(true);
                }, 60000);
            } else {
                setMessage(data.message || 'Failed to resend email');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                <div className="verify-content">
                    <div className="icon-circle" style={{ background: '#fff3cd', color: '#856404' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <h1>Check Your Email 📧</h1>

                    <p>
                        We've sent a verification link to<br />
                        <strong>{email || 'your email address'}</strong>
                    </p>

                    <div className="instructions">
                        <h3>Next Steps:</h3>
                        <ol>
                            <li>Open your GLA email inbox</li>
                            <li>Find the email from Campus Marketplace</li>
                            <li>Click the verification link</li>
                            <li>Come back and log in!</li>
                        </ol>
                    </div>

                    {message && (
                        <div className={`message-box ${messageType}`}>
                            {message}
                        </div>
                    )}

                    <div className="action-buttons">
                        <button
                            onClick={handleResend}
                            className="btn btn-primary"
                            disabled={loading || !canResend}
                        >
                            {loading ? 'Sending...' : canResend ? 'Resend Verification Email' : 'Email Resent (wait 60s)'}
                        </button>

                        <Link to="/login" className="btn btn-secondary">
                            Already Verified? Login
                        </Link>
                    </div>

                    <div className="help-section">
                        <h4>Didn't receive the email?</h4>
                        <ul>
                            <li>Check your spam/junk folder</li>
                            <li>Make sure you entered the correct @gla.ac.in email</li>
                            <li>Wait a few minutes and check again</li>
                            <li>Click "Resend Verification Email" above</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPending;
