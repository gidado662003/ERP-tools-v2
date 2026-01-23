const express = require("express")
const { getChatMessagescontroller } = require("./messages.controller")

const route = express.Router()

route.post("/", getChatMessagescontroller)

module.exports = route