import React, { useState } from 'react';
import { apiUrl } from '../config/api';
import './PostItemForm.css';

const PostItemForm = ({ onClose, onSubmit, editListing = null }) => {
    const [formData, setFormData] = useState({
        title: editListing?.title || '',
        description: editListing?.description || '',
        type: editListing?.type || 'sell',
        price: editListing?.price || '',
        category: editListing?.category || 'Other'
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState(editListing?.images?.map(img => img.url) || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setImages([...images, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Append text fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('category', formData.category);
            if (formData.type !== 'exchange') {
                formDataToSend.append('price', formData.price);
            }

            // Append images
            images.forEach(image => {
                formDataToSend.append('images', image);
            });

            const method = editListing ? 'PUT' : 'POST';
            const url = editListing
                ? apiUrl(`/api/listings/${editListing._id}`)
                : apiUrl('/api/listings');

            const response = await fetch(url, {
                method,
                credentials: 'include',
                body: formDataToSend
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save listing');
            }

            onSubmit(data.data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editListing ? 'Edit Listing' : 'Post New Item'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="post-form">
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            maxLength="100"
                            placeholder="e.g., iPhone 13 Pro"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            maxLength="500"
                            placeholder="Describe your item..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="type">Type *</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="sell">Sell</option>
                                <option value="buy">Buy</option>
                                <option value="exchange">Exchange</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="Electronics">Electronics</option>
                                <option value="Books">Books</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Sports">Sports</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {formData.type !== 'exchange' && (
                        <div className="form-group">
                            <label htmlFor="price">Price (₹) *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required={formData.type !== 'exchange'}
                                min="0"
                                placeholder="Enter price"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Images (Max 5)</label>
                        <div className="image-upload-section">
                            <input
                                type="file"
                                id="images"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="images" className="upload-area">
                                <div className="upload-icon">📸</div>
                                <p>Click or drag images here</p>
                                <span className="upload-hint">JPG, PNG, GIF, WEBP (Max 5MB each)</span>
                            </label>

                            {imagePreviews.length > 0 && (
                                <div className="image-previews">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={preview} alt={`Preview ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="remove-image"
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (editListing ? 'Update' : 'Post Item')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostItemForm;
