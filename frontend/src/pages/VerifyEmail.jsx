import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../config/api';
import './VerifyEmail.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await fetch(apiUrl(`/api/auth/verify-email/${token}`), {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Verification failed');
            }
        } catch (error) {
            setStatus('error');
            setMessage('An error occurred during verification. Please try again.');
        }
    };

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                {status === 'verifying' && (
                    <div className="verify-content">
                        <div className="spinner"></div>
                        <h1>Verifying Your Email...</h1>
                        <p>Please wait while we verify your account.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="verify-content success">
                        <div className="icon-circle success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1>Email Verified! ✅</h1>
                        <p>{message}</p>
                        <p className="redirect-message">Redirecting to login in 3 seconds...</p>
                        <Link to="/login" className="btn btn-primary">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="verify-content error">
                        <div className="icon-circle error-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1>Verification Failed ❌</h1>
                        <p>{message}</p>
                        <div className="action-buttons">
                            <Link to="/verification-pending" className="btn btn-primary">
                                Resend Verification Email
                            </Link>
                            <Link to="/register" className="btn btn-secondary">
                                Back to Registration
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
