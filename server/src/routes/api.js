const express = require("express");
const New = require("./test/test.route");
const Users = require("./users/users.route");
const Chats = require("./chats/chats.routes");
const Messages = require("./messages/messages.routes")
const authMiddleware = require("../middleware/authMiddleware");
const routes = express.Router();

routes.use("/test", New);
routes.use("/user", Users);
routes.use("/chats", authMiddleware, Chats);
routes.use("/messages", authMiddleware, Messages);
module.exports = routes;
