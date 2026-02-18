import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { mockUser } from '../utils/mockData.js';
import { protect, generateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (process.env.USE_MOCK_DATA === 'true') {
            return res.status(201).json({
                ...mockUser,
                token: 'mock-token-123'
            });
        }

        const { name, email, password } = req.body;

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            // Create user
            const user = await User.create({
                name,
                email,
                password,
            });

            // Return user data and token
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                checkInStreak: user.checkInStreak,
                dailyFocusGoal: user.dailyFocusGoal,
                token: generateToken(user._id),
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (process.env.USE_MOCK_DATA === 'true') {
            return res.json({
                ...mockUser,
                token: 'mock-token-123'
            });
        }

        const { email, password } = req.body;

        try {
            // Find user and include password for comparison
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Return user data and token
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                checkInStreak: user.checkInStreak,
                dailyFocusGoal: user.dailyFocusGoal,
                token: generateToken(user._id),
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            checkInStreak: req.user.checkInStreak,
            dailyFocusGoal: req.user.dailyFocusGoal,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;
