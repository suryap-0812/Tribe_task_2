import express from 'express';
import { body, validationResult } from 'express-validator';
import { Task, Tribe, TaskTag } from '../models/associations.js';
import { mockTasks } from '../utils/mockData.js';
import { protect } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();
router.use(protect);

// Helper: build task response with tags
const formatTask = async (task) => {
    const tags = await TaskTag.findAll({ where: { task_id: task.id } });
    return { ...task.toJSON(), _id: task.id, tags: tags.map(t => t.tag) };
};

// GET /api/tasks
router.get('/', async (req, res) => {
    try {
        const { status, tribe, priority, starred } = req.query;

        if (process.env.USE_MOCK_DATA === 'true') {
            let tasks = [...mockTasks];
            if (status) tasks = tasks.filter(t => t.status === status);
            if (tribe) tasks = tasks.filter(t => t.tribe === tribe);
            if (priority) tasks = tasks.filter(t => t.priority === priority);
            if (starred === 'true') tasks = tasks.filter(t => t.starred);
            return res.json(tasks);
        }

        const where = { userId: req.user.id };
        if (status) where.status = status;
        if (tribe) where.tribeId = tribe;
        if (priority) where.priority = priority;
        if (starred === 'true') where.starred = true;

        const tasks = await Task.findAll({
            where,
            include: [{ model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] }],
            order: [['due_date', 'ASC NULLS LAST'], ['created_at', 'DESC']],
        });

        const result = await Promise.all(tasks.map(formatTask));
        res.json(result);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const task = mockTasks.find(t => t._id === req.params.id);
            if (!task) return res.status(404).json({ message: 'Task not found' });
            return res.json(task);
        }

        const task = await Task.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] }],
        });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        res.json(await formatTask(task));
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/tasks
router.post('/', [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const newTask = { _id: `task-${Date.now()}`, ...req.body, user: req.user.id, createdAt: new Date().toISOString() };
            mockTasks.push(newTask);
            return res.status(201).json(newTask);
        }

        const { title, description, priority, status, dueDate, tribeId, tags, isGroupTask, assignedRole } = req.body;
        const task = await Task.create({ title, description, priority, status, dueDate, tribeId, userId: req.user.id, isGroupTask, assignedRole });

        // Save tags
        if (tags && tags.length > 0) {
            await TaskTag.bulkCreate(tags.map(tag => ({ task_id: task.id, tag })));
        }

        const fullTask = await Task.findByPk(task.id, {
            include: [{ model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] }],
        });
        res.status(201).json(await formatTask(fullTask));
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const idx = mockTasks.findIndex(t => t._id === req.params.id);
            if (idx === -1) return res.status(404).json({ message: 'Task not found' });
            mockTasks[idx] = { ...mockTasks[idx], ...req.body, updatedAt: new Date().toISOString() };
            return res.json(mockTasks[idx]);
        }

        const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const allowedUpdates = ['title', 'description', 'priority', 'status', 'dueDate', 'tribeId', 'starred', 'completed'];
        allowedUpdates.forEach(field => { if (req.body[field] !== undefined) task[field] = req.body[field]; });
        await task.save();

        // Update tags if provided
        if (req.body.tags !== undefined) {
            await TaskTag.destroy({ where: { task_id: task.id } });
            if (req.body.tags.length > 0) {
                await TaskTag.bulkCreate(req.body.tags.map(tag => ({ task_id: task.id, tag })));
            }
        }

        const fullTask = await Task.findByPk(task.id, {
            include: [{ model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] }],
        });
        res.json(await formatTask(fullTask));
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const idx = mockTasks.findIndex(t => t._id === req.params.id);
            if (idx === -1) return res.status(404).json({ message: 'Task not found' });
            mockTasks[idx].completed = !mockTasks[idx].completed;
            mockTasks[idx].status = mockTasks[idx].completed ? 'completed' : 'pending';
            return res.json(mockTasks[idx]);
        }

        const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.completed = !task.completed;
        await task.save();

        const fullTask = await Task.findByPk(task.id, {
            include: [{ model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] }],
        });
        res.json(await formatTask(fullTask));
    } catch (error) {
        console.error('Toggle complete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/tasks/:id/star
router.patch('/:id/star', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const idx = mockTasks.findIndex(t => t._id === req.params.id);
            if (idx === -1) return res.status(404).json({ message: 'Task not found' });
            mockTasks[idx].starred = !mockTasks[idx].starred;
            return res.json(mockTasks[idx]);
        }

        const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.starred = !task.starred;
        await task.save();

        const fullTask = await Task.findByPk(task.id, {
            include: [{ model: Tribe, as: 'tribe', attributes: ['id', 'name', 'color'] }],
        });
        res.json(await formatTask(fullTask));
    } catch (error) {
        console.error('Toggle star error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        if (process.env.USE_MOCK_DATA === 'true') {
            const idx = mockTasks.findIndex(t => t._id === req.params.id);
            if (idx === -1) return res.status(404).json({ message: 'Task not found' });
            mockTasks.splice(idx, 1);
            return res.json({ message: 'Task deleted successfully' });
        }

        const destroyed = await Task.destroy({ where: { id: req.params.id, userId: req.user.id } });
        if (!destroyed) return res.status(404).json({ message: 'Task not found' });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
