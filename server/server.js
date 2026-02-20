import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import 'dotenv/config';

// Import routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import tribeRoutes from './routes/tribes.js';
import focusSessionRoutes from './routes/focusSessions.js';
import statsRoutes from './routes/stats.js';
import adminRoutes from './routes/admin.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent cross-origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// Session middleware (uses MongoDB Atlas as session store)
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions',
            ttl: 7 * 24 * 60 * 60, // 7 days in seconds
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            sameSite: 'lax',
        },
    })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tribes', tribeRoutes);
app.use('/api/focus-sessions', focusSessionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'TribeTask API is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.data.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
});

// Socket.io logic
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join_tribe', (tribeId) => {
        socket.join(tribeId);
        console.log(`👤 User ${socket.id} joined tribe room: ${tribeId}`);
    });

    socket.on('leave_tribe', (tribeId) => {
        socket.leave(tribeId);
        console.log(`👤 User ${socket.id} left tribe room: ${tribeId}`);
    });

    socket.on('send_message', (data) => {
        // Broadcast message to everyone in the tribe room
        io.to(data.tribeId).emit('receive_message', data.message);
    });

    socket.on('send_reaction', (data) => {
        // Broadcast reaction to everyone in the tribe room
        io.to(data.tribeId).emit('receive_reaction', {
            messageId: data.messageId,
            message: data.message
        });
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
