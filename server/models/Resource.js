import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe',
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 200
    },
    description: {
        type: String,
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['document', 'image', 'link', 'code'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    category: {
        type: String,
        maxlength: 50
    },
    size: String, // e.g., "2.4 MB"
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    tags: [String],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Index for efficient queries
resourceSchema.index({ tribe: 1, type: 1 })
resourceSchema.index({ uploader: 1 })
resourceSchema.index({ category: 1 })

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
