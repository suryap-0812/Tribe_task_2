import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { _id: false })

const ritualSchema = new mongoose.Schema({
    tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe',
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500
    },
    schedule: {
        type: {
            type: String,
            enum: ['daily', 'weekly', 'custom'],
            required: true
        },
        time: {
            type: String, // Format: "HH:MM"
            required: true
        },
        day: String, // For weekly: 'Monday', 'Tuesday', etc.
        days: [String] // For custom: ['Mon', 'Wed', 'Fri']
    },
    badge: {
        type: String,
        default: '✨'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    attendance: [attendanceSchema],
    streak: {
        type: Number,
        default: 0
    },
    nextOccurrence: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

// Index for efficient queries
ritualSchema.index({ tribe: 1, isActive: 1 })
ritualSchema.index({ nextOccurrence: 1 })

const Ritual = mongoose.model('Ritual', ritualSchema);

export default Ritual;
