import express from 'express';
import { BuddySession, User } from '../models/associations.js';
import { protect } from '../middleware/auth.js';
import { Op } from 'sequelize';
import sequelize from '../db.js';

const router = express.Router({ mergeParams: true });

// GET all buddy sessions for tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { status, userId } = req.query;

        const where = { tribeId };
        if (status) where.status = status;

        let sessions = await BuddySession.findAll({
            where,
            include: [{ model: User, as: 'participants', attributes: ['id', 'name', 'avatar', 'email'], through: { attributes: [] } }],
            order: [['start_time', 'DESC']],
        });

        // Filter by participant if requested
        if (userId) {
            sessions = sessions.filter(s => s.participants.some(p => p.id == userId));
        }

        res.json({ sessions: sessions.map(s => ({ ...s.toJSON(), _id: s.id })) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST start a buddy session
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { buddyId } = req.body;

        const session = await BuddySession.create({ tribeId, startTime: new Date() });
        await session.setParticipants([req.user.id, buddyId]);

        const full = await BuddySession.findByPk(session.id, {
            include: [{ model: User, as: 'participants', attributes: ['id', 'name', 'avatar', 'email'], through: { attributes: [] } }],
        });
        res.status(201).json({ session: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET active session for user
router.get('/active', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;

        const sessions = await BuddySession.findAll({
            where: { tribeId, status: { [Op.in]: ['active', 'paused'] } },
            include: [{ model: User, as: 'participants', attributes: ['id', 'name', 'avatar', 'email'], through: { attributes: [] } }],
        });

        const active = sessions.find(s => s.participants.some(p => p.id === req.user.id));
        res.json({ session: active ? { ...active.toJSON(), _id: active.id } : null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH update session status
router.patch('/:sessionId/status', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status } = req.body;

        const session = await BuddySession.findByPk(sessionId, {
            include: [{ model: User, as: 'participants', through: { attributes: [] } }],
        });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (!session.participants.some(p => p.id === req.user.id)) return res.status(403).json({ message: 'Not authorized' });

        if (status === 'paused' && session.status === 'active') {
            session.pausedAt = new Date();
        } else if (status === 'active' && session.status === 'paused') {
            const pauseMin = Math.floor((new Date() - session.pausedAt) / 60000);
            session.pauseDuration += pauseMin;
        }

        session.status = status;
        await session.save();

        res.json({ session: { ...session.toJSON(), _id: session.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST end session
router.post('/:sessionId/end', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { tasksCompleted, notes } = req.body;

        const session = await BuddySession.findByPk(sessionId, {
            include: [{ model: User, as: 'participants', through: { attributes: [] } }],
        });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (!session.participants.some(p => p.id === req.user.id)) return res.status(403).json({ message: 'Not authorized' });

        session.endTime = new Date();
        session.status = 'completed';
        session.tasksCompleted = tasksCompleted || 0;
        session.notes = notes;
        session.calculateDuration();
        await session.save();

        const full = await BuddySession.findByPk(session.id, {
            include: [{ model: User, as: 'participants', attributes: ['id', 'name', 'avatar', 'email'], through: { attributes: [] } }],
        });
        res.json({ session: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET session history
router.get('/history', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { limit = 20 } = req.query;

        const sessions = await BuddySession.findAll({
            where: { tribeId, status: 'completed' },
            include: [{ model: User, as: 'participants', attributes: ['id', 'name', 'avatar', 'email'], through: { attributes: [] } }],
            order: [['end_time', 'DESC']],
            limit: parseInt(limit),
        });

        // Only return sessions where the user is a participant
        const filtered = sessions.filter(s => s.participants.some(p => p.id === req.user.id));
        res.json({ sessions: filtered.map(s => ({ ...s.toJSON(), _id: s.id })) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
