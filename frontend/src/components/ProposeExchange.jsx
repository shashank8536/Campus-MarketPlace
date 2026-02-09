import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import './ProposeExchange.css';

const ProposeExchange = ({ requestedListing, onClose, onSuccess }) => {
    const [myExchangeListings, setMyExchangeListings] = useState([]);
    const [selectedListingId, setSelectedListingId] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyExchangeListings();
    }, []);

    const fetchMyExchangeListings = async () => {
        try {
            const response = await fetch(apiUrl('/api/listings/my'), {
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok && data.success) {
                // Filter only exchange type listings that are available
                const exchangeListings = (data.data || []).filter(
                    listing => listing.type === 'exchange' && listing.status === 'available'
                );
                setMyExchangeListings(exchangeListings);
            } else {
                setError(data.message || 'Failed to load your exchange listings');
            }
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load your exchange listings');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedListingId) {
            setError('Please select an item to offer');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(apiUrl('/api/exchange-requests'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    requestedItemId: requestedListing._id,
                    offeredItemId: selectedListingId,
                    message: message
                })
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess?.();
                onClose();
            } else {
                setError(data.message || 'Failed to send exchange request');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedListing = myExchangeListings.find(l => l._id === selectedListingId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content propose-exchange-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h2>📦 Propose Exchange</h2>
                <p className="modal-subtitle">Select one of your items to exchange</p>

                {error && <div className="error-message">{error}</div>}

                <div className="exchange-preview">
                    <div className="exchange-item">
                        <h3>You want:</h3>
                        <div className="item-card">
                            <img src={requestedListing.imageUrl} alt={requestedListing.title} />
                            <div className="item-info">
                                <h4>{requestedListing.title}</h4>
                                <p>{requestedListing.description?.substring(0, 80)}...</p>
                                <span className="category-badge">{requestedListing.category}</span>
                            </div>
                        </div>
                    </div>

                    <div className="exchange-arrow">⇄</div>

                    <div className="exchange-item">
                        <h3>You offer:</h3>
                        {selectedListing ? (
                            <div className="item-card">
                                <img src={selectedListing.imageUrl} alt={selectedListing.title} />
                                <div className="item-info">
                                    <h4>{selectedListing.title}</h4>
                                    <p>{selectedListing.description?.substring(0, 80)}...</p>
                                    <span className="category-badge">{selectedListing.category}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="item-placeholder">
                                Select an item below
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="offeredItem">Select Your Item *</label>
                        {myExchangeListings.length === 0 ? (
                            <div className="empty-state">
                                <p>📭 You don't have any exchange items available.</p>
                                <p className="hint">Create an exchange listing first to propose trades!</p>
                            </div>
                        ) : (
                            <select
                                id="offeredItem"
                                value={selectedListingId}
                                onChange={(e) => setSelectedListingId(e.target.value)}
                                required
                            >
                                <option value="">-- Choose an item --</option>
                                {myExchangeListings.map(listing => (
                                    <option key={listing._id} value={listing._id}>
                                        {listing.title} ({listing.category})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message (Optional)</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a message to the owner..."
                            maxLength={300}
                            rows={3}
                        />
                        <span className="char-count">{message.length}/300</span>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || myExchangeListings.length === 0}
                        >
                            {loading ? '🔄 Sending...' : '📤 Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProposeExchange;
