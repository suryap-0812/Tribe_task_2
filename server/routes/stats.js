import express from 'express';
import Task from '../models/Task.js';
import FocusSession from '../models/FocusSession.js';
import Tribe from '../models/Tribe.js';
import { mockTasks, mockFocusSessions, mockTribes } from '../utils/mockData.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const userId = req.user._id;

            const dueToday = mockTasks.filter(t =>
                !t.completed && t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow
            ).length;

            const todaySessions = mockFocusSessions.filter(s =>
                s.status === 'completed' && s.endTime && new Date(s.endTime) >= today && new Date(s.endTime) < tomorrow
            );
            const focusTime = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const sessionsCompleted = todaySessions.length;

            const totalTasks = mockTasks.length;
            const completedTasks = mockTasks.filter(t => t.completed).length;

            const activeTribes = mockTribes.filter(t => t.members.includes(userId)).length;

            const recentTasks = mockTasks
                .filter(t => !t.completed)
                .sort((a, b) => new Date(a.dueDate || a.createdAt) - new Date(b.dueDate || b.createdAt))
                .slice(0, 5);

            return res.json({
                dueToday,
                focusTime,
                sessionsCompleted,
                tasksProgress: {
                    completed: completedTasks,
                    total: totalTasks,
                },
                activeTribes,
                dailyFocusGoal: req.user.dailyFocusGoal || 180,
                recentTasks,
            });
        }

        const userId = req.user._id;

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Tasks due today
        const dueToday = await Task.countDocuments({
            user: userId,
            completed: false,
            dueDate: { $gte: today, $lt: tomorrow },
        });

        // Today's focus time (completed sessions)
        const todaySessions = await FocusSession.find({
            user: userId,
            status: 'completed',
            completedAt: { $gte: today, $lt: tomorrow },
        });

        const focusTime = todaySessions.reduce((total, session) => total + session.duration, 0);

        // Sessions completed today
        const sessionsCompleted = todaySessions.length;

        // Tasks progress
        const totalTasks = await Task.countDocuments({ user: userId });
        const completedTasks = await Task.countDocuments({ user: userId, completed: true });

        // Active tribes
        const activeTribes = await Tribe.countDocuments({
            'members.user': userId,
        });

        // Recent tasks (limit 5)
        const recentTasks = await Task.find({
            user: userId,
            completed: false,
        })
            .populate('tribe', 'name color')
            .sort({ dueDate: 1, createdAt: -1 })
            .limit(5);

        res.json({
            dueToday,
            focusTime,
            sessionsCompleted,
            tasksProgress: {
                completed: completedTasks,
                total: totalTasks,
            },
            activeTribes,
            dailyFocusGoal: req.user.dailyFocusGoal || 180,
            recentTasks,
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/stats/analytics
// @desc    Get detailed analytics data
// @access  Private
router.get('/analytics', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            // Mock Analytics
            // Simple hardcoded or basic calc
            return res.json({
                sessionsByDay: {
                    [new Date().toISOString().split('T')[0]]: 60
                },
                tasksByPriority: [
                    { _id: 'high', count: mockTasks.filter(t => t.priority === 'high').length },
                    { _id: 'medium', count: mockTasks.filter(t => t.priority === 'medium').length },
                    { _id: 'low', count: mockTasks.filter(t => t.priority === 'low').length }
                ],
                tasksByStatus: [
                    { _id: 'pending', count: mockTasks.filter(t => t.status === 'pending').length },
                    { _id: 'completed', count: mockTasks.filter(t => t.status === 'completed').length }
                ],
                completionRate: 50,
                totalFocusTime: mockFocusSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
                totalSessions: mockFocusSessions.length
            });
        }

        const userId = req.user._id;

        // Get last 7 days range
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        last7Days.setHours(0, 0, 0, 0);

        // Focus sessions by day (last 7 days)
        const sessions = await FocusSession.find({
            user: userId,
            status: 'completed',
            completedAt: { $gte: last7Days },
        }).sort({ completedAt: 1 });

        // Group sessions by day
        const sessionsByDay = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            sessionsByDay[dateStr] = 0;
        }

        sessions.forEach((session) => {
            const dateStr = session.completedAt.toISOString().split('T')[0];
            if (sessionsByDay[dateStr] !== undefined) {
                sessionsByDay[dateStr] += session.duration;
            }
        });

        // Tasks by priority
        const tasksByPriority = await Task.aggregate([
            { $match: { user: userId, completed: false } },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);

        // Tasks by status
        const tasksByStatus = await Task.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Completion rate last 7 days
        const tasksLastWeek = await Task.countDocuments({
            user: userId,
            createdAt: { $gte: last7Days },
        });

        const completedLastWeek = await Task.countDocuments({
            user: userId,
            completed: true,
            completedAt: { $gte: last7Days },
        });

        const completionRate = tasksLastWeek > 0 ? (completedLastWeek / tasksLastWeek) * 100 : 0;

        // Total focus time
        const allCompletedSessions = await FocusSession.find({
            user: userId,
            status: 'completed',
        });

        const totalFocusTime = allCompletedSessions.reduce(
            (total, session) => total + session.duration,
            0
        );

        res.json({
            sessionsByDay,
            tasksByPriority,
            tasksByStatus,
            completionRate: Math.round(completionRate),
            totalFocusTime,
            totalSessions: allCompletedSessions.length,
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
