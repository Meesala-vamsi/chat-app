const express = require("express");
const { authentication } = require("../middlewares/authMiddleware");
const { fetchMessages, sendMessage } = require("../controllers/message.controller");

const messageRoutes = express.Router();

messageRoutes.use(authentication);

messageRoutes.get("/:conversationId", fetchMessages);
messageRoutes.post("/send", sendMessage)

module.exports = messageRoutes