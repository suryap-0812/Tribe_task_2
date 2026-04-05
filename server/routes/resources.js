import express from 'express';
import { Resource, User, ResourceTag } from '../models/associations.js';
import { protect } from '../middleware/auth.js';
import sequelize from '../db.js';
import { Op } from 'sequelize';

const router = express.Router({ mergeParams: true });

// GET all resources for tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { type, category, search } = req.query;

        const isMember = await sequelize.query('SELECT 1 FROM tribe_members WHERE tribe_id = :tribeId AND user_id = :userId LIMIT 1', { replacements: { tribeId, userId: req.user.id }, type: sequelize.QueryTypes.SELECT });
        if (!isMember.length) return res.status(403).json({ message: 'Not authorized for this tribe' });

        const where = { tribeId, isPublic: true };
        if (type) where.type = type;
        if (category) where.category = category;
        if (search) where.name = { [Op.iLike]: `%${search}%` };

        const resources = await Resource.findAll({
            where,
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'name', 'avatar', 'email'] },
                { model: ResourceTag, as: 'tags', attributes: ['tag'] },
            ],
            order: [['created_at', 'DESC']],
        });

        res.json({ resources: resources.map(r => ({ ...r.toJSON(), _id: r.id, tags: r.tags.map(t => t.tag) })) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST upload resource
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { name, description, type, url, category, size, tags } = req.body;

        const resource = await Resource.create({ tribeId, name, description, type, url, category, size, uploaderId: req.user.id });

        if (tags && tags.length > 0) {
            await ResourceTag.bulkCreate(tags.map(tag => ({ resource_id: resource.id, tag })));
        }

        const full = await Resource.findByPk(resource.id, {
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'name', 'avatar', 'email'] },
                { model: ResourceTag, as: 'tags', attributes: ['tag'] },
            ],
        });
        res.status(201).json({ resource: { ...full.toJSON(), _id: full.id, tags: full.tags.map(t => t.tag) } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST increment download count
router.post('/:resourceId/download', protect, async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.resourceId);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        resource.downloads += 1;
        await resource.save();
        res.json({ resource: { ...resource.toJSON(), _id: resource.id } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE resource
router.delete('/:resourceId', protect, async (req, res) => {
    try {
        const { tribeId, resourceId } = req.params;
        const resource = await Resource.findByPk(resourceId);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        const isLeader = await sequelize.query('SELECT 1 FROM tribe_members WHERE tribe_id = :tribeId AND user_id = :userId AND role = \'Leader\' LIMIT 1', { replacements: { tribeId, userId: req.user.id }, type: sequelize.QueryTypes.SELECT });
        if (resource.uploaderId !== req.user.id && !isLeader.length) return res.status(403).json({ message: 'Only uploader or tribe leaders can delete resources' });

        await resource.destroy();
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
