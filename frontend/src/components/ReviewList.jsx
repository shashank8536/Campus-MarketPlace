import React from 'react';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import './ReviewList.css';

const ReviewList = ({ reviews, averageRating, totalReviews, loading }) => {
    if (loading) {
        return <div className="reviews-loading">Loading reviews...</div>;
    }

    // Calculate rating breakdown
    const ratingBreakdown = () => {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            breakdown[review.rating]++;
        });
        return breakdown;
    };

    const breakdown = ratingBreakdown();
    const maxCount = Math.max(...Object.values(breakdown));

    return (
        <div className="review-list-container">
            {totalReviews > 0 && (
                <div className="review-summary">
                    <div className="summary-header">
                        <div className="average-rating">
                            <div className="rating-number">{averageRating.toFixed(1)}</div>
                            <StarRating rating={averageRating} readonly size="medium" />
                            <div className="total-reviews">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
                        </div>
                    </div>

                    <div className="rating-breakdown">
                        {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className="breakdown-row">
                                <span className="star-label">{star} ★</span>
                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill"
                                        style={{
                                            width: maxCount > 0 ? `${(breakdown[star] / maxCount) * 100}%` : '0%'
                                        }}
                                    />
                                </div>
                                <span className="breakdown-count">{breakdown[star]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="reviews-list">
                {reviews.length > 0 ? (
                    <>
                        <h3>Customer Reviews</h3>
                        {reviews.map(review => (
                            <ReviewCard key={review._id} review={review} />
                        ))}
                    </>
                ) : (
                    <div className="no-reviews">
                        <div className="no-reviews-icon">📝</div>
                        <p>No reviews yet</p>
                        <p className="no-reviews-hint">Be the first to leave a review!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;
