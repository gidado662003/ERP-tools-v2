const express = require("express");
const { adminLogin } = require("./admin.controller");
const { getAllUsersAdmin, getUserByIdAdmin, createUserAdmin, updateUserAdmin, deleteUserAdmin } = require("./admin.user.controller");
const { getAllChatsAdmin, getChatByIdAdmin, deleteChatAdmin, deleteMessageAdmin, getChatMessagesAdmin, undeleteMessageAdmin } = require("./admin.chat.controller");
// const { getSettingsAdmin, updateSettingsAdmin } = require("./admin.settings.controller");
const adminAuth = require("../../middleware/adminAuth");

const router = express.Router();

// Public Admin Auth Route
router.post("/login", adminLogin);

// Authenticated Admin Routes
router.get("/check-auth", adminAuth, (req, res) => {
    res.status(200).json({ message: "Authenticated as admin" });
});

// User Management Routes
router.get("/users", adminAuth, getAllUsersAdmin);
router.get("/users/:id", adminAuth, getUserByIdAdmin);
router.post("/users", adminAuth, createUserAdmin);
router.put("/users/:id", adminAuth, updateUserAdmin);
router.delete("/users/:id", adminAuth, deleteUserAdmin);

// Chat Management Routes
router.get("/chats", adminAuth, getAllChatsAdmin);
router.get("/chats/:id", adminAuth, getChatByIdAdmin);
router.get("/chats/:chatId/messages", adminAuth, getChatMessagesAdmin);
router.delete("/chats/:id", adminAuth, deleteChatAdmin);
router.put("/chats/:chatId/messages/:messageId/soft-delete", adminAuth, deleteMessageAdmin);
router.put("/chats/:chatId/messages/:messageId/undelete", adminAuth, undeleteMessageAdmin);

// // Application Settings Routes
// router.get("/settings", adminAuth, getSettingsAdmin);
// router.put("/settings", adminAuth, updateSettingsAdmin);

module.exports = router;