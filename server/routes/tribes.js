import express from 'express';
import { body, validationResult } from 'express-validator';
import Tribe from '../models/Tribe.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { mockTribes, mockTasks, mockUser } from '../utils/mockData.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/tribes
// @desc    Get all tribes for current user
// @access  Private
router.get('/', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const tribesWithStats = mockTribes.map(tribe => {
                // Check if user is a member
                const member = tribe.members.includes(req.user._id) ? { role: 'Member' } : null; // simplified logic

                // Simple mock stats
                return {
                    ...tribe,
                    memberCount: tribe.members.length,
                    activeTasks: mockTasks.filter(t => t.tribe === tribe._id && !t.completed).length,
                    activeToday: mockTasks.filter(t => t.tribe === tribe._id && !t.completed && new Date(t.dueDate).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)).length,
                    role: tribe.admin === req.user._id ? 'Leader' : 'Member'
                };
            });
            return res.json(tribesWithStats);
        }

        const tribes = await Tribe.find({
            'members.user': req.user._id,
        })
            .populate('members.user', 'name email avatar')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        // Get active tasks count for each tribe
        const tribesWithStats = await Promise.all(
            tribes.map(async (tribe) => {
                const activeTasks = await Task.countDocuments({
                    tribe: tribe._id,
                    completed: false,
                });

                const activeToday = await Task.countDocuments({
                    tribe: tribe._id,
                    completed: false,
                    dueDate: {
                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                    },
                });

                // Get user's role in this tribe
                const member = tribe.members.find(
                    (m) => m.user._id.toString() === req.user._id.toString()
                );

                return {
                    ...tribe.toObject(),
                    activeTasks,
                    activeToday,
                    role: member?.role || 'Member',
                    memberCount: tribe.members.length,
                };
            })
        );

        res.json(tribesWithStats);
    } catch (error) {
        console.error('Get tribes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tribes/:id
// @desc    Get specific tribe
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const tribe = mockTribes.find(t => t._id === req.params.id);
            if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

            // Expand members for detail view
            const tribeDetail = {
                ...tribe,
                members: tribe.members.map(id => ({
                    user: { _id: id, name: id === req.user._id ? req.user.name : 'Mock Member', email: 'mock@example.com', avatar: '' },
                    role: tribe.admin === id ? 'Leader' : 'Member'
                })),
                createdBy: { _id: tribe.admin, name: 'Mock Admin', email: 'admin@example.com' }
            };
            return res.json(tribeDetail);
        }

        const tribe = await Tribe.findById(req.params.id)
            .populate('members.user', 'name email avatar')
            .populate('createdBy', 'name email');

        if (!tribe) {
            return res.status(404).json({ message: 'Tribe not found' });
        }

        // Check if user is a member
        const isMember = tribe.members.some(
            (m) => m.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized to view this tribe' });
        }

        res.json(tribe);
    } catch (error) {
        console.error('Get tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/tribes
// @desc    Create new tribe
// @access  Private
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Tribe name is required'),
        body('color').optional().isIn(['blue', 'purple', 'green', 'red', 'orange', 'pink', 'yellow', 'indigo', 'teal']),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            if (process.env.USE_MOCK_DATA === 'true') {
                const newTribe = {
                    _id: `tribe-${Date.now()}`,
                    name: req.body.name,
                    description: req.body.description,
                    color: req.body.color || 'blue',
                    members: [req.user._id],
                    admin: req.user._id,
                    isPrivate: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                mockTribes.push(newTribe);
                return res.status(201).json(newTribe);
            }

            const tribe = await Tribe.create({
                name: req.body.name,
                description: req.body.description,
                color: req.body.color || 'blue',
                createdBy: req.user._id,
                members: [
                    {
                        user: req.user._id,
                        role: 'Leader',
                    },
                ],
            });

            // Add tribe to user's tribes
            await User.findByIdAndUpdate(req.user._id, {
                $push: { tribes: tribe._id },
            });

            await tribe.populate('members.user', 'name email avatar');
            await tribe.populate('createdBy', 'name email');

            res.status(201).json(tribe);
        } catch (error) {
            console.error('Create tribe error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   PUT /api/tribes/:id
// @desc    Update tribe
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const tribe = await Tribe.findById(req.params.id);

        if (!tribe) {
            return res.status(404).json({ message: 'Tribe not found' });
        }

        // Check if user is the leader
        const member = tribe.members.find(
            (m) => m.user.toString() === req.user._id.toString()
        );

        if (!member || member.role !== 'Leader') {
            return res.status(403).json({ message: 'Only tribe leaders can update tribe details' });
        }

        // Update fields
        if (req.body.name) tribe.name = req.body.name;
        if (req.body.description !== undefined) tribe.description = req.body.description;
        if (req.body.color) tribe.color = req.body.color;

        await tribe.save();
        await tribe.populate('members.user', 'name email avatar');
        await tribe.populate('createdBy', 'name email');

        res.json(tribe);
    } catch (error) {
        console.error('Update tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/tribes/:id
// @desc    Delete tribe
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const tribe = await Tribe.findById(req.params.id);

        if (!tribe) {
            return res.status(404).json({ message: 'Tribe not found' });
        }

        // Check if user is the creator
        if (tribe.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only tribe creator can delete the tribe' });
        }

        // Remove tribe from all members' tribes array
        await User.updateMany(
            { tribes: tribe._id },
            { $pull: { tribes: tribe._id } }
        );

        await Tribe.findByIdAndDelete(req.params.id);

        res.json({ message: 'Tribe deleted successfully' });
    } catch (error) {
        console.error('Delete tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/tribes/:id/members
// @desc    Add member to tribe
// @access  Private
router.post('/:id/members', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const tribe = await Tribe.findById(req.params.id);

        if (!tribe) {
            return res.status(404).json({ message: 'Tribe not found' });
        }

        // Check if requester is a leader
        const requester = tribe.members.find(
            (m) => m.user.toString() === req.user._id.toString()
        );

        if (!requester || requester.role !== 'Leader') {
            return res.status(403).json({ message: 'Only tribe leaders can add members' });
        }

        // Find user to add
        const userToAdd = await User.findOne({ email: email.toLowerCase() });

        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already a member
        const alreadyMember = tribe.members.some(
            (m) => m.user.toString() === userToAdd._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        // Add member
        tribe.members.push({
            user: userToAdd._id,
            role: 'Member',
        });

        await tribe.save();

        // Add tribe to user's tribes
        await User.findByIdAndUpdate(userToAdd._id, {
            $push: { tribes: tribe._id },
        });

        await tribe.populate('members.user', 'name email avatar');
        await tribe.populate('createdBy', 'name email');

        res.json(tribe);
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/tribes/:id/members/:userId
// @desc    Remove member from tribe
// @access  Private
router.delete('/:id/members/:userId', async (req, res) => {
    try {
        const tribe = await Tribe.findById(req.params.id);

        if (!tribe) {
            return res.status(404).json({ message: 'Tribe not found' });
        }

        // Check if requester is a leader or removing themselves
        const requester = tribe.members.find(
            (m) => m.user.toString() === req.user._id.toString()
        );

        const isRemovingSelf = req.params.userId === req.user._id.toString();

        if (!isRemovingSelf && (!requester || requester.role !== 'Leader')) {
            return res.status(403).json({ message: 'Only tribe leaders can remove members' });
        }

        // Can't remove the creator
        if (req.params.userId === tribe.createdBy.toString()) {
            return res.status(400).json({ message: 'Cannot remove tribe creator' });
        }

        // Remove member
        tribe.members = tribe.members.filter(
            (m) => m.user.toString() !== req.params.userId
        );

        await tribe.save();

        // Remove tribe from user's tribes
        await User.findByIdAndUpdate(req.params.userId, {
            $pull: { tribes: tribe._id },
        });

        await tribe.populate('members.user', 'name email avatar');
        await tribe.populate('createdBy', 'name email');

        res.json(tribe);
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/tribes/:id/join
// @desc    Join a tribe
// @access  Private
router.post('/:id/join', async (req, res) => {
    try {
        const tribe = await Tribe.findById(req.params.id);

        if (!tribe) {
            return res.status(404).json({ message: 'Tribe not found' });
        }

        // Check if already a member
        const alreadyMember = tribe.members.some(
            (m) => m.user.toString() === req.user._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({ message: 'You are already a member of this tribe' });
        }

        // Add member
        tribe.members.push({
            user: req.user._id,
            role: 'Member',
        });

        await tribe.save();

        // Add tribe to user's tribes
        await User.findByIdAndUpdate(req.user._id, {
            $push: { tribes: tribe._id },
        });

        await tribe.populate('members.user', 'name email avatar');
        await tribe.populate('createdBy', 'name email');

        res.json(tribe);
    } catch (error) {
        console.error('Join tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Import and use nested routes (converted to ES6)
import messagesRouter from './messages.js';
import problemsRouter from './problems.js';
import buddySessionsRouter from './buddySessions.js';
import ritualsRouter from './rituals.js';
import resourcesRouter from './resources.js';

// Mount nested routes
router.use('/:tribeId/messages', messagesRouter);
router.use('/:tribeId/problems', problemsRouter);
router.use('/:tribeId/buddy-sessions', buddySessionsRouter);
router.use('/:tribeId/rituals', ritualsRouter);
router.use('/:tribeId/resources', resourcesRouter);

export default router;
