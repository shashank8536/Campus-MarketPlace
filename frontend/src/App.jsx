import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import MyListings from './pages/MyListings';
import ListingDetails from './pages/ListingDetails';
import UserProfile from './pages/UserProfile';
import Profile from './pages/Profile';
import ExchangeRequests from './pages/ExchangeRequests';
import Messages from './pages/Messages';
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './pages/VerifyEmail';
import VerificationPending from './pages/VerificationPending';
import './App.css';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SocketProvider>
                    <Router>
                        <div className="app">
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/my-listings" element={<MyListings />} />
                                <Route path="/listing/:id" element={<ListingDetails />} />
                                <Route path="/user/:userId" element={<UserProfile />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/exchange-requests" element={<ExchangeRequests />} />
                                <Route path="/messages" element={<Messages />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                                <Route path="/verification-pending" element={<VerificationPending />} />
                            </Routes>
                            <ChatWidget />
                        </div>
                    </Router>
                </SocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

