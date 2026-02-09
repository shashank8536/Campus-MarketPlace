import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
    const categories = ['All', 'Electronics', 'Books', 'Clothing', 'Furniture', 'Sports', 'Other'];

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h3>🔍 Filters</h3>
                <button className="clear-btn" onClick={onClearFilters}>
                    Clear All
                </button>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                    value={filters.category || 'All'}
                    onChange={(e) => onFilterChange('category', e.target.value)}
                    className="filter-select"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
                <label className="filter-label">Price Range (₹)</label>
                <div className="price-inputs">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ''}
                        onChange={(e) => onFilterChange('minPrice', e.target.value)}
                        className="price-input"
                        min="0"
                    />
                    <span className="price-separator">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ''}
                        onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                        className="price-input"
                        min="0"
                    />
                </div>
            </div>

            {/* Sort Filter */}
            <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                    value={filters.sortBy || 'newest'}
                    onChange={(e) => onFilterChange('sortBy', e.target.value)}
                    className="filter-select"
                >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                </select>
            </div>
        </div>
    );
};

export default FilterPanel;
