import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name:           { type: DataTypes.STRING(100), allowNull: false },
    email:          { type: DataTypes.STRING(255), unique: true, allowNull: false },
    password:       { type: DataTypes.STRING(255), allowNull: false },
    avatar:         { type: DataTypes.STRING(10) },
    checkInStreak:  { type: DataTypes.INTEGER, defaultValue: 0, field: 'check_in_streak' },
    lastCheckIn:    { type: DataTypes.DATE, field: 'last_check_in' },
    dailyFocusGoal: { type: DataTypes.INTEGER, defaultValue: 180, field: 'daily_focus_goal' },
    isAdmin:        { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_admin' },
}, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Hash password before create/update
User.beforeSave(async (user) => {
    if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

// Default avatar from initials
User.afterCreate(async (user) => {
    if (!user.avatar && user.name) {
        const initials = user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        await user.update({ avatar: initials });
    }
});

User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default User;
