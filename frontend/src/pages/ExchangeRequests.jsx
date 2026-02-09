import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import ExchangeCard from '../components/ExchangeCard';
import ReviewForm from '../components/ReviewForm';
import './ExchangeRequests.css';

const ExchangeRequests = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('received');
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingRequest, setRejectingRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewingExchange, setReviewingExchange] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [activeTab, filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'received'
                ? `/api/exchange-requests/received?status=${filter}`
                : `/api/exchange-requests/sent?status=${filter}`;

            const response = await fetch(apiUrl(endpoint), {
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok) {
                if (activeTab === 'received') {
                    setReceivedRequests(data.data || []);
                } else {
                    setSentRequests(data.data || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        if (!confirm('Accept this exchange? Both items will be marked as exchanged.')) {
            return;
        }

        try {
            const response = await fetch(apiUrl(`/api/exchange-requests/${requestId}/accept`), {
                method: 'PUT',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Exchange accepted! Both items are now marked as exchanged.');
                fetchRequests();
            } else {
                alert(data.message || 'Failed to accept exchange');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    };

    const openRejectModal = (request) => {
        setRejectingRequest(request);
        setShowRejectModal(true);
        setRejectionReason('');
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        try {
            const response = await fetch(
                apiUrl(`/api/exchange-requests/${rejectingRequest._id}/reject`),
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ rejectionReason })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setShowRejectModal(false);
                setRejectingRequest(null);
                alert('Exchange request rejected');
                fetchRequests();
            } else {
                alert(data.message || 'Failed to reject exchange');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    };

    const handleCancel = async (requestId) => {
        if (!confirm('Cancel this exchange request?')) {
            return;
        }

        try {
            const response = await fetch(apiUrl(`/api/exchange-requests/${requestId}`), {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Request cancelled');
                fetchRequests();
            } else {
                alert('Failed to cancel request');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    };

    const openReviewModal = (exchange) => {
        setReviewingExchange(exchange);
        setShowReviewModal(true);
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            const response = await fetch(apiUrl('/api/reviews'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Review submitted successfully!');
                setShowReviewModal(false);
                setReviewingExchange(null);
                fetchRequests(); // Refresh to update review status
            } else {
                throw new Error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            throw error;
        }
    };

    const requests = activeTab === 'received' ? receivedRequests : sentRequests;
    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(req => req.status === filter);

    return (
        <div className="exchange-requests-container">
            <div className="page-header">
                <h1>🔄 Exchange Requests</h1>
                <p className="subtitle">Manage your item exchange proposals</p>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => setActiveTab('received')}
                >
                    📥 Received ({receivedRequests.length})
                </button>
                <button
                    className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sent')}
                >
                    📤 Sent ({sentRequests.length})
                </button>
            </div>

            <div className="filters">
                <label>Filter by status:</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading requests...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No {filter !== 'all' ? filter : ''} requests</h3>
                    <p>
                        {activeTab === 'received'
                            ? "You haven't received any exchange requests yet."
                            : "You haven't sent any exchange requests yet."}
                    </p>
                </div>
            ) : (
                <div className="requests-list">
                    {filteredRequests.map(request => (
                        <ExchangeCard
                            key={request._id}
                            request={request}
                            viewType={activeTab}
                            onAccept={handleAccept}
                            onReject={openRejectModal}
                            onCancel={handleCancel}
                            onReview={openReviewModal}
                        />
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
                        <h2>Reject Exchange Request</h2>
                        <p>Please provide a reason for rejecting this exchange:</p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Looking for different items, item condition doesn't match..."
                            maxLength={200}
                            rows={4}
                            autoFocus
                        />
                        <span className="char-count">{rejectionReason.length}/200</span>

                        <div className="modal-actions">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="btn btn-danger"
                                disabled={!rejectionReason.trim()}
                            >
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && reviewingExchange && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowReviewModal(false)}>×</button>
                        <ReviewForm
                            revieweeId={activeTab === 'received'
                                ? reviewingExchange.requester?._id
                                : reviewingExchange.requestedItemOwner?._id}
                            revieweeName={activeTab === 'received'
                                ? reviewingExchange.requester?.name
                                : reviewingExchange.requestedItemOwner?.name}
                            listingId={activeTab === 'received'
                                ? reviewingExchange.offeredItem?._id
                                : reviewingExchange.requestedItem?._id}
                            exchangeRequestId={reviewingExchange._id}
                            onSubmit={handleSubmitReview}
                            onCancel={() => setShowReviewModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExchangeRequests;
