import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const BuddySession = sequelize.define('BuddySession', {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tribeId:        { type: DataTypes.INTEGER, allowNull: false, field: 'tribe_id' },
    startTime:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'start_time' },
    endTime:        { type: DataTypes.DATE, field: 'end_time' },
    duration:       { type: DataTypes.INTEGER, defaultValue: 0 },
    status:         {
        type: DataTypes.STRING(20), defaultValue: 'active',
        validate: { isIn: [['active','paused','completed']] }
    },
    tasksCompleted: { type: DataTypes.INTEGER, defaultValue: 0, field: 'tasks_completed' },
    notes:          { type: DataTypes.STRING(1000) },
    pausedAt:       { type: DataTypes.DATE, field: 'paused_at' },
    pauseDuration:  { type: DataTypes.INTEGER, defaultValue: 0, field: 'pause_duration' },
}, {
    tableName: 'buddy_sessions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

BuddySession.prototype.calculateDuration = function () {
    if (this.endTime) {
        const totalMs = this.endTime - this.startTime;
        const totalMinutes = Math.floor(totalMs / 60000);
        this.duration = totalMinutes - (this.pauseDuration || 0);
    }
    return this.duration;
};

export default BuddySession;
