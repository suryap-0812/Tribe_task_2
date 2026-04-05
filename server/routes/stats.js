import express from 'express';
import { Op } from 'sequelize';
import sequelize from '../db.js';
import { Task, FocusSession, Tribe } from '../models/associations.js';
import { mockTasks, mockFocusSessions, mockTribes } from '../utils/mockData.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/stats/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
            const dueToday = mockTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow).length;
            const todaySessions = mockFocusSessions.filter(s => s.status === 'completed' && s.endTime && new Date(s.endTime) >= today && new Date(s.endTime) < tomorrow);
            const focusTime = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const totalTasks = mockTasks.length;
            const completedTasks = mockTasks.filter(t => t.completed).length;
            return res.json({ dueToday, focusTime, sessionsCompleted: todaySessions.length, tasksProgress: { completed: completedTasks, total: totalTasks }, activeTribes: mockTribes.length, dailyFocusGoal: req.user.dailyFocusGoal || 180, recentTasks: mockTasks.filter(t => !t.completed).slice(0, 5) });
        }

        const userId = req.user.id;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

        const [dueToday, todaySessions, totalTasks, completedTasks, activeTribes, recentTasks] = await Promise.all([
            Task.count({ where: { userId, completed: false, dueDate: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
            FocusSession.findAll({ where: { userId, status: 'completed', completedAt: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
            Task.count({ where: { userId } }),
            Task.count({ where: { userId, completed: true } }),
            // Count distinct tribes where user is a member
            sequelize.query(
                'SELECT COUNT(*) as count FROM tribe_members WHERE user_id = :userId',
                { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
            ),
            Task.findAll({ where: { userId, completed: false }, include: [{ model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] }], order: [['due_date', 'ASC NULLS LAST'], ['created_at', 'DESC']], limit: 5 }),
        ]);

        const focusTime = todaySessions.reduce((total, s) => total + (s.duration || 0), 0);

        res.json({
            dueToday,
            focusTime,
            sessionsCompleted: todaySessions.length,
            tasksProgress: { completed: completedTasks, total: totalTasks },
            activeTribes: parseInt(activeTribes[0]?.count || 0),
            dailyFocusGoal: req.user.dailyFocusGoal || 180,
            recentTasks: recentTasks.map(t => ({ ...t.toJSON(), _id: t.id })),
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/stats/analytics
router.get('/analytics', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            return res.json({
                sessionsByDay: { [new Date().toISOString().split('T')[0]]: 60 },
                tasksByPriority: [
                    { _id: 'high', count: mockTasks.filter(t => t.priority === 'high').length },
                    { _id: 'medium', count: mockTasks.filter(t => t.priority === 'medium').length },
                    { _id: 'low', count: mockTasks.filter(t => t.priority === 'low').length },
                ],
                tasksByStatus: [
                    { _id: 'pending', count: mockTasks.filter(t => t.status === 'pending').length },
                    { _id: 'completed', count: mockTasks.filter(t => t.status === 'completed').length },
                ],
                completionRate: 50,
                totalFocusTime: mockFocusSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
                totalSessions: mockFocusSessions.length,
            });
        }

        const userId = req.user.id;
        const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 7); last7Days.setHours(0, 0, 0, 0);

        // Sessions last 7 days
        const sessions = await FocusSession.findAll({
            where: { userId, status: 'completed', completedAt: { [Op.gte]: last7Days } },
            order: [['completed_at', 'ASC']],
        });

        // Group by day
        const sessionsByDay = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            sessionsByDay[d.toISOString().split('T')[0]] = 0;
        }
        sessions.forEach(s => {
            const key = s.completedAt.toISOString().split('T')[0];
            if (sessionsByDay[key] !== undefined) sessionsByDay[key] += s.duration;
        });

        // Task aggregates via raw SQL (Sequelize equivalent of aggregate)
        const [tasksByPriority, tasksByStatus, tasksLastWeek, completedLastWeek, allCompletedSessions] = await Promise.all([
            sequelize.query('SELECT priority AS _id, COUNT(*) AS count FROM tasks WHERE user_id = :userId AND completed = false GROUP BY priority', { replacements: { userId }, type: sequelize.QueryTypes.SELECT }),
            sequelize.query('SELECT status AS _id, COUNT(*) AS count FROM tasks WHERE user_id = :userId GROUP BY status', { replacements: { userId }, type: sequelize.QueryTypes.SELECT }),
            Task.count({ where: { userId, createdAt: { [Op.gte]: last7Days } } }),
            Task.count({ where: { userId, completed: true, completedAt: { [Op.gte]: last7Days } } }),
            FocusSession.findAll({ where: { userId, status: 'completed' } }),
        ]);

        const totalFocusTime = allCompletedSessions.reduce((t, s) => t + (s.duration || 0), 0);
        const completionRate = tasksLastWeek > 0 ? Math.round((completedLastWeek / tasksLastWeek) * 100) : 0;

        res.json({ sessionsByDay, tasksByPriority, tasksByStatus, completionRate, totalFocusTime, totalSessions: allCompletedSessions.length });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
