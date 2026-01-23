const { getMessages } = require("../../services/message.service")
async function getChatMessagescontroller(req, res) {
    try {

        const limit = 50
        const { cursorTimestamp, cursorId } = req.query;
        const { chatId } = req.body
        const messages = await getMessages(chatId, cursorTimestamp, cursorId, limit)
        let nextCursor
        if (messages.length === limit) {
            const lastMessage = messages[messages.length - 1];
            nextCursor = {
                timestamp: lastMessage.createdAt,
                id: lastMessage._id
            };
        }
        res.status(200).json({
            messages,
            nextCursor,
            hasMore: messages.length === limit,
            total: messages.length
        })

    } catch (error) {
        console.error('error')
        res.status(500).json("Error getting messages")
    }
}

module.exports = { getChatMessagescontroller }