import mongoose from 'mongoose';

const buddySessionSchema = new mongoose.Schema({
    tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: Date,
    duration: {
        type: Number, // in minutes
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed'],
        default: 'active'
    },
    tasksCompleted: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        maxlength: 1000
    },
    pausedAt: Date,
    pauseDuration: {
        type: Number, // in minutes
        default: 0
    }
}, {
    timestamps: true
})

// Calculate duration when session ends
buddySessionSchema.methods.calculateDuration = function () {
    if (this.endTime) {
        const totalMs = this.endTime - this.startTime
        const totalMinutes = Math.floor(totalMs / 60000)
        this.duration = totalMinutes - this.pauseDuration
    }
    return this.duration
}

// Index for efficient queries
buddySessionSchema.index({ tribe: 1, status: 1 })
buddySessionSchema.index({ participants: 1 })
buddySessionSchema.index({ startTime: -1 })

const BuddySession = mongoose.model('BuddySession', buddySessionSchema);

export default BuddySession;
