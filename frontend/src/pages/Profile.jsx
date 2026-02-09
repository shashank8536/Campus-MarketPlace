import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import './ProfileSettings.css';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(apiUrl('/api/auth/profile'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess('✅ Profile updated successfully!');

            // Update local user data
            window.location.reload(); // Refresh to get updated user data
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-container">
                <div className="error-message">Please login to view your profile</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar-large">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <h1>My Profile</h1>
                    <p className="profile-subtitle">Manage your account information</p>
                </div>

                {success && <div className="success-message">{success}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-section">
                        <h3>📧 Account Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{user.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Campus ID:</span>
                                <span className="info-value">{user.campusId}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Member Since:</span>
                                <span className="info-value">
                                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <p className="info-note">
                            ℹ️ Email and Campus ID cannot be changed
                        </p>
                    </div>

                    <div className="form-section">
                        <h3>✏️ Editable Information</h3>

                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">
                                Phone Number (Optional)
                                <span className="field-hint">
                                    📱 Visible to users when they view your listings
                                </span>
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="9876543210"
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit phone number"
                            />
                            <span className="field-help">
                                💡 Enter 10-digit number without country code
                            </span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : '💾 Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
