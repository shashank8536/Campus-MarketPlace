import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { apiUrl } from '../config/api';
import ListingCard from '../components/ListingCard';
import PostItemForm from '../components/PostItemForm';
import './MyListings.css';

const MyListings = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingListing, setEditingListing] = useState(null);
    const [showPostForm, setShowPostForm] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMyListings();
        }
    }, [user]);

    const fetchMyListings = async () => {
        try {
            const response = await fetch(apiUrl('/api/listings/my'), {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setListings(data.data);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;

        try {
            const response = await fetch(apiUrl(`/api/listings/${id}`), {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setListings(listings.filter(listing => listing._id !== id));
            }
        } catch (error) {
            console.error('Error deleting listing:', error);
        }
    };

    const handleEdit = (listing) => {
        setEditingListing(listing);
        setShowPostForm(true);
    };

    const handleUpdateSuccess = (updatedListing) => {
        setListings(listings.map(listing =>
            listing._id === updatedListing._id ? updatedListing : listing
        ));
        setEditingListing(null);
    };

    const handlePostSuccess = (newListing) => {
        setListings([newListing, ...listings]);
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="my-listings-container">
            <div className="page-header">
                <div>
                    <h1>My Listings</h1>
                    <p>Manage your posted items</p>
                </div>
                <button onClick={() => setShowPostForm(true)} className="btn btn-primary">
                    ➕ Post New Item
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading your listings...</div>
            ) : listings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No listings yet</h3>
                    <p>Start by posting your first item!</p>
                    <button onClick={() => setShowPostForm(true)} className="btn btn-primary">
                        Post Your First Item
                    </button>
                </div>
            ) : (
                <div className="listings-grid">
                    {listings.map(listing => (
                        <ListingCard
                            key={listing._id}
                            listing={listing}
                            showActions={true}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {showPostForm && (
                <PostItemForm
                    onClose={() => {
                        setShowPostForm(false);
                        setEditingListing(null);
                    }}
                    onSubmit={editingListing ? handleUpdateSuccess : handlePostSuccess}
                    editListing={editingListing}
                />
            )}
        </div>
    );
};

export default MyListings;
