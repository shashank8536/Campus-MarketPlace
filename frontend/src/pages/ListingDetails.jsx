import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import apiClient, { apiUrl } from '../config/api';
import ProposeExchange from '../components/ProposeExchange';
import './ListingDetails.css';

const ListingDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { openChatWidget } = useSocket();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContact, setShowContact] = useState(false);
    const [showProposeExchange, setShowProposeExchange] = useState(false);
    const [hasExchangeRequest, setHasExchangeRequest] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [startingChat, setStartingChat] = useState(false);

    useEffect(() => {
        fetchListing();
        if (user) {
            checkExchangeRequest();
        }
    }, [id, user]);

    const fetchListing = async () => {
        try {
            const response = await fetch(apiUrl(`/api/listings/${id}`));
            const data = await response.json();
            if (data.success) {
                setListing(data.data);
            }
        } catch (error) {
            console.error('Error fetching listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkExchangeRequest = async () => {
        if (!listing || listing.type !== 'exchange') return;

        try {
            const response = await fetch(apiUrl('/api/exchange-requests/sent'), {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                const existingRequest = data.data.find(
                    req => req.requestedItem._id === id && req.status === 'pending'
                );
                setHasExchangeRequest(!!existingRequest);
            }
        } catch (error) {
            console.error('Error checking exchange request:', error);
        }
    };

    const handleStartChat = async () => {
        if (!user) {
            alert('Please login to message the seller');
            navigate('/login');
            return;
        }

        console.log('Starting chat with:', {
            receiverId: listing.seller._id,
            listingId: listing._id,
            user: user
        });

        try {
            setStartingChat(true);

            const url = apiUrl('/api/messages/conversations/start');
            console.log('Making request to:', url);

            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    receiverId: listing.seller._id,
                    listingId: listing._id
                })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                openChatWidget(data.conversation);
            } else {
                alert(data.message || 'Failed to start conversation. Please try again.');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            alert('Failed to start conversation. Please try again.');
        } finally {
            setStartingChat(false);
        }
    };

    const handleMarkStatus = async (status) => {
        try {
            const response = await fetch(`/api/listings/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (data.success) {
                setListing(data.data);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'buy': return 'badge-buy';
            case 'sell': return 'badge-sell';
            case 'exchange': return 'badge-exchange';
            default: return '';
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!listing) return <div className="error">Listing not found</div>;

    const isOwner = user && user.id === listing.seller._id;

    return (
        <div className="listing-details-container">
            <div className="details-content">
                <div className="details-header">
                    <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
                    <span className={`status-badge ${listing.status}`}>
                        {listing.status.toUpperCase()}
                    </span>
                </div>

                <div className="details-main">
                    <div className="details-image-section">
                        {listing.images && listing.images.length > 0 ? (
                            <>
                                <img
                                    src={apiUrl(listing.images[currentImageIndex].url)}
                                    alt={listing.title}
                                    className="details-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                                    }}
                                />
                                {listing.images.length > 1 && (
                                    <div className="image-navigation">
                                        <button
                                            className="nav-btn prev"
                                            onClick={() => setCurrentImageIndex((prev) =>
                                                prev === 0 ? listing.images.length - 1 : prev - 1
                                            )}
                                        >
                                            ‹
                                        </button>
                                        <div className="image-dots">
                                            {listing.images.map((_, index) => (
                                                <span
                                                    key={index}
                                                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            className="nav-btn next"
                                            onClick={() => setCurrentImageIndex((prev) =>
                                                (prev + 1) % listing.images.length
                                            )}
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <img
                                src={apiUrl(listing.imageUrl) || 'https://via.placeholder.com/600x400?text=No+Image'}
                                alt={listing.title}
                                className="details-image"
                            />
                        )}
                        <div className="image-info">
                            <span className={`type-badge-large ${getTypeBadgeClass(listing.type)}`}>
                                {listing.type.toUpperCase()}
                            </span>
                            <span className="view-count">👁️ {listing.viewCount || 0} views</span>
                        </div>
                    </div>

                    <div className="details-info-section">
                        <div className="category-tag">{listing.category}</div>
                        <h1 className="details-title">{listing.title}</h1>

                        <div className="price-section">
                            {listing.type === 'exchange' ? (
                                <div className="exchange-label-large">For Exchange</div>
                            ) : (
                                <div className="price-large">₹{listing.price}</div>
                            )}
                        </div>

                        <div className="description-section">
                            <h3>Description</h3>
                            <p>{listing.description}</p>
                        </div>

                        <div className="seller-section">
                            <h3>Seller Information</h3>
                            <div className="seller-card">
                                <div className="seller-avatar">{listing.seller.name[0].toUpperCase()}</div>
                                <div className="seller-info">
                                    <Link to={`/user/${listing.seller._id}`} className="seller-name-link">
                                        {listing.seller.name}
                                    </Link>
                                    <p className="seller-campus-id">Campus ID: {listing.seller.campusId}</p>
                                    <p className="listing-date">
                                        Posted {new Date(listing.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {!isOwner && listing.status === 'available' && (
                                <div className="action-buttons">
                                    {/* Message Seller Button - Always show for non-owners */}
                                    <button
                                        onClick={handleStartChat}
                                        className="btn btn-primary contact-btn"
                                        disabled={startingChat}
                                    >
                                        {startingChat ? '...' : '💬 Message Seller'}
                                    </button>

                                    {/* Exchange or Contact Button */}
                                    {listing.type === 'exchange' ? (
                                        <button
                                            onClick={() => setShowProposeExchange(true)}
                                            className="btn btn-outline contact-btn"
                                            disabled={hasExchangeRequest}
                                        >
                                            {hasExchangeRequest ? '✓ Exchange Requested' : '🔄 Propose Exchange'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowContact(!showContact)}
                                            className="btn btn-outline contact-btn"
                                        >
                                            {showContact ? '✓ Contact Info Shown' : '📞 Show Contact'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {showContact && (
                                <div className="contact-info">
                                    <div className="contact-item">
                                        <span className="contact-label">Email:</span>
                                        <a href={`mailto:${listing.seller.email}`}>{listing.seller.email}</a>
                                    </div>
                                    {listing.seller.phoneNumber && (
                                        <div className="contact-item">
                                            <span className="contact-label">Phone:</span>
                                            <a href={`tel:${listing.seller.phoneNumber}`}>{listing.seller.phoneNumber}</a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isOwner && (
                                <div className="owner-actions">
                                    <h4>Manage Listing</h4>
                                    <div className="status-buttons">
                                        <button
                                            onClick={() => handleMarkStatus('sold')}
                                            className="btn btn-small btn-success"
                                            disabled={listing.status === 'sold'}
                                        >
                                            Mark as Sold
                                        </button>
                                        <button
                                            onClick={() => handleMarkStatus('completed')}
                                            className="btn btn-small btn-success"
                                            disabled={listing.status === 'completed'}
                                        >
                                            Mark as Completed
                                        </button>
                                        <button
                                            onClick={() => handleMarkStatus('available')}
                                            className="btn btn-small btn-outline"
                                            disabled={listing.status === 'available'}
                                        >
                                            Mark as Available
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => navigate('/my-listings')}
                                        className="btn btn-outline"
                                    >
                                        Edit in My Listings
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showProposeExchange && (
                <ProposeExchange
                    requestedListing={listing}
                    onClose={() => setShowProposeExchange(false)}
                    onSuccess={() => {
                        setHasExchangeRequest(true);
                        alert('✅ Exchange request sent successfully!');
                    }}
                />
            )}
        </div>
    );
};

export default ListingDetails;
