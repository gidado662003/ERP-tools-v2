const Chat = require("../../models/chat.schema");
const Message = require("../../models/message.schema");

async function getAllChatsAdmin(req, res) {
    try {
        const chats = await Chat.find({}).populate("privateChat").populate("groupMessages").populate("participants", "username avatar").populate("groupMembers", "username avatar");
        res.status(200).json(chats);
    } catch (error) {
        console.error("Admin get all chats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getChatByIdAdmin(req, res) {
    try {
        const { id } = req.params;
        const chat = await Chat.findById(id)
            .populate("participants", "username avatar")
            .populate("groupMembers", "username avatar")
            .populate("privateChat")
            .populate("groupMessages");
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json(chat);
    } catch (error) {
        console.error("Admin get chat by ID error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getChatMessagesAdmin(req, res) {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId }).populate("senderId", "username avatar");
        res.status(200).json(messages);
    } catch (error) {
        console.error("Admin get chat messages error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteChatAdmin(req, res) {
    try {
        const { id } = req.params;
        const chat = await Chat.findByIdAndDelete(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        // Optionally delete all messages associated with the chat
        await Message.deleteMany({ chatId: id });
        res.status(200).json({ message: "Chat and associated messages deleted successfully" });
    } catch (error) {
        console.error("Admin delete chat error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteMessageAdmin(req, res) {
    try {
        const { chatId, messageId } = req.params;

        const message = await Message.findByIdAndUpdate(messageId, { isDeleted: true });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Remove message from the chat's message array
        await Chat.findByIdAndUpdate(chatId, {
            $pull: { privateChat: messageId, groupMessages: messageId },
        });

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Admin delete message error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function undeleteMessageAdmin(req, res) {
    try {
        const { chatId, messageId } = req.params;

        const message = await Message.findByIdAndUpdate(messageId, { isDeleted: false });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Admin delete message error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports = {
    getAllChatsAdmin,
    getChatByIdAdmin,
    getChatMessagesAdmin,
    deleteChatAdmin,
    deleteMessageAdmin,
    undeleteMessageAdmin
};