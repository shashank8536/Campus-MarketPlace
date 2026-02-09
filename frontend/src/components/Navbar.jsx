import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { apiUrl } from '../config/api';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useSocket();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchPendingCount();
            // Refresh count every 30 seconds
            const interval = setInterval(fetchPendingCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchPendingCount = async () => {
        try {
            const response = await fetch(apiUrl('/api/exchange-requests/count/pending'), {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setPendingCount(data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching pending count:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo">
                        <span className="logo-icon">🎓</span>
                        Campus Marketplace
                    </Link>
                    <div className="verified-badge">
                        <span className="verified-icon">✓</span>
                        Verified Campus Listings
                    </div>
                </div>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Browse</Link>

                    <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {user ? (
                        <>
                            <Link to="/my-listings" className="nav-link">My Listings</Link>
                            <Link to="/exchange-requests" className="nav-link">
                                🔄 Exchanges
                                {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
                            </Link>
                            <Link to="/messages" className="nav-link">
                                💬 Messages
                                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                            </Link>
                            <Link to="/profile" className="nav-link">My Profile</Link>
                            <span className="user-name">{user.name}</span>
                            <button onClick={logout} className="btn btn-outline btn-small">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

