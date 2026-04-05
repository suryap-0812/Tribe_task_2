import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Tribe = sequelize.define('Tribe', {
    id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name:        { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    color:       {
        type: DataTypes.STRING(20), defaultValue: 'blue',
        validate: { isIn: [['blue','purple','green','red','orange','pink','yellow','indigo','teal']] }
    },
    category:    {
        type: DataTypes.STRING(50), defaultValue: 'General',
        validate: { isIn: [['Coding','Fitness','Study','Health','General','Design','Business','Other']] }
    },
    isPrivate:   { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_private' },
    createdBy:   { type: DataTypes.INTEGER, allowNull: false, field: 'created_by' },
}, {
    tableName: 'tribes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Tribe;
