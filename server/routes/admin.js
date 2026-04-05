import express from 'express';
import { Op } from 'sequelize';
import sequelize from '../db.js';
import { User, Tribe, Task, FocusSession, TribeMember } from '../models/associations.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalUsers, totalTribes, totalTasks, totalFocusSessions, newUsers, newTribes] = await Promise.all([
            User.count(),
            Tribe.count(),
            Task.count({ where: { status: 'completed' } }),
            FocusSession.count({ where: { status: 'completed' } }),
            User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
            Tribe.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
        ]);

        res.json({ totalUsers, totalTribes, totalTasks, totalFocusSessions, growth: { newUsers, newTribes }, lastUpdated: new Date() });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
        });

        const usersWithCounts = await Promise.all(users.map(async (user) => {
            const activeTribeCount = await sequelize.query(
                'SELECT COUNT(*) as count FROM tribe_members WHERE user_id = :userId',
                { replacements: { userId: user.id }, type: sequelize.QueryTypes.SELECT }
            );
            return { ...user.toJSON(), _id: user.id, currentTribeCount: parseInt(activeTribeCount[0]?.count || 0) };
        }));

        res.json(usersWithCounts);
    } catch (error) {
        console.error('Admin users fetch error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own administrative account' });

        if (user.isAdmin) {
            const adminCount = await User.count({ where: { isAdmin: true } });
            if (adminCount <= 1) return res.status(400).json({ message: 'Cannot delete the only admin' });
        }

        // Remove user from all tribe_members
        await sequelize.query('DELETE FROM tribe_members WHERE user_id = :userId', { replacements: { userId: req.params.id } });

        await User.destroy({ where: { id: req.params.id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin user delete error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

// GET /api/admin/tribes
router.get('/tribes', async (req, res) => {
    try {
        const tribes = await Tribe.findAll({
            include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
            order: [['created_at', 'DESC']],
        });
        res.json(tribes.map(t => ({ ...t.toJSON(), _id: t.id })));
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching tribes' });
    }
});

// DELETE /api/admin/tribes/:id
router.delete('/tribes/:id', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id);
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        // Remove all tribe_members — cascade should handle it, but be explicit
        await sequelize.query('DELETE FROM tribe_members WHERE tribe_id = :tribeId', { replacements: { tribeId: req.params.id } });

        await Tribe.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Tribe deleted successfully' });
    } catch (error) {
        console.error('Admin tribe delete error:', error);
        res.status(500).json({ message: 'Server error deleting tribe' });
    }
});

export default router;
