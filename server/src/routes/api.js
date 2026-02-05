const express = require("express");
const Users = require("./users/users.route");
const Chats = require("./chats/chats.routes");
const Messages = require("./messages/messages.routes")
const Admin = require("./admin/admin.routes");
const InternalRequests = require("./internal-requisitions/requsition/requsition.route")
const authMiddleware = require("../middleware/authMiddleware");
const validateSanctumToken = require("../middleware/validateSanctumToken");
const routes = express.Router();

routes.use("/user", validateSanctumToken, Users);
routes.use("/admin", Admin);
routes.use("/chats", validateSanctumToken, Chats);
routes.use("/messages", validateSanctumToken, Messages);
routes.use("/internalrequest", validateSanctumToken, InternalRequests)
module.exports = routes;
