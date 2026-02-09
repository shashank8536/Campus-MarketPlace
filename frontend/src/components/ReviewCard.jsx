import React from 'react';
import StarRating from './StarRating';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="reviewer-info">
                    <div className="reviewer-avatar">
                        {review.reviewer?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="reviewer-details">
                        <h4>{review.reviewer?.name || 'Anonymous'}</h4>
                        <div className="review-meta">
                            <StarRating rating={review.rating} readonly size="small" />
                            <span className="review-date">{formatDate(review.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {review.comment && (
                <p className="review-comment">{review.comment}</p>
            )}

            {review.listing && (
                <div className="review-listing">
                    <span className="listing-label">Item:</span> {review.listing.title}
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
