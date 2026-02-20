import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect middleware
 * Checks authentication via:
 *   1. Server-side session (req.session.userId) — set on login
 *   2. JWT Bearer token (Authorization header) — for stateless API clients
 */
export const protect = async (req, res, next) => {
    try {
        // --- Strategy 1: Session-based auth ---
        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId).select('-password');
            if (user) {
                req.user = user;
                return next();
            }
            // Session exists but user not found — clear stale session
            req.session.destroy(() => { });
        }

        // --- Strategy 2: JWT Bearer token ---
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            req.user = user;
            return next();
        }

        // --- No valid auth found ---
        return res.status(401).json({ message: 'Not authorized. Please log in.' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Server error during authentication' });
    }
};

/**
 * adminOnly middleware
 * Ensures the authenticated user is an administrator
 */
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
};

/**
 * Generate a signed JWT token for a given user ID.
 * Expires in 30 days.
 */
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
