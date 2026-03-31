const express = require("express");
const router = express.Router();
const {
  createOrGetPrivateChat,
  getChatWithUser,
  getPrivateChatById,
  createGroupChat,
  getUserChatsController,
  addUserToGroupController,
  uploadFileController,
  getGroupInfo,
  pinMessageController,
  updateGroupAdminController,
  ticketWebhookController,
  listTicketsController,
  getTicketController,
  getTicketMessagesController,
} = require("./chats.controller");
const upload = require("../../config/multerConfig/chatUpload");

router.post("/private", createOrGetPrivateChat);
router.post("/tickets/webhook", ticketWebhookController);
router.get("/tickets", listTicketsController);
router.get("/tickets/:ticketId", getTicketController);
router.get("/tickets/:ticketId/messages", getTicketMessagesController);
router.get("/group/:chatId", getGroupInfo);
router.get("/:chatId", getPrivateChatById);
router.get("/user/chats", getUserChatsController);
router.post("/group", createGroupChat);
router.put("/group", addUserToGroupController);
router.post("/group/admin", updateGroupAdminController);
router.post("/upload", upload.single("file"), uploadFileController);
router.post("/pinMessage", pinMessageController);
// router.get("/:chatId", getChatWithUser);
module.exports = router;
