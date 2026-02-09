require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const exchangeRequestRoutes = require('./routes/exchangeRequests');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Session configuration
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
});

app.use(sessionMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/exchange-requests', exchangeRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Campus Marketplace API' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
});

// Store online users (socketId -> userId mapping)
const onlineUsers = new Map();

// Wrap express session middleware for Socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// Socket.io middleware to access session
io.use(wrap(sessionMiddleware));

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Get userId from session
    const session = socket.request.session;
    const userId = session?.userId;

    if (userId) {
        socket.userId = userId;
        onlineUsers.set(socket.id, userId);
        console.log(`✅ User ${userId} authenticated from session with socket ${socket.id}`);

        // Join user to their personal room
        socket.join(`user:${userId}`);
    } else {
        console.log('⚠️ Socket connected but no session found');
    }

    // Also listen for manual authenticate event as backup
    socket.on('authenticate', (authenticateUserId) => {
        if (authenticateUserId && !socket.userId) {
            socket.userId = authenticateUserId;
            onlineUsers.set(socket.id, authenticateUserId);
            console.log(`✅ User ${authenticateUserId} manually authenticated with socket ${socket.id}`);

            // Join user to their personal room
            socket.join(`user:${authenticateUserId}`);
        }
    });

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
        try {
            const { conversationId, content, receiverId } = data;
            const userId = socket.userId;

            console.log('📨 send_message event received:', {
                conversationId,
                content: content?.substring(0, 50),
                senderId: userId,
                receiverId,
                socketId: socket.id
            });

            if (!userId) {
                console.error('❌ User not authenticated');
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            const Message = require('./models/Message');
            const Conversation = require('./models/Conversation');

            // Verify conversation
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !conversation.participants.includes(userId)) {
                console.error('❌ Invalid conversation or user not participant');
                socket.emit('error', { message: 'Invalid conversation' });
                return;
            }

            console.log('✅ Conversation verified:', {
                conversationId,
                participants: conversation.participants
            });

            // Create message
            const message = await Message.create({
                conversation: conversationId,
                sender: userId,
                content: content.trim(),
                readBy: [userId]
            });

            console.log('✅ Message created in DB:', message._id);

            // Update conversation
            conversation.lastMessage = message._id;
            conversation.lastMessageAt = new Date();
            await conversation.save();

            // Populate message
            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'name email');

            console.log('📢 Broadcasting to conversation room:', `conversation:${conversationId}`);
            console.log('Socket.io rooms for this socket:', socket.rooms);

            // Emit to conversation room
            const roomEmitResult = io.to(`conversation:${conversationId}`).emit('receive_message', {
                message: populatedMessage,
                conversationId
            });

            console.log('✅ Message broadcast to conversation room');

            // Also emit to receiver's personal room for notifications
            if (receiverId) {
                console.log('📢 Sending notification to user room:', `user:${receiverId}`);
                io.to(`user:${receiverId}`).emit('new_message_notification', {
                    message: populatedMessage,
                    conversationId,
                    sender: populatedMessage.sender
                });
            }

        } catch (error) {
            console.error('❌ Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });


    // Typing indicator
    socket.on('typing', (data) => {
        const { conversationId, isTyping } = data;
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
            userId: socket.userId,
            isTyping
        });
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
        try {
            const { conversationId } = data;
            const userId = socket.userId;

            if (!userId) return;

            const Message = require('./models/Message');

            await Message.updateMany(
                {
                    conversation: conversationId,
                    sender: { $ne: userId },
                    readBy: { $ne: userId }
                },
                {
                    $addToSet: { readBy: userId }
                }
            );

            // Notify others in the conversation
            socket.to(`conversation:${conversationId}`).emit('messages_read', {
                conversationId,
                readBy: userId
            });

        } catch (error) {
            console.error('Error marking as read:', error);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const userId = onlineUsers.get(socket.id);
        if (userId) {
            onlineUsers.delete(socket.id);
            console.log(`User ${userId} disconnected`);
        }
        console.log('Socket disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Socket.io enabled for real-time messaging');
});
