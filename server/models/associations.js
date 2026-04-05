/**
 * associations.js — Define all Sequelize model associations.
 * Import this once in server.js to set up all relationships.
 */
import sequelize from '../db.js';
import User from './User.js';
import Tribe from './Tribe.js';
import Task from './Task.js';
import FocusSession from './FocusSession.js';
import { Message, MessageReaction } from './Message.js';
import BuddySession from './BuddySession.js';
import { AchievementDefinition, UserAchievement } from './Achievement.js';
import { Problem, ProblemSolution } from './Problem.js';
import Resource from './Resource.js';
import { Ritual, RitualAttendance } from './Ritual.js';

// ─── Junction / through models ─────────────────────────────────────────────

const TribeMember = sequelize.define('TribeMember', {
    role:     { type: sequelize.Sequelize.DataTypes.STRING(20), defaultValue: 'Member' },
    joinedAt: { type: sequelize.Sequelize.DataTypes.DATE, defaultValue: sequelize.Sequelize.DataTypes.NOW, field: 'joined_at' },
}, { tableName: 'tribe_members', timestamps: false, underscored: true });
TribeMember.removeAttribute('id');

const TribeJoinRequest = sequelize.define('TribeJoinRequest', {
    requestedAt: { type: sequelize.Sequelize.DataTypes.DATE, defaultValue: sequelize.Sequelize.DataTypes.NOW, field: 'requested_at' },
}, { tableName: 'tribe_join_requests', timestamps: false, underscored: true });
TribeJoinRequest.removeAttribute('id');

