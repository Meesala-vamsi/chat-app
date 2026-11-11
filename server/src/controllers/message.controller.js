const mongoose = require("mongoose");
const Conversation = require("../models/conversation.model");
const { asyncHandler } = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Message = require("../models/message.model");
const { validateId } = require("../utils/validations");
const { getIo } = require("../utils/socket");

exports.fetchMessages = asyncHandler(async (req, res, next) => {
    const { conversationId } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const { before } = req.query;
    const currentUserId = req.user._id.toString();

    if (!validateId(conversationId)) {
        return next(new ErrorResponse("Conversation not found.", 404))
    }

    if (before && !validateId(before)) {
        return next(new ErrorResponse("Message not found", 404))
    }
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: currentUserId
    });
    if (!conversation) {
        return next(new ErrorResponse("Conversation not found", 404))
    }

    let filterQuery = {
        conversationId
    };

    if (before) {
        filterQuery["_id"] = { "$lt": before }
    }

    await Message.updateMany(
        {
            conversationId,
            senderId: { $ne: currentUserId },
            "readBy.userId": { $ne: currentUserId }
        },
        {
            $push: {
                readBy: {
                    userId: currentUserId,
                    readAt: new Date()
                }
            }
        }
    );

    const messages = await Message.find(filterQuery).populate("senderId", "-password").limit(limit + 1).sort({ _id: -1 })
    const hasMore = messages.length > limit;
    if (hasMore) {
        messages.pop()
    }
    messages.reverse();

    let nextCursor = messages.length > 0 ? messages[0]._id : null


    return res.status(200).json({
        status: true,
        message: "Messages fetched succesfully.",
        data: {
            messages,
            nextCursor,
            hasMore
        }
    })
})

exports.sendMessage = asyncHandler(async (req, res, next) => {

    const { content, conversationId, messageType } = req.body
    const senderId = req.user._id.toString();
    const allowedTypes = ["text", "image", "video", "audio", "file"];

    if (!validateId(conversationId)) {
        return next(new ErrorResponse("Invalid conversation.", 400))
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId
    })
    console.log("🚀 ~ conversation:", conversation)

    if (!conversation) {
        return next(new ErrorResponse("Conversation not found.", 404));
    }

    if (messageType === "text") {
        if (typeof content !== "string" || !content.trim()) {
            return next(
                new ErrorResponse("Message content cannot be empty.", 400)
            );
        }
    }


    if (!allowedTypes.includes(messageType)) {
        return next(new ErrorResponse("Invalid message type.", 400));
    }

    const trimmedContent = messageType === "text" ? content.trim() : content

    const message = await Message.create({
        content: trimmedContent,
        messageType,
        senderId,
        conversationId
    })

    const populateMessage = await message.populate("senderId", "-password")

    const io = getIo()


    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageAt: message.createdAt
    }, { new: true })

    io.to(`conversation:${conversationId}`).emit("newMessage", populateMessage)

    return res.status(201).json({
        status: true,
        message: "Message posted successfully.",
        data: {
            message: populateMessage
        }
    })

})