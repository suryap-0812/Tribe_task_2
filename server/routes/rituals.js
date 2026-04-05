import express from 'express';
import { Ritual, RitualAttendance, User } from '../models/associations.js';
import { protect } from '../middleware/auth.js';
import sequelize from '../db.js';

const router = express.Router({ mergeParams: true });

// GET all rituals for tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { isActive = true } = req.query;

        const isMember = await sequelize.query('SELECT 1 FROM tribe_members WHERE tribe_id = :tribeId AND user_id = :userId LIMIT 1', { replacements: { tribeId, userId: req.user.id }, type: sequelize.QueryTypes.SELECT });
        if (!isMember.length) return res.status(403).json({ message: 'Not authorized for this tribe' });

        const rituals = await Ritual.findAll({
            where: { tribeId, isActive: isActive === 'true' || isActive === true },
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
                { model: User, as: 'participants', attributes: ['id', 'name', 'avatar'], through: { attributes: [] } },
            ],
            order: [['next_occurrence', 'ASC NULLS LAST']],
        });

        res.json({ rituals: rituals.map(r => ({ ...r.toJSON(), _id: r.id })) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create ritual
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { name, description, schedule, badge } = req.body;

        // Must be Leader
        const isLeader = await sequelize.query('SELECT 1 FROM tribe_members WHERE tribe_id = :tribeId AND user_id = :userId AND role = \'Leader\' LIMIT 1', { replacements: { tribeId, userId: req.user.id }, type: sequelize.QueryTypes.SELECT });
        if (!isLeader.length) return res.status(403).json({ message: 'Only tribe leaders can create rituals' });

        const ritual = await Ritual.create({
            tribeId,
            name,
            description,
            scheduleType: schedule.type,
            scheduleTime: schedule.time,
            scheduleDay: schedule.day,
            badge: badge || '✨',
            createdBy: req.user.id,
        });

        // Add creator as participant
        await ritual.addParticipants([req.user.id]);

        const full = await Ritual.findByPk(ritual.id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
                { model: User, as: 'participants', attributes: ['id', 'name', 'avatar'], through: { attributes: [] } },
            ],
        });
        res.status(201).json({ ritual: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST mark attendance
router.post('/:ritualId/attendance', protect, async (req, res) => {
    try {
        const { ritualId } = req.params;
        const ritual = await Ritual.findByPk(ritualId, {
            include: [{ model: RitualAttendance, as: 'attendance' }],
        });
        if (!ritual) return res.status(404).json({ message: 'Ritual not found' });

        const today = new Date(); today.setHours(0, 0, 0, 0);

        const hasAttended = ritual.attendance.some(a => {
            const d = new Date(a.date); d.setHours(0, 0, 0, 0);
            return a.userId === req.user.id && d.getTime() === today.getTime();
        });
        if (hasAttended) return res.status(400).json({ message: 'Already marked attendance today' });

        await RitualAttendance.create({ ritualId, userId: req.user.id, date: new Date() });
        ritual.streak += 1;
        await ritual.save();

        res.json({ ritual: { ...ritual.toJSON(), _id: ritual.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST join ritual
router.post('/:ritualId/join', protect, async (req, res) => {
    try {
        const ritual = await Ritual.findByPk(req.params.ritualId, {
            include: [{ model: User, as: 'participants', through: { attributes: [] } }],
        });
        if (!ritual) return res.status(404).json({ message: 'Ritual not found' });

        if (!ritual.participants.some(p => p.id === req.user.id)) {
            await ritual.addParticipants([req.user.id]);
        }

        const full = await Ritual.findByPk(ritual.id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
                { model: User, as: 'participants', attributes: ['id', 'name', 'avatar'], through: { attributes: [] } },
            ],
        });
        res.json({ ritual: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE ritual
router.delete('/:ritualId', protect, async (req, res) => {
    try {
        const ritual = await Ritual.findByPk(req.params.ritualId);
        if (!ritual) return res.status(404).json({ message: 'Ritual not found' });
        if (ritual.createdBy !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await ritual.destroy();
        res.json({ message: 'Ritual deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
