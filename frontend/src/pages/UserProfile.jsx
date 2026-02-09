import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import ReviewList from '../components/ReviewList';
import StarRating from '../components/StarRating';
import { apiUrl } from '../config/api';
import './UserProfile.css';

const UserProfile = () => {
    const { userId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
        fetchUserReviews();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(apiUrl(`/api/listings/user/${userId}`));
            const data = await response.json();
            if (data.success) {
                setProfileData(data);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserReviews = async () => {
        try {
            const response = await fetch(apiUrl(`/api/reviews/user/${userId}`));
            const data = await response.json();
            if (data.success) {
                setReviews(data.reviews);
                setAverageRating(data.averageRating || 0);
                setTotalReviews(data.totalReviews || 0);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading profile...</div>;
    if (!profileData) return <div className="error">User not found</div>;

    const { user, listings, listingCount } = profileData;
    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const isTrustedSeller = averageRating >= 4.5 && totalReviews >= 10;

    return (
        <div className="user-profile-container">
            <div className="profile-header">
                <div className="profile-avatar-large">
                    {user.name[0].toUpperCase()}
                </div>
                <div className="profile-info">
                    <div className="profile-name-row">
                        <h1 className="profile-name">{user.name}</h1>
                        {isTrustedSeller && (
                            <span className="trusted-badge" title="Trusted Seller">
                                ✓ Trusted Seller
                            </span>
                        )}
                    </div>
                    {totalReviews > 0 && (
                        <div className="profile-rating">
                            <StarRating rating={averageRating} readonly size="medium" />
                            <span className="review-count">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
                        </div>
                    )}
                    <p className="profile-campus-id">🎓 Campus ID: {user.campusId}</p>
                    <p className="profile-join-date">📅 Member since {joinDate}</p>
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-number">{listingCount}</span>
                            <span className="stat-label">Active Listings</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{totalReviews}</span>
                            <span className="stat-label">Reviews</span>
                        </div>
                        {totalReviews > 0 && (
                            <div className="stat-item">
                                <span className="stat-number">{averageRating.toFixed(1)} ★</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-listings-section">
                    <h2>All Listings by {user.name.split(' ')[0]}</h2>

                    {listings.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>No active listings</h3>
                            <p>This user hasn't posted any items yet</p>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {listings.map(listing => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="profile-reviews-section">
                    <ReviewList
                        reviews={reviews}
                        averageRating={averageRating}
                        totalReviews={totalReviews}
                        loading={reviewsLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
