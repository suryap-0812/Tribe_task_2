import express from 'express';
import BuddySession from '../models/BuddySession.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all buddy sessions for a tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { status, userId } = req.query;

        const query = { tribe: tribeId };
        if (status) query.status = status;
        if (userId) query.participants = userId;

        const sessions = await BuddySession.find(query)
            .populate('participants', 'name avatar email')
            .sort({ startTime: -1 });

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start a buddy session
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { buddyId } = req.body;

        const session = await BuddySession.create({
            tribe: tribeId,
            participants: [req.user._id, buddyId],
            startTime: new Date()
        });

        await session.populate('participants', 'name avatar email');
        res.status(201).json({ session });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get active session for user
router.get('/active', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;

        const session = await BuddySession.findOne({
            tribe: tribeId,
            participants: req.user._id,
            status: { $in: ['active', 'paused'] }
        }).populate('participants', 'name avatar email');

        res.json({ session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update session status (pause/resume)
router.patch('/:sessionId/status', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status } = req.body;

        const session = await BuddySession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check if user is a participant
        if (!session.participants.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (status === 'paused' && session.status === 'active') {
            session.pausedAt = new Date();
        } else if (status === 'active' && session.status === 'paused') {
            // Calculate pause duration
            const pauseDuration = Math.floor((new Date() - session.pausedAt) / 60000);
            session.pauseDuration += pauseDuration;
        }

        session.status = status;
        await session.save();

        res.json({ session });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// End a buddy session
router.post('/:sessionId/end', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { tasksCompleted, notes } = req.body;

        const session = await BuddySession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check if user is a participant
        if (!session.participants.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        session.endTime = new Date();
        session.status = 'completed';
        session.tasksCompleted = tasksCompleted || 0;
        session.notes = notes;
        session.calculateDuration();

        await session.save();
        await session.populate('participants', 'name avatar email');

        res.json({ session });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get session history for user
router.get('/history', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { limit = 20 } = req.query;

        const sessions = await BuddySession.find({
            tribe: tribeId,
            participants: req.user._id,
            status: 'completed'
        })
            .populate('participants', 'name avatar email')
            .sort({ endTime: -1 })
            .limit(parseInt(limit));

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
