import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import pg from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import sequelize from './db.js';
import { User } from './models/associations.js'; // loads all models + relations

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
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection
try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    
    // Sync models to database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('📊 Database synchronized successfully');
} catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
}

// Session middleware (PostgreSQL store)
const PgStore = pgSession(session);
const dbConnectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pgPool = new pg.Pool({
    connectionString: dbConnectionString,
    ssl: { rejectUnauthorized: false }
});

app.use(
    session({
        store: new PgStore({
            pool: pgPool,
            tableName: 'session',
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'TribeTask API is running (PostgreSQL)' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Socket.io authentication
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) return next(new Error('Authentication error: No token provided'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return next(new Error('Authentication error: User not found'));

        socket.data.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
});

// Socket.io events
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join_tribe', (tribeId) => {
        socket.join(tribeId);
    });

    socket.on('leave_tribe', (tribeId) => {
        socket.leave(tribeId);
    });

    socket.on('send_message', (data) => {
        io.to(data.tribeId).emit('receive_message', data.message);
    });

    socket.on('send_reaction', (data) => {
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
