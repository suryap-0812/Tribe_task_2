import express from 'express';
import { body, validationResult } from 'express-validator';
import { FocusSession, Task, Tribe } from '../models/associations.js';
import { mockFocusSessions } from '../utils/mockData.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/focus-sessions
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

        const where = { userId: req.user.id };
        if (status) where.status = status;

        const sessions = await FocusSession.findAll({
            where,
            include: [
                { model: Task, as: 'task', attributes: ['id', 'title'] },
                { model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] },
            ],
            order: [['started_at', 'DESC']],
            limit: limit ? parseInt(limit) : undefined,
        });

        res.json(sessions.map(s => ({ ...s.toJSON(), _id: s.id })));
    } catch (error) {
        console.error('Get focus sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/focus-sessions/:id
router.get('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const s = mockFocusSessions.find(s => s._id === req.params.id);
            if (!s) return res.status(404).json({ message: 'Focus session not found' });
            return res.json(s);
        }

        const session = await FocusSession.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [
                { model: Task, as: 'task', attributes: ['id', 'title'] },
                { model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] },
            ],
        });
        if (!session) return res.status(404).json({ message: 'Focus session not found' });

        res.json({ ...session.toJSON(), _id: session.id });
    } catch (error) {
        console.error('Get focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/focus-sessions
router.post('/', [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('plannedDuration').isInt({ min: 1 }).withMessage('Planned duration must be at least 1 minute'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const newS = { _id: `session-${Date.now()}`, ...req.body, userId: req.user.id, status: 'active', startTime: new Date().toISOString() };
            mockFocusSessions.push(newS);
            return res.status(201).json(newS);
        }

        const { title, description, plannedDuration, taskId, tribeId } = req.body;
        const session = await FocusSession.create({ title, description, plannedDuration, taskId, tribeId, userId: req.user.id });

        const full = await FocusSession.findByPk(session.id, {
            include: [
                { model: Task, as: 'task', attributes: ['id', 'title'] },
                { model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] },
            ],
        });
        res.status(201).json({ ...full.toJSON(), _id: full.id });
    } catch (error) {
        console.error('Create focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/focus-sessions/:id
router.put('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const idx = mockFocusSessions.findIndex(s => s._id === req.params.id);
            if (idx === -1) return res.status(404).json({ message: 'Focus session not found' });
            mockFocusSessions[idx] = { ...mockFocusSessions[idx], ...req.body };
            return res.json(mockFocusSessions[idx]);
        }

        const session = await FocusSession.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!session) return res.status(404).json({ message: 'Focus session not found' });

        const allowed = ['title', 'description', 'duration', 'status'];
        allowed.forEach(f => { if (req.body[f] !== undefined) session[f] = req.body[f]; });
        await session.save();

        const full = await FocusSession.findByPk(session.id, {
            include: [
                { model: Task, as: 'task', attributes: ['id', 'title'] },
                { model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] },
            ],
        });
        res.json({ ...full.toJSON(), _id: full.id });
    } catch (error) {
        console.error('Update focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/focus-sessions/:id/complete
router.patch('/:id/complete', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const idx = mockFocusSessions.findIndex(s => s._id === req.params.id);
            if (idx === -1) return res.status(404).json({ message: 'Focus session not found' });
            mockFocusSessions[idx].status = 'completed';
            if (req.body.duration) mockFocusSessions[idx].duration = req.body.duration;
            return res.json(mockFocusSessions[idx]);
        }

        const session = await FocusSession.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!session) return res.status(404).json({ message: 'Focus session not found' });

        session.status = 'completed';
        if (req.body.duration) session.duration = req.body.duration;
        await session.save();

        const full = await FocusSession.findByPk(session.id, {
            include: [
                { model: Task, as: 'task', attributes: ['id', 'title'] },
                { model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] },
            ],
        });
        res.json({ ...full.toJSON(), _id: full.id });
    } catch (error) {
        console.error('Complete focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/focus-sessions/:id
router.delete('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const idx = mockFocusSessions.findIndex(s => s._id === req.params.id);
            if (idx === -1) return res.status(404).json({ message: 'Focus session not found' });
            mockFocusSessions.splice(idx, 1);
            return res.json({ message: 'Focus session deleted successfully' });
        }

        const destroyed = await FocusSession.destroy({ where: { id: req.params.id, userId: req.user.id } });
        if (!destroyed) return res.status(404).json({ message: 'Focus session not found' });

        res.json({ message: 'Focus session deleted successfully' });
    } catch (error) {
        console.error('Delete focus session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
