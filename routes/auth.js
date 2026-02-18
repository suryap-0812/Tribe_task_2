import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper: format user object for response (no password)
const formatUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    checkInStreak: user.checkInStreak,
    dailyFocusGoal: user.dailyFocusGoal,
    tribes: user.tribes,
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'An account with this email already exists' });
            }

            // Create user (password is hashed by pre-save hook in User model)
            const user = await User.create({ name, email, password });

            // Generate JWT token
            const token = generateToken(user._id);

            // Set server-side session
            req.session.userId = user._id.toString();

            return res.status(201).json({
                user: formatUser(user),
                token,
            });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ message: 'Server error during registration' });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Authenticate user and return token + session
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Find user and include password field for comparison
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Compare provided password with hashed password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = generateToken(user._id);

            // Set server-side session
            req.session.userId = user._id.toString();

            return res.json({
                user: formatUser(user),
                token,
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Server error during login' });
        }
    }
);

// @route   POST /api/auth/logout
// @desc    Logout user — destroy server session
// @access  Public
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
            return res.status(500).json({ message: 'Could not log out. Please try again.' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        return res.json({ message: 'Logged out successfully' });
    });
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user's profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        return res.json(formatUser(req.user));
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

export default router;
