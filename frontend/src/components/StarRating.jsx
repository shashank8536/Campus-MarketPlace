import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, onChange, readonly = false, size = 'medium' }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (value) => {
        if (!readonly && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const getStarClass = (position) => {
        const currentRating = hoverRating || rating;

        if (currentRating >= position) {
            return 'star filled';
        } else if (currentRating >= position - 0.5) {
            return 'star half-filled';
        }
        return 'star empty';
    };

    return (
        <div className={`star-rating ${size} ${readonly ? 'readonly' : 'interactive'}`}>
            {[1, 2, 3, 4, 5].map((position) => (
                <span
                    key={position}
                    className={getStarClass(position)}
                    onClick={() => handleClick(position)}
                    onMouseEnter={() => handleMouseEnter(position)}
                    onMouseLeave={handleMouseLeave}
                    role={readonly ? 'img' : 'button'}
                    aria-label={`${position} star${position > 1 ? 's' : ''}`}
                >
                    ★
                </span>
            ))}
            {readonly && rating > 0 && (
                <span className="rating-value">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
