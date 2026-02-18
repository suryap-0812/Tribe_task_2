import mongoose from 'mongoose';

const solutionSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    votes: {
        type: Number,
        default: 0
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    accepted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const problemSchema = new mongoose.Schema({
    tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    category: {
        type: String,
        enum: ['technical', 'design', 'process', 'other'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['open', 'discussing', 'resolved'],
        default: 'open'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    solutions: [solutionSchema],
    votes: {
        type: Number,
        default: 0
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    resolvedAt: Date,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

// Index for efficient queries
problemSchema.index({ tribe: 1, status: 1 })
problemSchema.index({ creator: 1 })
problemSchema.index({ category: 1 })

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
