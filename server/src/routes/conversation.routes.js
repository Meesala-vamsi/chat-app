const express = require("express");
const { createConversation, getConversations } = require("../controllers/conversation.controller.");
const { authentication } = require("../middlewares/authMiddleware");

const conversationRoute = express.Router();
conversationRoute.use(authentication);

conversationRoute.route('/')
.post(createConversation)
.get(getConversations)

module.exports = conversationRoute