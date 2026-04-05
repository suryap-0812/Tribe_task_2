import express from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import sequelize from '../db.js';
import {
    Tribe, User, Task, FocusSession, BuddySession, Problem, ProblemSolution,
    TribeMember, TribeJoinRequest, TribeRule, TribeGoal,
    AchievementDefinition, UserAchievement
} from '../models/associations.js';
import { mockTribes, mockTasks, mockUser } from '../utils/mockData.js';
import { protect } from '../middleware/auth.js';
import messagesRouter from './messages.js';
import problemsRouter from './problems.js';
import buddySessionsRouter from './buddySessions.js';
import ritualsRouter from './rituals.js';
import resourcesRouter from './resources.js';

const defaultAchievements = [
    { name: 'First Steps', description: 'Complete your first task', icon: '🎯', rarity: 'common', criteria: 'Complete 1 task', criteriaValue: 1, criteriaType: 'tasks_completed' },
    { name: 'Task Master', description: 'Complete 50 tasks', icon: '📋', rarity: 'rare', criteria: 'Complete 50 tasks', criteriaValue: 50, criteriaType: 'tasks_completed' },
    { name: 'Focus Champion', description: 'Accumulate 100 hours of focus time', icon: '⏱️', rarity: 'epic', criteria: 'Complete 6000 minutes of focus time', criteriaValue: 6000, criteriaType: 'focus_time' },
    { name: 'Streak Warrior', description: 'Maintain a 30-day check-in streak', icon: '🔥', rarity: 'epic', criteria: 'Check in for 30 consecutive days', criteriaValue: 30, criteriaType: 'streak' },
    { name: 'Tribe Legend', description: 'Help your tribe achieve 1000 completed tasks', icon: '👑', rarity: 'legendary', criteria: 'Tribe completes 1000 tasks', criteriaValue: 1000, criteriaType: 'tribe_tasks' },
    { name: 'Perfect Week', description: 'Complete all daily goals for 7 consecutive days', icon: '✨', rarity: 'rare', criteria: 'Complete all goals for 7 days straight', criteriaValue: 7, criteriaType: 'streak' },
    { name: 'Buddy Champion', description: 'Complete 20 buddy sessions', icon: '🤝', rarity: 'rare', criteria: 'Complete 20 buddy sessions', criteriaValue: 20, criteriaType: 'buddy_sessions' },
    { name: 'Problem Solver', description: 'Have 10 of your solutions upvoted', icon: '💡', rarity: 'epic', criteria: 'Get 10 total votes on solutions', criteriaValue: 10, criteriaType: 'solutions_voted' },
];

const router = express.Router();
router.use(protect);

// Helper: format tribe for response
const formatTribe = (tribe, extras = {}) => ({
    ...tribe.toJSON(),
    _id: tribe.id,
    ...extras,
});

