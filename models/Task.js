import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending',
        },
        dueDate: {
            type: Date,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tribe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tribe',
        },
        completed: {
            type: Boolean,
            default: false,
        },
        starred: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
        tags: {
            type: [String],
            default: [],
        },
        isGroupTask: {
            type: Boolean,
            default: false,
        },
        assignedRole: {
            type: String, // 'personal', 'member', 'leader', 'delegate'
            default: 'personal',
        },
        tribeRole: {
            type: String, // Snapshot of creator's role in tribe
        }
    },
    {
        timestamps: true,
    }
);

// Update completed and completedAt when status changes to completed
taskSchema.pre('save', function () {
    if (this.isModified('status')) {
        if (this.status === 'completed' && !this.completed) {
            this.completed = true;
            this.completedAt = new Date();
        } else if (this.status !== 'completed' && this.completed) {
            this.completed = false;
            this.completedAt = null;
        }
    }

    if (this.isModified('completed')) {
        if (this.completed) {
            this.status = 'completed';
            if (!this.completedAt) {
                this.completedAt = new Date();
            }
        } else {
            if (this.status === 'completed') {
                this.status = 'pending';
            }
            this.completedAt = null;
        }
    }
});

// Index for faster queries
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ tribe: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
