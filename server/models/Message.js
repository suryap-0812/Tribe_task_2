import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Message = sequelize.define('Message', {
    id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tribeId:   { type: DataTypes.INTEGER, allowNull: false, field: 'tribe_id' },
    senderId:  { type: DataTypes.INTEGER, allowNull: false, field: 'sender_id' },
    content:   { type: DataTypes.STRING(2000), allowNull: false },
    replyToId: { type: DataTypes.INTEGER, field: 'reply_to_id' },
    edited:    { type: DataTypes.BOOLEAN, defaultValue: false },
    editedAt:  { type: DataTypes.DATE, field: 'edited_at' },
}, {
    tableName: 'messages',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Message reactions sub-table
const MessageReaction = sequelize.define('MessageReaction', {
    id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    messageId: { type: DataTypes.INTEGER, allowNull: false, field: 'message_id' },
    userId:    { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    userName:  { type: DataTypes.STRING(100), field: 'user_name' },
    emoji:     { type: DataTypes.STRING(10), allowNull: false },
}, {
    tableName: 'message_reactions',
    underscored: true,
    timestamps: false,
});

export { Message, MessageReaction };
export default Message;
