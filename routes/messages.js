import express from 'express';
import Message from '../models/Message.js';
import Tribe from '../models/Tribe.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all messages for a tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { limit = 50, before } = req.query;

        const query = { tribe: tribeId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'name avatar email')
            .populate('mentions', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({ messages: messages.reverse() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send a message
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { content, mentions, replyTo } = req.body;

        const message = await Message.create({
            tribe: tribeId,
            sender: req.user._id,
            content,
            mentions: mentions || [],
            replyTo
        });

        await message.populate('sender', 'name avatar email');
        await message.populate('mentions', 'name avatar');

        res.status(201).json({ message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add reaction to message
router.post('/:messageId/reactions', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
            r => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
        );

        if (existingReaction) {
            // Remove reaction if already exists
            message.reactions = message.reactions.filter(
                r => !(r.userId.toString() === req.user._id.toString() && r.emoji === emoji)
            );
        } else {
            // Add new reaction
            message.reactions.push({
                userId: req.user._id,
                userName: req.user.name,
                emoji
            });
        }

        await message.save();
        res.json({ message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update message
router.put('/:messageId', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        message.content = content;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        res.json({ message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete message
router.delete('/:messageId', protect, async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await message.deleteOne();
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
