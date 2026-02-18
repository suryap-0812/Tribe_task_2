import express from 'express';
import Ritual from '../models/Ritual.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all rituals for a tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { isActive = true } = req.query;

        const rituals = await Ritual.find({
            tribe: tribeId,
            isActive
        })
            .populate('createdBy', 'name avatar')
            .populate('participants', 'name avatar')
            .sort({ nextOccurrence: 1 });

        res.json({ rituals });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a ritual
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { name, description, schedule, badge } = req.body;

        const ritual = await Ritual.create({
            tribe: tribeId,
            name,
            description,
            schedule,
            badge: badge || '✨',
            createdBy: req.user._id,
            participants: [req.user._id]
        });

        await ritual.populate('createdBy', 'name avatar');
        await ritual.populate('participants', 'name avatar');

        res.status(201).json({ ritual });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mark attendance for a ritual
router.post('/:ritualId/attendance', protect, async (req, res) => {
    try {
        const { ritualId } = req.params;

        const ritual = await Ritual.findById(ritualId);
        if (!ritual) {
            return res.status(404).json({ message: 'Ritual not found' });
        }

        // Check if already attended today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const hasAttendedToday = ritual.attendance.some(a => {
            const attendanceDate = new Date(a.date);
            attendanceDate.setHours(0, 0, 0, 0);
            return a.userId.toString() === req.user._id.toString() &&
                attendanceDate.getTime() === today.getTime();
        });

        if (hasAttendedToday) {
            return res.status(400).json({ message: 'Already marked attendance today' });
        }

        ritual.attendance.push({
            userId: req.user._id,
            date: new Date()
        });

        // Update streak
        ritual.streak += 1;

        await ritual.save();
        res.json({ ritual });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Join a ritual
router.post('/:ritualId/join', protect, async (req, res) => {
    try {
        const { ritualId } = req.params;

        const ritual = await Ritual.findById(ritualId);
        if (!ritual) {
            return res.status(404).json({ message: 'Ritual not found' });
        }

        if (!ritual.participants.includes(req.user._id)) {
            ritual.participants.push(req.user._id);
            await ritual.save();
            await ritual.populate('participants', 'name avatar');
        }

        res.json({ ritual });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete ritual
router.delete('/:ritualId', protect, async (req, res) => {
    try {
        const { ritualId } = req.params;

        const ritual = await Ritual.findById(ritualId);
        if (!ritual) {
            return res.status(404).json({ message: 'Ritual not found' });
        }

        // Check if user is the creator
        if (ritual.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await ritual.deleteOne();
        res.json({ message: 'Ritual deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
