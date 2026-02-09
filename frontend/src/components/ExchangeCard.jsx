import React from 'react';
import { Link } from 'react-router-dom';
import './ExchangeCard.css';

const ExchangeCard = ({ request, viewType, onAccept, onReject, onCancel, onReview }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { emoji: '⏳', text: 'Pending', class: 'status-pending' },
            accepted: { emoji: '✅', text: 'Accepted', class: 'status-accepted' },
            rejected: { emoji: '❌', text: 'Rejected', class: 'status-rejected' },
            cancelled: { emoji: '🚫', text: 'Cancelled', class: 'status-cancelled' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`status-badge ${badge.class}`}>
                {badge.emoji} {badge.text}
            </span>
        );
    };

    const isReceived = viewType === 'received';
    const otherUser = isReceived ? request.requester : request.requestedItemOwner;
    const yourItem = isReceived ? request.requestedItem : request.offeredItem;
    const theirItem = isReceived ? request.offeredItem : request.requestedItem;

    return (
        <div className={`exchange-card ${request.status}`}>
            <div className="exchange-card-header">
                <div className="user-info">
                    <div className="avatar">
                        {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <h3>{otherUser?.name || 'Unknown User'}</h3>
                        <p className="campus-id">
                            {otherUser?.campusId} • {formatDate(request.createdAt)}
                        </p>
                    </div>
                </div>
                {getStatusBadge(request.status)}
            </div>

            {request.message && (
                <div className="exchange-message">
                    <strong>💬 Message:</strong>
                    <p>"{request.message}"</p>
                </div>
            )}

            <div className="exchange-items">
                <div className="exchange-column">
                    <h4>{isReceived ? 'Your Item' : 'You Want'}</h4>
                    <div className="item-preview">
                        <img src={yourItem?.imageUrl} alt={yourItem?.title} />
                        <div className="item-details">
                            <h5>{yourItem?.title}</h5>
                            <p>{yourItem?.description?.substring(0, 60)}...</p>
                            <span className="category">{yourItem?.category}</span>
                        </div>
                    </div>
                    <Link
                        to={`/listing/${yourItem?._id}`}
                        className="view-link"
                    >
                        View Details →
                    </Link>
                </div>

                <div className="exchange-arrow-container">
                    <div className="exchange-arrow">⇄</div>
                </div>

                <div className="exchange-column">
                    <h4>{isReceived ? 'They Offer' : 'You Offered'}</h4>
                    <div className="item-preview">
                        <img src={theirItem?.imageUrl} alt={theirItem?.title} />
                        <div className="item-details">
                            <h5>{theirItem?.title}</h5>
                            <p>{theirItem?.description?.substring(0, 60)}...</p>
                            <span className="category">{theirItem?.category}</span>
                        </div>
                    </div>
                    <Link
                        to={`/listing/${theirItem?._id}`}
                        className="view-link"
                    >
                        View Details →
                    </Link>
                </div>
            </div>

            {request.rejectionReason && (
                <div className="rejection-reason">
                    <strong>❌ Rejection Reason:</strong>
                    <p>{request.rejectionReason}</p>
                </div>
            )}

            {request.status === 'pending' && (
                <div className="exchange-actions">
                    {isReceived ? (
                        <>
                            <button
                                className="btn btn-success"
                                onClick={() => onAccept(request._id)}
                            >
                                ✅ Accept Exchange
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => onReject(request)}
                            >
                                ❌ Reject
                            </button>
                            {otherUser?.phoneNumber && (
                                <a
                                    href={`tel:${otherUser.phoneNumber}`}
                                    className="btn btn-outline"
                                >
                                    📞 Call {otherUser.name}
                                </a>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                className="btn btn-outline"
                                onClick={() => onCancel(request._id)}
                            >
                                🚫 Cancel Request
                            </button>
                            {otherUser?.phoneNumber && (
                                <a
                                    href={`tel:${otherUser.phoneNumber}`}
                                    className="btn btn-outline"
                                >
                                    📞 Call {otherUser.name}
                                </a>
                            )}
                        </>
                    )}
                </div>
            )}

            {request.status === 'accepted' && (
                <div className="accepted-section">
                    {request.respondedAt && (
                        <div className="accepted-notice">
                            ✨ Exchange accepted on {new Date(request.respondedAt).toLocaleDateString()}
                        </div>
                    )}
                    {onReview && (
                        <div className="exchange-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => onReview(request)}
                            >
                                ⭐ Leave Review for {otherUser?.name}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExchangeCard;
