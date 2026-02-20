import express from 'express';
import Resource from '../models/Resource.js';
import Tribe from '../models/Tribe.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Get all resources for a tribe
router.get('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { type, category, search } = req.query;

        // Verify user is a member of the tribe
        const tribe = await Tribe.findOne({ _id: tribeId, 'members.user': req.user._id });
        if (!tribe) {
            return res.status(403).json({ message: 'Not authorized for this tribe' });
        }

        const query = { tribe: tribeId, isPublic: true };
        if (type) query.type = type;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const resources = await Resource.find(query)
            .populate('uploader', 'name avatar email')
            .sort({ createdAt: -1 });

        res.json({ resources });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload a resource
router.post('/', protect, async (req, res) => {
    try {
        const { tribeId } = req.params;
        const { name, description, type, url, category, size, tags } = req.body;

        const resource = await Resource.create({
            tribe: tribeId,
            name,
            description,
            type,
            url,
            category,
            size,
            tags: tags || [],
            uploader: req.user._id
        });

        await resource.populate('uploader', 'name avatar email');
        res.status(201).json({ resource });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Increment download count
router.post('/:resourceId/download', protect, async (req, res) => {
    try {
        const { resourceId } = req.params;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        resource.downloads += 1;
        await resource.save();

        res.json({ resource });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete resource
router.delete('/:resourceId', protect, async (req, res) => {
    try {
        const { tribeId, resourceId } = req.params;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if user is the uploader OR a tribe leader
        const tribe = await Tribe.findOne({
            _id: tribeId,
            members: { $elemMatch: { user: req.user._id, role: 'Leader' } }
        });

        const isUploader = resource.uploader.toString() === req.user._id.toString();

        if (!isUploader && !tribe) {
            return res.status(403).json({ message: 'Only uploader or tribe leaders can delete resources' });
        }

        await resource.deleteOne();
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
