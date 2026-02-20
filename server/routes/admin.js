import express from 'express';
import User from '../models/User.js';
import Tribe from '../models/Tribe.js';
import Task from '../models/Task.js';
import FocusSession from '../models/FocusSession.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/stats
// @desc    Get system-wide stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTribes = await Tribe.countDocuments();
        const totalTasks = await Task.countDocuments({ status: 'completed' });
        const totalFocusSessions = await FocusSession.countDocuments({ status: 'completed' });

        // Growth stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const newTribes = await Tribe.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        res.json({
            totalUsers,
            totalTribes,
            totalTasks,
            totalFocusSessions,
            growth: {
                newUsers,
                newTribes
            },
            lastUpdated: new Date()
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users with real-time tribe counts
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        // Enhance users with the actual count of tribes they are currently in
        const usersWithRealCounts = await Promise.all(users.map(async (user) => {
            const activeTribeCount = await Tribe.countDocuments({
                'members.user': user._id
            });

            const userObj = user.toObject();
            // Override the static tribes array length with real-time membership count
            userObj.currentTribeCount = activeTribeCount;
            return userObj;
        }));

        res.json(usersWithRealCounts);
    } catch (error) {
        console.error('Admin users fetch error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent self-deletion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own administrative account' });
        }

        if (user.isAdmin && (await User.countDocuments({ isAdmin: true })) <= 1) {
            return res.status(400).json({ message: 'Cannot delete the only admin' });
        }

        // Cleanup: remove user from all tribes they are in
        await Tribe.updateMany(
            { 'members.user': req.params.id },
            { $pull: { members: { user: req.params.id } } }
        );

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin user delete error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

// @route   GET /api/admin/tribes
// @desc    Get all tribes
router.get('/tribes', async (req, res) => {
    try {
        const tribes = await Tribe.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(tribes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching tribes' });
    }
});

// @route   DELETE /api/admin/tribes/:id
// @desc    Delete a tribe
router.delete('/tribes/:id', async (req, res) => {
    try {
        const tribe = await Tribe.findById(req.params.id);
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        // Cleanup: remove tribe from all users' tribes array
        await User.updateMany(
            { tribes: tribe._id },
            { $pull: { tribes: tribe._id } }
        );

        await Tribe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tribe deleted successfully' });
    } catch (error) {
        console.error('Admin tribe delete error:', error);
        res.status(500).json({ message: 'Server error deleting tribe' });
    }
});

export default router;
