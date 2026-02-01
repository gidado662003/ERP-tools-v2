const express = require("express")
const { getChatMessagescontroller, deleteMessageController } = require("./messages.controller")

const route = express.Router()

route.post("/", getChatMessagescontroller)
route.put("/delete", deleteMessageController)
module.exports = route