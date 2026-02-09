import React, { useState } from 'react';
import StarRating from './StarRating';
import './ReviewForm.css';

const ReviewForm = ({ revieweeId, revieweeName, listingId, exchangeRequestId, onSubmit, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSubmit({ revieweeId, listingId, exchangeRequestId, rating, comment });
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const characterCount = comment.length;
    const maxCharacters = 500;

    return (
        <div className="review-form-container">
            <h3>Rate Your Experience</h3>
            <p className="review-subtitle">
                How was your transaction with <strong>{revieweeName}</strong>?
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label>Rating *</label>
                    <StarRating
                        rating={rating}
                        onChange={setRating}
                        size="large"
                    />
                    {rating > 0 && (
                        <p className="rating-label">
                            {rating === 5 && '⭐ Excellent'}
                            {rating === 4 && '👍 Good'}
                            {rating === 3 && '😐 Average'}
                            {rating === 2 && '👎 Below Average'}
                            {rating === 1 && '😞 Poor'}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="comment">Your Review (Optional)</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share details about your experience..."
                        maxLength={maxCharacters}
                        rows="4"
                    />
                    <div className="character-count">
                        {characterCount}/{maxCharacters} characters
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || rating === 0}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
