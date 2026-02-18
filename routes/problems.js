import express from 'express';
import Problem from '../models/Problem.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all problems for a tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { status, category } = req.query;

        const query = { tribe: tribeId };
        if (status) query.status = status;
        if (category) query.category = category;

        const problems = await Problem.find(query)
            .populate('creator', 'name avatar email')
            .populate('solutions.author', 'name avatar')
            .populate('resolvedBy', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({ problems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a problem
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { title, description, category } = req.body;

        const problem = await Problem.create({
            tribe: tribeId,
            title,
            description,
            category,
            creator: req.user._id
        });

        await problem.populate('creator', 'name avatar email');
        res.status(201).json({ problem });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add solution to problem
router.post('/:problemId/solutions', protect, async (req, res) => {
    try {
        const { problemId } = req.params;
        const { content } = req.body;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        problem.solutions.push({
            author: req.user._id,
            content
        });

        // Auto-change status to discussing if was open
        if (problem.status === 'open') {
            problem.status = 'discussing';
        }

        await problem.save();
        await problem.populate('solutions.author', 'name avatar');

        res.status(201).json({ problem });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Vote on solution
router.post('/:problemId/solutions/:solutionId/vote', protect, async (req, res) => {
    try {
        const { problemId, solutionId } = req.params;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const solution = problem.solutions.id(solutionId);
        if (!solution) {
            return res.status(404).json({ message: 'Solution not found' });
        }

        // Toggle vote
        const voterIndex = solution.voters.indexOf(req.user._id);
        if (voterIndex > -1) {
            solution.voters.splice(voterIndex, 1);
            solution.votes -= 1;
        } else {
            solution.voters.push(req.user._id);
            solution.votes += 1;
        }

        await problem.save();
        res.json({ problem });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update problem status
router.patch('/:problemId/status', protect, async (req, res) => {
    try {
        const { problemId } = req.params;
        const { status } = req.body;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        problem.status = status;
        if (status === 'resolved') {
            problem.resolvedAt = new Date();
            problem.resolvedBy = req.user._id;
        }

        await problem.save();
        await problem.populate('resolvedBy', 'name avatar');

        res.json({ problem });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete problem
router.delete('/:problemId', protect, async (req, res) => {
    try {
        const { problemId } = req.params;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Check if user is the creator
        if (problem.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await problem.deleteOne();
        res.json({ message: 'Problem deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
