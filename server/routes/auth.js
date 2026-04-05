import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/associations.js';
import { protect, generateToken } from '../middleware/auth.js';

const router = express.Router();

const formatUser = (user) => ({
    _id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    checkInStreak: user.checkInStreak,
    dailyFocusGoal: user.dailyFocusGoal,
    isAdmin: user.isAdmin,
});

// POST /api/auth/register
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'An account with this email already exists' });

        const user = await User.create({ name, email, password });
        const token = generateToken(user.id);
        req.session.userId = user.id;

        return res.status(201).json({ user: formatUser(user), token });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { email, password } = req.body;
    try {
        // Include password for comparison
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        const token = generateToken(user.id);
        req.session.userId = user.id;

        return res.json({ user: formatUser(user), token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Could not log out. Please try again.' });
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out successfully' });
    });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    try {
        return res.json(formatUser(req.user));
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/auth/profile
router.put('/profile', protect, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('dailyFocusGoal').optional().isNumeric().withMessage('Daily focus goal must be a number'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, dailyFocusGoal } = req.body;
    try {
        const user = await User.findByPk(req.user.id);

        if (name) user.name = name;
        if (email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }
        if (dailyFocusGoal !== undefined) user.dailyFocusGoal = dailyFocusGoal;

        await user.save();
        res.json(formatUser(user));
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
