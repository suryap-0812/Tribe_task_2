import express from 'express';
import { Problem, ProblemSolution, Tribe, User, SolutionVoter, ProblemVoter } from '../models/associations.js';
import { protect } from '../middleware/auth.js';
import sequelize from '../db.js';
import { Op } from 'sequelize';

const router = express.Router({ mergeParams: true });

const solutionInclude = {
    model: ProblemSolution, as: 'solutions',
    include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'voters', attributes: ['id'], through: { attributes: [] } },
    ]
};

// GET all problems for tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { status, category } = req.query;

        // Verify membership
        const isMember = await sequelize.query('SELECT 1 FROM tribe_members WHERE tribe_id = :tribeId AND user_id = :userId LIMIT 1', { replacements: { tribeId, userId: req.user.id }, type: sequelize.QueryTypes.SELECT });
        if (!isMember.length) return res.status(403).json({ message: 'Not authorized for this tribe' });

        const where = { tribeId };
        if (status) where.status = status;
        if (category) where.category = category;

        const problems = await Problem.findAll({
            where,
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'avatar', 'email'] },
                solutionInclude,
                { model: User, as: 'voters', attributes: ['id'], through: { attributes: [] } },
            ],
            order: [['created_at', 'DESC']],
        });

        res.json({ problems: problems.map(p => ({ ...p.toJSON(), _id: p.id })) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create problem
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { title, description, category } = req.body;

        const problem = await Problem.create({ tribeId, title, description, category, creatorId: req.user.id });
        const full = await Problem.findByPk(problem.id, { include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar', 'email'] }, solutionInclude] });
        res.status(201).json({ problem: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST add solution
router.post('/:problemId/solutions', protect, async (req, res) => {
    try {
        const { problemId } = req.params;
        const { content } = req.body;

        const problem = await Problem.findByPk(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        await ProblemSolution.create({ problemId, authorId: req.user.id, content });
        if (problem.status === 'open') { problem.status = 'discussing'; await problem.save(); }

        const full = await Problem.findByPk(problemId, { include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar', 'email'] }, solutionInclude] });
        res.status(201).json({ problem: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST vote on solution
router.post('/:problemId/solutions/:solutionId/vote', protect, async (req, res) => {
    try {
        const { solutionId } = req.params;
        const solution = await ProblemSolution.findByPk(solutionId);
        if (!solution) return res.status(404).json({ message: 'Solution not found' });

        const existing = await SolutionVoter.findOne({ where: { solution_id: solutionId, user_id: req.user.id } });
        if (existing) {
            await existing.destroy();
            solution.votes = Math.max(0, solution.votes - 1);
        } else {
            await SolutionVoter.create({ solution_id: solutionId, user_id: req.user.id });
            solution.votes += 1;
        }
        await solution.save();

        const problem = await Problem.findByPk(solution.problemId, { include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] }, solutionInclude] });
        res.json({ problem: { ...problem.toJSON(), _id: problem.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH update problem status
router.patch('/:problemId/status', protect, async (req, res) => {
    try {
        const { tribeId, problemId } = req.params;
        const { status } = req.body;

        const problem = await Problem.findByPk(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // Must be creator or tribe Leader
        const isLeader = await sequelize.query('SELECT 1 FROM tribe_members WHERE tribe_id = :tribeId AND user_id = :userId AND role = \'Leader\' LIMIT 1', { replacements: { tribeId, userId: req.user.id }, type: sequelize.QueryTypes.SELECT });
        if (problem.creatorId !== req.user.id && !isLeader.length) return res.status(403).json({ message: 'Only creator or tribe leaders can change problem status' });

        problem.status = status;
        if (status === 'resolved') { problem.resolvedAt = new Date(); problem.resolvedBy = req.user.id; }
        await problem.save();

        const full = await Problem.findByPk(problemId, { include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] }, solutionInclude] });
        res.json({ problem: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE problem
router.delete('/:problemId', protect, async (req, res) => {
    try {
        const problem = await Problem.findByPk(req.params.problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        if (problem.creatorId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await problem.destroy();
        res.json({ message: 'Problem deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
