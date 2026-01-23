const Message = require("../models/message.schema")

async function getMessages(chatId, cursorTimestamp, cursorId, limit) {
    const query = { chatId: chatId };
    if (cursorTimestamp && cursorId) {
        query.$or = [
            { createdAt: { $lt: new Date(cursorTimestamp) } },
            {
                createdAt: new Date(cursorTimestamp),
                _id: { $lt: cursorId }
            }
        ];
    }
    const messages = await Message.find(query)
        .populate('senderId', 'username avatar')
        .populate('readBy', 'username avatar')
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit ? parseInt(limit) : 50)
    return messages;
}
module.exports = { getMessages }