// GET /api/tribes
router.get('/', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') return res.json(mockTribes);

        // Get tribes where user is a member
        const tribes = await Tribe.findAll({
            include: [
                { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role', 'joined_at'] } },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            ],
            where: {
                id: {
                    [Op.in]: sequelize.literal(`(SELECT tribe_id FROM tribe_members WHERE user_id = ${req.user.id})`)
                }
            },
            order: [['created_at', 'DESC']],
        });

        const tribesWithStats = await Promise.all(tribes.map(async (tribe) => {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

            const [activeTasks, activeToday] = await Promise.all([
                Task.count({ where: { tribeId: tribe.id, completed: false } }),
                Task.count({ where: { tribeId: tribe.id, completed: false, dueDate: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
            ]);

            const member = tribe.members.find(m => m.id === req.user.id);
            const role = member?.TribeMember?.role || 'Member';

            return formatTribe(tribe, { activeTasks, activeToday, role, memberCount: tribe.members.length });
        }));

        res.json(tribesWithStats);
    } catch (error) {
        console.error('Get tribes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/tribes/:id
router.get('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const tribe = mockTribes.find(t => t._id === req.params.id);
            return tribe ? res.json(tribe) : res.status(404).json({ message: 'Tribe not found' });
        }

        const tribe = await Tribe.findByPk(req.params.id, {
            include: [
                { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role', 'joined_at'] } },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
                { model: TribeRule, as: 'rules', attributes: ['id', 'rule'] },
                { model: TribeGoal, as: 'goals', attributes: ['id', 'goal'] },
            ],
        });

        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const isMember = tribe.members.some(m => m.id === req.user.id);
        if (!isMember) return res.status(403).json({ message: 'Not authorized to view this tribe' });

        res.json(formatTribe(tribe));
    } catch (error) {
        console.error('Get tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/tribes
router.post('/', [
    body('name').trim().notEmpty().withMessage('Tribe name is required'),
    body('color').optional().isIn(['blue','purple','green','red','orange','pink','yellow','indigo','teal']),
    body('category').optional().isIn(['Coding','Fitness','Study','Health','General','Design','Business','Other']),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const newTribe = { _id: `tribe-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
            mockTribes.push(newTribe);
            return res.status(201).json(newTribe);
        }

        const { name, description, color, category, isPrivate, rules, goals } = req.body;
        const tribe = await Tribe.create({ name, description, color: color || 'blue', category: category || 'General', isPrivate: isPrivate || false, createdBy: req.user.id });

        // Creator joins as Leader
        await TribeMember.create({ tribe_id: tribe.id, user_id: req.user.id, role: 'Leader' });

        // Save rules and goals
        if (rules?.length) await TribeRule.bulkCreate(rules.map(r => ({ tribe_id: tribe.id, rule: r })));
        if (goals?.length) await TribeGoal.bulkCreate(goals.map(g => ({ tribe_id: tribe.id, goal: g })));

        const full = await Tribe.findByPk(tribe.id, {
            include: [
                { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role'] } },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
                { model: TribeRule, as: 'rules', attributes: ['id', 'rule'] },
                { model: TribeGoal, as: 'goals', attributes: ['id', 'goal'] },
            ],
        });
        res.status(201).json(formatTribe(full));
    } catch (error) {
        console.error('Create tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/tribes/:id
router.put('/:id', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id, {
            include: [{ model: User, as: 'members', through: { attributes: ['role'] } }],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const member = tribe.members.find(m => m.id === req.user.id);
        if (!member || member.TribeMember.role !== 'Leader') return res.status(403).json({ message: 'Only tribe leaders can update tribe details' });

        if (req.body.name) tribe.name = req.body.name;
        if (req.body.description !== undefined) tribe.description = req.body.description;
        if (req.body.color) tribe.color = req.body.color;
        await tribe.save();

        const full = await Tribe.findByPk(tribe.id, {
            include: [
                { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role'] } },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            ],
        });
        res.json(formatTribe(full));
    } catch (error) {
        console.error('Update tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/tribes/:id
router.delete('/:id', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id);
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });
        if (tribe.createdBy !== req.user.id) return res.status(403).json({ message: 'Only tribe creator can delete the tribe' });

        await tribe.destroy(); // cascade will remove tribe_members, tasks, etc.
        res.json({ message: 'Tribe deleted successfully' });
    } catch (error) {
        console.error('Delete tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/tribes/:id/members — add member by email
router.post('/:id/members', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const tribe = await Tribe.findByPk(req.params.id, {
            include: [{ model: User, as: 'members', through: { attributes: ['role'] } }],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const requester = tribe.members.find(m => m.id === req.user.id);
        if (!requester || requester.TribeMember.role !== 'Leader') return res.status(403).json({ message: 'Only tribe leaders can add members' });

        const userToAdd = await User.findOne({ where: { email: email.toLowerCase() } });
        if (!userToAdd) return res.status(404).json({ message: 'User not found' });

        const alreadyMember = tribe.members.some(m => m.id === userToAdd.id);
        if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

        await TribeMember.create({ tribe_id: tribe.id, user_id: userToAdd.id, role: 'Member' });

        const full = await Tribe.findByPk(tribe.id, {
            include: [
                { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role'] } },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            ],
        });
        res.json(formatTribe(full));
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/tribes/:id/members/:userId
router.delete('/:id/members/:userId', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id, {
            include: [{ model: User, as: 'members', through: { attributes: ['role'] } }],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const requester = tribe.members.find(m => m.id === req.user.id);
        const isRemovingSelf = parseInt(req.params.userId) === req.user.id;
        if (!isRemovingSelf && (!requester || requester.TribeMember.role !== 'Leader')) return res.status(403).json({ message: 'Only tribe leaders can remove members' });
        if (parseInt(req.params.userId) === tribe.createdBy) return res.status(400).json({ message: 'Cannot remove tribe creator' });

        await TribeMember.destroy({ where: { tribe_id: tribe.id, user_id: req.params.userId } });

        const full = await Tribe.findByPk(tribe.id, {
            include: [
                { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role'] } },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            ],
        });
        res.json(formatTribe(full));
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/tribes/:id/join
router.post('/:id/join', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id, {
            include: [{ model: User, as: 'members', through: { attributes: [] } }],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const alreadyMember = tribe.members.some(m => m.id === req.user.id);
        if (alreadyMember) return res.status(400).json({ message: 'You are already a member of this tribe' });

        await TribeMember.create({ tribe_id: tribe.id, user_id: req.user.id, role: 'Member' });

        const full = await Tribe.findByPk(tribe.id, {
            include: [
                { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role'] } },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            ],
        });
        res.json(formatTribe(full));
    } catch (error) {
        console.error('Join tribe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/tribes/search/:id
router.get('/search/:id', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id, {
            attributes: ['id', 'name', 'description', 'color', 'category'],
            include: [
                { model: User, as: 'members', through: { attributes: [] } },
                { model: User, as: 'joinRequests', through: { attributes: [] } },
                { model: User, as: 'creator', attributes: ['id', 'name'] },
            ],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const isMember = tribe.members.some(m => m.id === req.user.id);
        const hasRequested = tribe.joinRequests.some(r => r.id === req.user.id);

        res.json({ ...tribe.toJSON(), _id: tribe.id, isMember, hasRequested, memberCount: tribe.members.length });
    } catch (error) {
        res.status(404).json({ message: 'Tribe not found' });
    }
});

// POST /api/tribes/:id/request
router.post('/:id/request', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id, {
            include: [
                { model: User, as: 'members', through: { attributes: [] } },
                { model: User, as: 'joinRequests', through: { attributes: [] } },
            ],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        if (tribe.members.some(m => m.id === req.user.id)) return res.status(400).json({ message: 'Already a member' });
        if (tribe.joinRequests.some(r => r.id === req.user.id)) return res.status(400).json({ message: 'Join request already sent' });

        await TribeJoinRequest.create({ tribe_id: tribe.id, user_id: req.user.id });
        res.json({ message: 'Join request sent successfully' });
    } catch (error) {
        console.error('Request join error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/tribes/:id/requests
router.get('/:id/requests', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id, {
            include: [
                { model: User, as: 'members', through: { attributes: ['role'] } },
                { model: User, as: 'joinRequests', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['requested_at'] } },
            ],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const requester = tribe.members.find(m => m.id === req.user.id);
        if (!requester || requester.TribeMember.role !== 'Leader') return res.status(403).json({ message: 'Only leaders can view requests' });

        res.json(tribe.joinRequests || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/tribes/:id/requests/:userId/approve
router.post('/:id/requests/:userId/approve', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id, {
            include: [{ model: User, as: 'members', through: { attributes: ['role'] } }],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const requester = tribe.members.find(m => m.id === req.user.id);
        if (!requester || requester.TribeMember.role !== 'Leader') return res.status(403).json({ message: 'Only leaders can approve requests' });

        const request = await TribeJoinRequest.findOne({ where: { tribe_id: tribe.id, user_id: req.params.userId } });
        if (!request) return res.status(404).json({ message: 'Request not found' });

        await TribeMember.create({ tribe_id: tribe.id, user_id: req.params.userId, role: 'Member' });
        await request.destroy();

        res.json({ message: 'Request approved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/tribes/:id/requests/:userId/reject
router.post('/:id/requests/:userId/reject', async (req, res) => {
    try {
        const tribe = await Tribe.findByPk(req.params.id, {
            include: [{ model: User, as: 'members', through: { attributes: ['role'] } }],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const requester = tribe.members.find(m => m.id === req.user.id);
        if (!requester || requester.TribeMember.role !== 'Leader') return res.status(403).json({ message: 'Only leaders can reject requests' });

        await TribeJoinRequest.destroy({ where: { tribe_id: tribe.id, user_id: req.params.userId } });
        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/tribes/:id/analytics
router.get('/:id/analytics', async (req, res) => {
    try {
        const tribeId = req.params.id;
        const tribe = await Tribe.findByPk(tribeId, {
            include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role'] } }],
        });
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 7); last7Days.setHours(0, 0, 0, 0);

        // Build 7 day labels
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        const [rawWeeklyTasks, rawWeeklyFocus, memberTasksRaw, memberFocusRaw, totalTasks, completedTasks, totalFocusRaw] = await Promise.all([
            sequelize.query('SELECT DATE(completed_at) as day, COUNT(*) as count FROM tasks WHERE tribe_id = :tribeId AND completed = true AND completed_at >= :since GROUP BY DATE(completed_at)', { replacements: { tribeId, since: last7Days }, type: sequelize.QueryTypes.SELECT }),
            sequelize.query('SELECT DATE(completed_at) as day, SUM(duration) as duration FROM focus_sessions WHERE tribe_id = :tribeId AND status = \'completed\' AND completed_at >= :since GROUP BY DATE(completed_at)', { replacements: { tribeId, since: last7Days }, type: sequelize.QueryTypes.SELECT }),
            sequelize.query('SELECT user_id, COUNT(*) as count FROM tasks WHERE tribe_id = :tribeId AND completed = true GROUP BY user_id', { replacements: { tribeId }, type: sequelize.QueryTypes.SELECT }),
            sequelize.query('SELECT user_id, SUM(duration) as duration FROM focus_sessions WHERE tribe_id = :tribeId AND status = \'completed\' GROUP BY user_id', { replacements: { tribeId }, type: sequelize.QueryTypes.SELECT }),
            Task.count({ where: { tribeId } }),
            Task.count({ where: { tribeId, completed: true } }),
            sequelize.query('SELECT SUM(duration) as total FROM focus_sessions WHERE tribe_id = :tribeId AND status = \'completed\'', { replacements: { tribeId }, type: sequelize.QueryTypes.SELECT }),
        ]);

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const totalFocusTime = parseInt(totalFocusRaw[0]?.total || 0);
        const averageFocusTime = tribe.members.length > 0 ? Math.round(totalFocusTime / tribe.members.length) : 0;

        const weeklyTasks = days.map(day => { const f = rawWeeklyTasks.find(d => d.day && d.day.toString().startsWith(day)); return f ? parseInt(f.count) : 0; });
        const weeklyFocus = days.map(day => { const f = rawWeeklyFocus.find(d => d.day && d.day.toString().startsWith(day)); return f ? parseInt(f.duration) : 0; });

        const memberContributions = tribe.members.map(m => {
            const t = memberTasksRaw.find(x => parseInt(x.user_id) === m.id);
            const f = memberFocusRaw.find(x => parseInt(x.user_id) === m.id);
            const tasksCount = t ? parseInt(t.count) : 0;
            const focusCount = f ? parseInt(f.duration) : 0;
            const taskWeight = completedTasks > 0 ? tasksCount / completedTasks : 0;
            const focusWeight = totalFocusTime > 0 ? focusCount / totalFocusTime : 0;
            return { member: { id: m.id, name: m.name, avatar: m.avatar }, tasks: tasksCount, focusTime: focusCount, contributions: Math.round((taskWeight + focusWeight) * 50) };
        });

        res.json({ weeklyTasks, weeklyFocus, memberContributions, completionRate, averageFocusTime, totalTasksCompleted: completedTasks, activeStreak: 0 });
    } catch (error) {
        console.error('Get tribe analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/tribes/:id/achievements
router.get('/:id/achievements', async (req, res) => {
    try {
        const tribeId = parseInt(req.params.id);
        const userId = req.user.id;

        // Seed definitions if empty
        let definitions = await AchievementDefinition.findAll();
        if (definitions.length === 0) {
            definitions = await AchievementDefinition.bulkCreate(defaultAchievements);
        }

        const achievementsData = [];
        for (const def of definitions) {
            let currentValue = 0;

            if (def.criteriaType === 'tasks_completed') {
                currentValue = await Task.count({ where: { userId, tribeId, completed: true } });
            } else if (def.criteriaType === 'focus_time') {
                const [r] = await sequelize.query('SELECT COALESCE(SUM(duration), 0) as total FROM focus_sessions WHERE user_id = :userId AND tribe_id = :tribeId AND status = \'completed\'', { replacements: { userId, tribeId }, type: sequelize.QueryTypes.SELECT });
                currentValue = parseInt(r?.total || 0);
            } else if (def.criteriaType === 'streak') {
                currentValue = req.user.checkInStreak || 0;
            } else if (def.criteriaType === 'tribe_tasks') {
                currentValue = await Task.count({ where: { tribeId, completed: true } });
            } else if (def.criteriaType === 'buddy_sessions') {
                const sessions = await sequelize.query('SELECT COUNT(*) as count FROM buddy_sessions bs JOIN buddy_session_participants bsp ON bs.id = bsp.session_id WHERE bs.tribe_id = :tribeId AND bsp.user_id = :userId AND bs.status = \'completed\'', { replacements: { tribeId, userId }, type: sequelize.QueryTypes.SELECT });
                currentValue = parseInt(sessions[0]?.count || 0);
            } else if (def.criteriaType === 'solutions_voted') {
                const [r] = await sequelize.query('SELECT COALESCE(SUM(ps.votes), 0) as total FROM problem_solutions ps JOIN problems p ON ps.problem_id = p.id WHERE p.tribe_id = :tribeId AND ps.author_id = :userId', { replacements: { tribeId, userId }, type: sequelize.QueryTypes.SELECT });
                currentValue = parseInt(r?.total || 0);
            }

            const progress = Math.min(Math.round((currentValue / def.criteriaValue) * 100), 100);
            const unlocked = progress >= 100;

            let userAch = await UserAchievement.findOne({ where: { userId, tribeId, achievementName: def.name } });
            if (!userAch) {
                userAch = await UserAchievement.create({ userId, tribeId, achievementName: def.name, progress, unlocked, currentValue, unlockedAt: unlocked ? new Date() : null });
            } else if (progress > userAch.progress || currentValue !== userAch.currentValue) {
                userAch.progress = progress;
                userAch.currentValue = currentValue;
                if (unlocked && !userAch.unlocked) { userAch.unlocked = true; userAch.unlockedAt = new Date(); }
                await userAch.save();
            }

            achievementsData.push({
                id: def.id, name: def.name, description: def.description, icon: def.icon, rarity: def.rarity,
                unlocked: userAch.unlocked, unlockedDate: userAch.unlockedAt, progress: userAch.progress,
                criteria: def.criteria, currentValue: userAch.currentValue, targetValue: def.criteriaValue,
            });
        }

        res.json(achievementsData);
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mount nested routes
router.use('/:tribeId/messages', messagesRouter);
router.use('/:tribeId/problems', problemsRouter);
router.use('/:tribeId/buddy-sessions', buddySessionsRouter);
router.use('/:tribeId/rituals', ritualsRouter);
router.use('/:tribeId/resources', resourcesRouter);

export default router;
