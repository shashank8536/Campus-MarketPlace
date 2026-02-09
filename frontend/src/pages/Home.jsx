import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';
import ListingCard from '../components/ListingCard';
import FilterPanel from '../components/FilterPanel';
import PostItemForm from '../components/PostItemForm';
import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: 'All',
        minPrice: '',
        maxPrice: '',
        sortBy: 'newest'
    });
    const [showPostForm, setShowPostForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, [activeFilter, searchTerm, filters]);

    const fetchListings = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams();

            if (activeFilter !== 'all') {
                params.append('type', activeFilter);
            }

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            if (filters.category && filters.category !== 'All') {
                params.append('category', filters.category);
            }

            if (filters.minPrice) {
                params.append('minPrice', filters.minPrice);
            }

            if (filters.maxPrice) {
                params.append('maxPrice', filters.maxPrice);
            }

            if (filters.sortBy) {
                params.append('sortBy', filters.sortBy);
            }

            const response = await fetch(apiUrl(`/api/listings?${params.toString()}`));
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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            category: 'All',
            minPrice: '',
            maxPrice: '',
            sortBy: 'newest'
        });
        setSearchTerm('');
    };

    const handlePostSuccess = (newListing) => {
        fetchListings(); // Refresh listings
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.category !== 'All') count++;
        if (filters.minPrice) count++;
        if (filters.maxPrice) count++;
        if (filters.sortBy !== 'newest') count++;
        return count;
    };

    const getEmptyStateContent = () => {
        switch (activeFilter) {
            case 'sell':
                return {
                    icon: '🛍️',
                    title: 'No items for sale yet',
                    subtitle: 'Be the first to list something for sale! 🎉'
                };
            case 'buy':
                return {
                    icon: '🔍',
                    title: 'No buy requests yet',
                    subtitle: 'Tell us what you need! Post your first buy request! 💡'
                };
            case 'exchange':
                return {
                    icon: '🔄',
                    title: 'No exchange items yet',
                    subtitle: 'Post what you\'d like to trade! Start the first exchange! 🤝'
                };
            default:
                return {
                    icon: '📦',
                    title: 'No listings found',
                    subtitle: 'Try adjusting your filters or search terms!'
                };
        }
    };

    const emptyState = getEmptyStateContent();
    const activeFiltersCount = getActiveFiltersCount();

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1 className="hero-title">Campus Marketplace</h1>
                <p className="hero-subtitle">Buy, Sell, and Exchange within your campus community</p>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
            </div>

            <div className="content-section">
                <div className="section-header">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All Items
                        </button>
                        <button
                            className={`filter-tab ${activeFilter === 'sell' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('sell')}
                        >
                            🛍️ For Sale
                        </button>
                        <button
                            className={`filter-tab ${activeFilter === 'buy' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('buy')}
                        >
                            🔍 Looking to Buy
                        </button>
                        <button
                            className={`filter-tab ${activeFilter === 'exchange' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('exchange')}
                        >
                            🔄 Exchange
                        </button>
                    </div>

                    <div className="header-actions">
                        <button
                            onClick={() => setShowFilters(true)}
                            className="btn btn-outline filters-btn"
                        >
                            🔍 Filters
                            {activeFiltersCount > 0 && (
                                <span className="filter-badge">{activeFiltersCount}</span>
                            )}
                        </button>

                        {user && (
                            <button onClick={() => setShowPostForm(true)} className="btn btn-primary">
                                ➕ Post Item
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading listings... 🔄</div>
                ) : listings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">{emptyState.icon}</div>
                        <h3>{emptyState.title}</h3>
                        <p>{emptyState.subtitle}</p>
                    </div>
                ) : (
                    <>
                        <div className="results-count">
                            Found {listings.length} item{listings.length !== 1 ? 's' : ''}
                        </div>
                        <div className="listings-grid">
                            {listings.map(listing => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Filter Modal */}
            {showFilters && (
                <div className="modal-overlay" onClick={() => setShowFilters(false)}>
                    <div className="modal-content filter-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h2>🔍 Filters & Sort</h2>
                            <button className="modal-close" onClick={() => setShowFilters(false)}>×</button>
                        </div>
                        <FilterPanel
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-primary btn-full"
                                onClick={() => setShowFilters(false)}
                            >
                                ✅ Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Form Modal */}
            {showPostForm && (
                <PostItemForm
                    onClose={() => setShowPostForm(false)}
                    onSubmit={handlePostSuccess}
                />
            )}
        </div>
    );
};

export default Home;
