import jwt from 'jsonwebtoken';
import { User } from '../models/associations.js';

export const protect = async (req, res, next) => {
    try {
        // Strategy 1: Session-based auth
        if (req.session && req.session.userId) {
            const user = await User.findByPk(req.session.userId, {
                attributes: { exclude: ['password'] }
            });
            if (user) {
                req.user = user;
                return next();
            }
            req.session.destroy(() => {});
        }

        // Strategy 2: JWT Bearer token
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });
            if (!user) return res.status(401).json({ message: 'User not found' });
            req.user = user;
            return next();
        }

        return res.status(401).json({ message: 'Not authorized. Please log in.' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Server error during authentication' });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
};

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
