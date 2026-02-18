import mongoose from 'mongoose';

const achievementDefinitionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: '🏆'
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    criteria: {
        type: String,
        required: true
    },
    criteriaValue: {
        type: Number,
        required: true
    },
    criteriaType: {
        type: String,
        enum: ['tasks_completed', 'focus_time', 'streak', 'tribe_tasks', 'buddy_sessions', 'solutions_voted'],
        required: true
    }
}, {
    timestamps: true
})

const userAchievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tribe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tribe'
    },
    achievement: {
        type: String,
        required: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    unlocked: {
        type: Boolean,
        default: false
    },
    unlockedAt: Date,
    currentValue: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// Index for efficient queries
userAchievementSchema.index({ user: 1, tribe: 1 })
userAchievementSchema.index({ achievement: 1 })

const AchievementDefinition = mongoose.model('AchievementDefinition', achievementDefinitionSchema);
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

export { AchievementDefinition, UserAchievement };
