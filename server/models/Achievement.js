import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

// Achievement definitions
const AchievementDefinition = sequelize.define('AchievementDefinition', {
    id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name:          { type: DataTypes.STRING(255), unique: true, allowNull: false },
    description:   { type: DataTypes.TEXT, allowNull: false },
    icon:          { type: DataTypes.STRING(10), defaultValue: '🏆' },
    rarity:        {
        type: DataTypes.STRING(20), defaultValue: 'common',
        validate: { isIn: [['common','rare','epic','legendary']] }
    },
    criteria:      { type: DataTypes.TEXT, allowNull: false },
    criteriaValue: { type: DataTypes.INTEGER, allowNull: false, field: 'criteria_value' },
    criteriaType:  { type: DataTypes.STRING(50), allowNull: false, field: 'criteria_type' },
}, {
    tableName: 'achievement_definitions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// User achievements progress
const UserAchievement = sequelize.define('UserAchievement', {
    id:              { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId:          { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    tribeId:         { type: DataTypes.INTEGER, field: 'tribe_id' },
    achievementName: { type: DataTypes.STRING(255), allowNull: false, field: 'achievement_name' },
    progress:        { type: DataTypes.INTEGER, defaultValue: 0 },
    unlocked:        { type: DataTypes.BOOLEAN, defaultValue: false },
    unlockedAt:      { type: DataTypes.DATE, field: 'unlocked_at' },
    currentValue:    { type: DataTypes.INTEGER, defaultValue: 0, field: 'current_value' },
}, {
    tableName: 'user_achievements',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export { AchievementDefinition, UserAchievement };
