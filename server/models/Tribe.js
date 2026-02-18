import mongoose from 'mongoose';

const tribeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tribe name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                role: {
                    type: String,
                    enum: ['Leader', 'Member'],
                    default: 'Member',
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        color: {
            type: String,
            default: 'blue',
            enum: ['blue', 'purple', 'green', 'red', 'orange', 'pink', 'yellow'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for member count
tribeSchema.virtual('memberCount').get(function () {
    return this.members?.length || 0;
});

// Virtual for active tasks count (will be populated via aggregation)
tribeSchema.virtual('activeTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'tribe',
    count: true,
    match: { completed: false },
});

// Index for faster queries
tribeSchema.index({ createdBy: 1 });
tribeSchema.index({ 'members.user': 1 });

const Tribe = mongoose.model('Tribe', tribeSchema);

export default Tribe;
