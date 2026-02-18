import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: String,
    emoji: {
        type: String,
        required: true
    }
}, { _id: false })

const messageSchema = new mongoose.Schema({
    tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reactions: [reactionSchema],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: Date
}, {
    timestamps: true
})

// Index for efficient queries
messageSchema.index({ tribe: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

const Message = mongoose.model('Message', messageSchema);

export default Message;
