import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Task = sequelize.define('Task', {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title:        { type: DataTypes.STRING(255), allowNull: false },
    description:  { type: DataTypes.TEXT },
    priority:     {
        type: DataTypes.STRING(10), defaultValue: 'medium',
        validate: { isIn: [['low','medium','high']] }
    },
    status:       {
        type: DataTypes.STRING(20), defaultValue: 'pending',
        validate: { isIn: [['pending','in-progress','completed']] }
    },
    dueDate:      { type: DataTypes.DATE, field: 'due_date' },
    userId:       { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    tribeId:      { type: DataTypes.INTEGER, field: 'tribe_id' },
    completed:    { type: DataTypes.BOOLEAN, defaultValue: false },
    starred:      { type: DataTypes.BOOLEAN, defaultValue: false },
    completedAt:  { type: DataTypes.DATE, field: 'completed_at' },
    isGroupTask:  { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_group_task' },
    assignedRole: { type: DataTypes.STRING(20), defaultValue: 'personal', field: 'assigned_role' },
    tribeRole:    { type: DataTypes.STRING(50), field: 'tribe_role' },
}, {
    tableName: 'tasks',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Sync completed/status logic via hook
Task.beforeSave((task) => {
    if (task.changed('status')) {
        if (task.status === 'completed' && !task.completed) {
            task.completed = true;
            task.completedAt = task.completedAt || new Date();
        } else if (task.status !== 'completed' && task.completed) {
            task.completed = false;
            task.completedAt = null;
        }
    }
    if (task.changed('completed')) {
        if (task.completed) {
            task.status = 'completed';
            if (!task.completedAt) task.completedAt = new Date();
        } else {
            if (task.status === 'completed') task.status = 'pending';
            task.completedAt = null;
        }
    }
});

export default Task;
