import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Problem = sequelize.define('Problem', {
    id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tribeId:     { type: DataTypes.INTEGER, allowNull: false, field: 'tribe_id' },
    title:       { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.STRING(2000), allowNull: false },
    category:    {
        type: DataTypes.STRING(20), defaultValue: 'other',
        validate: { isIn: [['technical','design','process','other']] }
    },
    status:      {
        type: DataTypes.STRING(20), defaultValue: 'open',
        validate: { isIn: [['open','discussing','resolved']] }
    },
    creatorId:   { type: DataTypes.INTEGER, allowNull: false, field: 'creator_id' },
    votes:       { type: DataTypes.INTEGER, defaultValue: 0 },
    resolvedAt:  { type: DataTypes.DATE, field: 'resolved_at' },
    resolvedBy:  { type: DataTypes.INTEGER, field: 'resolved_by' },
}, {
    tableName: 'problems',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Problem solutions sub-table
const ProblemSolution = sequelize.define('ProblemSolution', {
    id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    problemId: { type: DataTypes.INTEGER, allowNull: false, field: 'problem_id' },
    authorId:  { type: DataTypes.INTEGER, allowNull: false, field: 'author_id' },
    content:   { type: DataTypes.STRING(1000), allowNull: false },
    votes:     { type: DataTypes.INTEGER, defaultValue: 0 },
    accepted:  { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    tableName: 'problem_solutions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export { Problem, ProblemSolution };
export default Problem;
