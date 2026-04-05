import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Ritual = sequelize.define('Ritual', {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tribeId:        { type: DataTypes.INTEGER, allowNull: false, field: 'tribe_id' },
    name:           { type: DataTypes.STRING(100), allowNull: false },
    description:    { type: DataTypes.STRING(500) },
    scheduleType:   {
        type: DataTypes.STRING(10), allowNull: false,
        field: 'schedule_type',
        validate: { isIn: [['daily','weekly','custom']] }
    },
    scheduleTime:   { type: DataTypes.STRING(5), allowNull: false, field: 'schedule_time' },
    scheduleDay:    { type: DataTypes.STRING(20), field: 'schedule_day' },
    badge:          { type: DataTypes.STRING(10), defaultValue: '✨' },
    streak:         { type: DataTypes.INTEGER, defaultValue: 0 },
    nextOccurrence: { type: DataTypes.DATE, field: 'next_occurrence' },
    isActive:       { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    createdBy:      { type: DataTypes.INTEGER, field: 'created_by' },
}, {
    tableName: 'rituals',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Ritual attendance sub-table
const RitualAttendance = sequelize.define('RitualAttendance', {
    id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ritualId: { type: DataTypes.INTEGER, allowNull: false, field: 'ritual_id' },
    userId:   { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    date:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    tableName: 'ritual_attendance',
    underscored: true,
    timestamps: false,
});

export { Ritual, RitualAttendance };
export default Ritual;