const TribeRule = sequelize.define('TribeRule', {
    id:   { type: sequelize.Sequelize.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rule: { type: sequelize.Sequelize.DataTypes.TEXT, allowNull: false },
}, { tableName: 'tribe_rules', timestamps: false });

const TribeGoal = sequelize.define('TribeGoal', {
    id:   { type: sequelize.Sequelize.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    goal: { type: sequelize.Sequelize.DataTypes.TEXT, allowNull: false },
}, { tableName: 'tribe_goals', timestamps: false });

const TaskTag = sequelize.define('TaskTag', {
    tag: { type: sequelize.Sequelize.DataTypes.STRING(100), allowNull: false },
}, { tableName: 'task_tags', timestamps: false });
TaskTag.removeAttribute('id');

const MessageMention = sequelize.define('MessageMention', {}, {
    tableName: 'message_mentions',
    timestamps: false,
});
MessageMention.removeAttribute('id');

const BuddyParticipant = sequelize.define('BuddyParticipant', {}, {
    tableName: 'buddy_session_participants',
    timestamps: false,
});
BuddyParticipant.removeAttribute('id');

const SolutionVoter = sequelize.define('SolutionVoter', {}, {
    tableName: 'solution_voters',
    timestamps: false,
});
SolutionVoter.removeAttribute('id');

const ProblemVoter = sequelize.define('ProblemVoter', {}, {
    tableName: 'problem_voters',
    timestamps: false,
});
ProblemVoter.removeAttribute('id');

const RitualParticipant = sequelize.define('RitualParticipant', {}, {
    tableName: 'ritual_participants',
    timestamps: false,
});
RitualParticipant.removeAttribute('id');

const ResourceTag = sequelize.define('ResourceTag', {
    tag: { type: sequelize.Sequelize.DataTypes.STRING(100), allowNull: false },
}, { tableName: 'resource_tags', timestamps: false });
ResourceTag.removeAttribute('id');

// ─── Tribe associations ──────────────────────────────────────────────────────
Tribe.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Tribe, { foreignKey: 'created_by' });

// User <-> Tribe many-to-many (tribe_members)
User.belongsToMany(Tribe, { through: TribeMember, foreignKey: 'user_id', otherKey: 'tribe_id', as: 'memberTribes' });
Tribe.belongsToMany(User, { through: TribeMember, foreignKey: 'tribe_id', otherKey: 'user_id', as: 'members' });

// Join requests (tribe_join_requests)
User.belongsToMany(Tribe, { through: TribeJoinRequest, foreignKey: 'user_id', otherKey: 'tribe_id', as: 'requestedTribes' });
Tribe.belongsToMany(User, { through: TribeJoinRequest, foreignKey: 'tribe_id', otherKey: 'user_id', as: 'joinRequests' });

// Rules / Goals
Tribe.hasMany(TribeRule, { foreignKey: 'tribe_id', as: 'rules' });
TribeRule.belongsTo(Tribe, { foreignKey: 'tribe_id' });
Tribe.hasMany(TribeGoal, { foreignKey: 'tribe_id', as: 'goals' });
TribeGoal.belongsTo(Tribe, { foreignKey: 'tribe_id' });

// ─── Task associations ───────────────────────────────────────────────────────
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Task.belongsTo(Tribe, { foreignKey: 'tribe_id', as: 'tribe' });
User.hasMany(Task, { foreignKey: 'user_id' });
Tribe.hasMany(Task, { foreignKey: 'tribe_id' });
Task.hasMany(TaskTag, { foreignKey: 'task_id', as: 'tags' });
TaskTag.belongsTo(Task, { foreignKey: 'task_id' });

// ─── FocusSession associations ───────────────────────────────────────────────
FocusSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
FocusSession.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
FocusSession.belongsTo(Tribe, { foreignKey: 'tribe_id', as: 'tribe' });
User.hasMany(FocusSession, { foreignKey: 'user_id' });
Tribe.hasMany(FocusSession, { foreignKey: 'tribe_id' });

// ─── Message associations ────────────────────────────────────────────────────
Message.belongsTo(Tribe, { foreignKey: 'tribe_id', as: 'tribe' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(Message, { foreignKey: 'reply_to_id', as: 'replyTo' });
Message.hasMany(MessageReaction, { foreignKey: 'message_id', as: 'reactions' });
MessageReaction.belongsTo(Message, { foreignKey: 'message_id' });
MessageReaction.belongsTo(User, { foreignKey: 'user_id' });
User.belongsToMany(Message, { through: MessageMention, foreignKey: 'user_id', as: 'mentionedInMessages' });
Message.belongsToMany(User, { through: MessageMention, foreignKey: 'message_id', as: 'mentions' });

// ─── BuddySession associations ───────────────────────────────────────────────
BuddySession.belongsTo(Tribe, { foreignKey: 'tribe_id', as: 'tribe' });
User.belongsToMany(BuddySession, { through: BuddyParticipant, foreignKey: 'user_id', as: 'buddySessions' });
BuddySession.belongsToMany(User, { through: BuddyParticipant, foreignKey: 'session_id', as: 'participants' });

// ─── Achievement associations ────────────────────────────────────────────────
UserAchievement.belongsTo(User, { foreignKey: 'user_id' });
UserAchievement.belongsTo(Tribe, { foreignKey: 'tribe_id' });

// ─── Problem / Solution associations ────────────────────────────────────────
Problem.belongsTo(Tribe, { foreignKey: 'tribe_id', as: 'tribe' });
Problem.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
Problem.hasMany(ProblemSolution, { foreignKey: 'problem_id', as: 'solutions' });
ProblemSolution.belongsTo(Problem, { foreignKey: 'problem_id' });
ProblemSolution.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.belongsToMany(ProblemSolution, { through: SolutionVoter, foreignKey: 'user_id', as: 'votedSolutions' });
ProblemSolution.belongsToMany(User, { through: SolutionVoter, foreignKey: 'solution_id', as: 'voters' });
User.belongsToMany(Problem, { through: ProblemVoter, foreignKey: 'user_id', as: 'votedProblems' });
Problem.belongsToMany(User, { through: ProblemVoter, foreignKey: 'problem_id', as: 'voters' });

// ─── Resource associations ───────────────────────────────────────────────────
Resource.belongsTo(Tribe, { foreignKey: 'tribe_id', as: 'tribe' });
Resource.belongsTo(User, { foreignKey: 'uploader_id', as: 'uploader' });
Resource.hasMany(ResourceTag, { foreignKey: 'resource_id', as: 'tags' });
ResourceTag.belongsTo(Resource, { foreignKey: 'resource_id' });

// ─── Ritual associations ─────────────────────────────────────────────────────
Ritual.belongsTo(Tribe, { foreignKey: 'tribe_id', as: 'tribe' });
Ritual.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.belongsToMany(Ritual, { through: RitualParticipant, foreignKey: 'user_id', as: 'rituals' });
Ritual.belongsToMany(User, { through: RitualParticipant, foreignKey: 'ritual_id', as: 'participants' });
Ritual.hasMany(RitualAttendance, { foreignKey: 'ritual_id', as: 'attendance' });
RitualAttendance.belongsTo(Ritual, { foreignKey: 'ritual_id' });
RitualAttendance.belongsTo(User, { foreignKey: 'user_id' });

export {
    User, Tribe, Task, FocusSession,
    Message, MessageReaction,
    BuddySession,
    AchievementDefinition, UserAchievement,
    Problem, ProblemSolution,
    Resource, Ritual, RitualAttendance,
    TribeMember, TribeJoinRequest, TribeRule, TribeGoal,
    TaskTag, MessageMention, BuddyParticipant,
    SolutionVoter, ProblemVoter, RitualParticipant, ResourceTag,
};
