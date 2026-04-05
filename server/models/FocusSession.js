import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const FocusSession = sequelize.define('FocusSession', {
    id:              { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title:           { type: DataTypes.STRING(255), allowNull: false },
    description:     { type: DataTypes.TEXT },
    duration:        { type: DataTypes.INTEGER, defaultValue: 0 },
    plannedDuration: { type: DataTypes.INTEGER, allowNull: false, field: 'planned_duration' },
    userId:          { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    taskId:          { type: DataTypes.INTEGER, field: 'task_id' },
    tribeId:         { type: DataTypes.INTEGER, field: 'tribe_id' },
    status:          {
        type: DataTypes.STRING(20), defaultValue: 'active',
        validate: { isIn: [['active','completed','cancelled']] }
    },
    startedAt:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'started_at' },
    completedAt:     { type: DataTypes.DATE, field: 'completed_at' },
}, {
    tableName: 'focus_sessions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

FocusSession.beforeSave((session) => {
    if (session.changed('status') && session.status === 'completed' && !session.completedAt) {
        session.completedAt = new Date();
        if (!session.duration || session.duration === 0) {
            const ms = session.completedAt - session.startedAt;
            session.duration = Math.round(ms / 60000);
        }
    }
});

export default FocusSession;
