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
            enum: ['blue', 'purple', 'green', 'red', 'orange', 'pink', 'yellow', 'indigo', 'teal'],
        },
        category: {
            type: String,
            default: 'General',
            enum: ['Coding', 'Fitness', 'Study', 'Health', 'General', 'Design', 'Business', 'Other'],
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
        rules: [
            {
                type: String,
                trim: true,
            },
        ],
        goals: [
            {
                type: String,
                trim: true,
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        joinRequests: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                requestedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
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
