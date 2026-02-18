import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Focus session title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        duration: {
            type: Number, // Actual duration in minutes
            default: 0,
        },
        plannedDuration: {
            type: Number, // Planned duration in minutes
            required: [true, 'Planned duration is required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },
        tribe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tribe',
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active',
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Update duration when session is completed
focusSessionSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();

        // Calculate actual duration if not set
        if (!this.duration || this.duration === 0) {
            const durationMs = this.completedAt - this.startedAt;
            this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
        }
    }
    next();
});

// Index for faster queries
focusSessionSchema.index({ user: 1, status: 1 });
focusSessionSchema.index({ user: 1, startedAt: -1 });

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

export default FocusSession;
