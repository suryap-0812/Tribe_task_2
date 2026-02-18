import express from 'express';
import { body, validationResult } from 'express-validator';
import FocusSession from '../models/FocusSession.js';
import { mockFocusSessions, mockUser } from '../utils/mockData.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/focus-sessions
// @desc    Get all focus sessions for current user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { status, limit } = req.query;

        if (process.env.USE_MOCK_DATA === 'true') {
            let sessions = [...mockFocusSessions];
            if (status) sessions = sessions.filter(s => s.status === status);
            sessions.sort((a, b) => new Date(b.startTime || b.createdAt) - new Date(a.startTime || a.createdAt));
            if (limit) sessions = sessions.slice(0, parseInt(limit));
            return res.json(sessions);
        }

        const query = { user: req.user._id };
        if (status) query.status = status;

        let queryBuilder = FocusSession.find(query)
            .populate('task', 'title')
            .populate('tribe', 'name color')
            .sort({ startedAt: -1 });

        if (limit) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }

        const sessions = await queryBuilder;

        res.json(sessions);
    } catch (error) {
        console.error('Get focus sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/focus-sessions/:id
// @desc    Get specific focus session
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const session = mockFocusSessions.find(s => s._id === req.params.id);
            if (!session) return res.status(404).json({ message: 'Focus session not found' });
            return res.json(session);
        }

        const session = await FocusSession.findOne({
            _id: req.params.id,
            user: req.user._id,
        })
            .populate('task', 'title')
            .populate('tribe', 'name color');

        if (!session) {
            return res.status(404).json({ message: 'Focus session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error('Get focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/focus-sessions
// @desc    Create/start new focus session
// @access  Private
router.post(
    '/',
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('plannedDuration').isInt({ min: 1 }).withMessage('Planned duration must be at least 1 minute'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            if (process.env.USE_MOCK_DATA === 'true') {
                const newSession = {
                    _id: `session-${Date.now()}`,
                    ...req.body,
                    user: req.user._id,
                    status: 'active',
                    startTime: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                mockFocusSessions.push(newSession);
                return res.status(201).json(newSession);
            }

            const session = await FocusSession.create({
                ...req.body,
                user: req.user._id,
            });

            await session.populate('task', 'title');
            await session.populate('tribe', 'name color');

            res.status(201).json(session);
        } catch (error) {
            console.error('Create focus session error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   PUT /api/focus-sessions/:id
// @desc    Update focus session
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const index = mockFocusSessions.findIndex(s => s._id === req.params.id);
            if (index === -1) return res.status(404).json({ message: 'Focus session not found' });

            const updatedSession = { ...mockFocusSessions[index], ...req.body, updatedAt: new Date().toISOString() };
            mockFocusSessions[index] = updatedSession;
            return res.json(updatedSession);
        }

        const session = await FocusSession.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!session) {
            return res.status(404).json({ message: 'Focus session not found' });
        }

        // Update allowed fields
        const allowedUpdates = ['title', 'description', 'duration', 'status'];
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                session[field] = req.body[field];
            }
        });

        await session.save();
        await session.populate('task', 'title');
        await session.populate('tribe', 'name color');

        res.json(session);
    } catch (error) {
        console.error('Update focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /api/focus-sessions/:id/complete
// @desc    Mark session as completed
// @access  Private
router.patch('/:id/complete', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const index = mockFocusSessions.findIndex(s => s._id === req.params.id);
            if (index === -1) return res.status(404).json({ message: 'Focus session not found' });

            mockFocusSessions[index].status = 'completed';
            if (req.body.duration) mockFocusSessions[index].duration = req.body.duration;
            mockFocusSessions[index].endTime = new Date().toISOString();

            return res.json(mockFocusSessions[index]);
        }

        const session = await FocusSession.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!session) {
            return res.status(404).json({ message: 'Focus session not found' });
        }

        session.status = 'completed';

        // If duration is provided in the request, use it
        if (req.body.duration) {
            session.duration = req.body.duration;
        }

        await session.save();
        await session.populate('task', 'title');
        await session.populate('tribe', 'name color');

        res.json(session);
    } catch (error) {
        console.error('Complete focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/focus-sessions/:id
// @desc    Delete focus session
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const index = mockFocusSessions.findIndex(s => s._id === req.params.id);
            if (index === -1) return res.status(404).json({ message: 'Focus session not found' });

            mockFocusSessions.splice(index, 1);
            return res.json({ message: 'Focus session deleted successfully' });
        }

        const session = await FocusSession.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!session) {
            return res.status(404).json({ message: 'Focus session not found' });
        }

        res.json({ message: 'Focus session deleted successfully' });
    } catch (error) {
        console.error('Delete focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
