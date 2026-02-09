import React from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import './ListingCard.css';

const ListingCard = ({ listing, onEdit, onDelete, showActions = false }) => {
    const navigate = useNavigate();

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'buy': return 'badge-buy';
            case 'sell': return 'badge-sell';
            case 'exchange': return 'badge-exchange';
            default: return '';
        }
    };

    const handleCardClick = () => {
        if (!showActions) {
            navigate(`/listing/${listing._id}`);
        }
    };

    // Fix image URL to use backend server
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/400x300?text=No+Image';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${API_BASE_URL}${imageUrl}`;
    };

    return (
        <div className="listing-card" onClick={handleCardClick}>
            <div className="listing-image-container">
                <img
                    src={getImageUrl(listing.imageUrl)}
                    alt={listing.title}
                    className="listing-image"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                />
                <span className={`type-badge ${getTypeBadgeClass(listing.type)}`}>
                    {listing.type.toUpperCase()}
                </span>
                <span className="campus-badge">
                    🏫 Same Campus
                </span>
            </div>

            <div className="listing-content">
                <div className="listing-category">{listing.category}</div>
                <h3 className="listing-title">{listing.title}</h3>
                <p className="listing-description">{listing.description}</p>

                <div className="listing-footer">
                    <div className="listing-price">
                        {listing.type === 'exchange' ? (
                            <span className="exchange-label">For Exchange</span>
                        ) : (
                            <span className="price">₹{listing.price}</span>
                        )}
                    </div>

                    {listing.seller && (
                        <div className="seller-info">
                            <span className="seller-name">{listing.seller.name}</span>
                        </div>
                    )}
                </div>

                {showActions && (
                    <div className="listing-actions">
                        <button onClick={() => onEdit(listing)} className="btn btn-small btn-primary">
                            Edit
                        </button>
                        <button onClick={() => onDelete(listing._id)} className="btn btn-small btn-danger">
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingCard;
