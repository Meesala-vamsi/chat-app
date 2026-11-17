const express = require("express");
const { authentication } = require("../middlewares/authMiddleware");
const { uploadFiles } = require("../middlewares/uploadMiddleware");
const { fetchMessages, sendMessage, uploadMedia } = require("../controllers/message.controller");

const messageRoutes = express.Router();

messageRoutes.use(authentication);

messageRoutes.get("/:conversationId", fetchMessages);
messageRoutes.post("/send", sendMessage)
messageRoutes.post("/upload", uploadFiles, uploadMedia)

module.exports = messageRoutes
