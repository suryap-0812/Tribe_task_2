import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Resource = sequelize.define('Resource', {
    id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tribeId:     { type: DataTypes.INTEGER, allowNull: false, field: 'tribe_id' },
    name:        { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.STRING(1000) },
    type:        {
        type: DataTypes.STRING(20), allowNull: false,
        validate: { isIn: [['document','image','link','code']] }
    },
    url:         { type: DataTypes.TEXT, allowNull: false },
    category:    { type: DataTypes.STRING(50) },
    size:        { type: DataTypes.STRING(50) },
    uploaderId:  { type: DataTypes.INTEGER, allowNull: false, field: 'uploader_id' },
    downloads:   { type: DataTypes.INTEGER, defaultValue: 0 },
    isPublic:    { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_public' },
}, {
    tableName: 'resources',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Resource;
