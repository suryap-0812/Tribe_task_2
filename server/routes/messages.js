import express from 'express';
import { Message, MessageReaction, User, Tribe } from '../models/associations.js';
import { protect } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router({ mergeParams: true });

// GET all messages for a tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { limit = 50, before } = req.query;

        const where = { tribeId };
        if (before) where.created_at = { [Op.lt]: new Date(before) };

        const messages = await Message.findAll({
            where,
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'avatar', 'email'] },
                { model: User, as: 'mentions', attributes: ['id', 'name', 'avatar'], through: { attributes: [] } },
                { model: MessageReaction, as: 'reactions', include: [{ model: User, attributes: ['id', 'name'] }] },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
        });

        const formatted = messages.reverse().map(m => ({ ...m.toJSON(), _id: m.id }));
        res.json({ messages: formatted });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST send a message
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { content, mentions, replyTo } = req.body;

        const message = await Message.create({ tribeId, senderId: req.user.id, content, replyToId: replyTo || null });

        // Save mentions
        if (mentions && mentions.length > 0) {
            await message.setMentions(mentions);
        }

        const full = await Message.findByPk(message.id, {
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'avatar', 'email'] },
                { model: User, as: 'mentions', attributes: ['id', 'name', 'avatar'], through: { attributes: [] } },
                { model: MessageReaction, as: 'reactions' },
            ],
        });
        res.status(201).json({ message: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST add reaction
router.post('/:messageId/reactions', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        const message = await Message.findByPk(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        // Toggle reaction
        const existing = await MessageReaction.findOne({
            where: { messageId, userId: req.user.id, emoji }
        });

        if (existing) {
            await existing.destroy();
        } else {
            await MessageReaction.create({ messageId, userId: req.user.id, userName: req.user.name, emoji });
        }

        const full = await Message.findByPk(messageId, {
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'avatar', 'email'] },
                { model: MessageReaction, as: 'reactions' },
            ],
        });
        res.json({ message: { ...full.toJSON(), _id: full.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update message
router.put('/:messageId', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findByPk(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        if (message.senderId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        message.content = req.body.content;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        res.json({ message: { ...message.toJSON(), _id: message.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE message
router.delete('/:messageId', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findByPk(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        if (message.senderId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await message.destroy();
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
