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
  pinMessageController
} = require("./chats.controller");
const upload = require("../../config/multerconfig");

router.post("/private", createOrGetPrivateChat);
router.get("/group/:chatId", getGroupInfo);
router.get("/:chatId", getPrivateChatById);
router.get("/user/chats", getUserChatsController);
router.post("/group", createGroupChat);
router.put("/group", addUserToGroupController);
router.post("/upload", upload.single("file"), uploadFileController);
router.post("/pinMessage", pinMessageController)
// router.get("/:chatId", getChatWithUser);
module.exports = router;
