const mongoose = require("mongoose");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");

exports.joinConversation = async (conversationId, callback, socket) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return callback({
            status: false,
            message: "Invalid conversation."
        })
    }

    const userId = socket.userId;
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
    })

    if (!conversation) {
        return callback({
            status: false,
            message: "Conversation not found"
        })
    }

    socket.join(`conversation:${conversationId}`);
    return callback({
        status: true,
        message: "Joined in conversation successfully."
    })
}

exports.markMessagesAsRead = async (conversationId, callback, io) => {

    try {
        console.log("Messages read")
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return callback?.({
                status: false,
                message: "Invalid conversation"
            })
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return callback?.({
                status: false,
                message: "Conversation not found."
            })
        }

        await Message.updateMany(
            {
                conversationId,
                senderId: { $ne: socket.userId },
                "readBy.userId": { $ne: socket.userId }
            },
            {
                $push: {
                    readBy: {
                        userId: socket.userId,
                        readAt: new Date()
                    }
                }
            }
        );

        io.to(`conversation:${conversationId}`).emit("readMessages", {
            conversationId,
            readBy: socket.userId,
            readAt: new Date()
        })

        return callback?.({
            status: true,
            message: "Messages are marked as read."
        })
    } catch (error) {
        return callback?.({
            status: false,
            message: "Something went wrong"
        })
    }
}

exports.onTyping = async (data, callback, socket) => {
    try {
        const conversationId = data?.conversationId
        const roomName = `conversation:${conversationId}`
        // the socket only joins a room after joinConversation checked the user is a participant
        if (!socket.rooms.has(roomName)) {
            return callback?.({ status: false, message: "Join the conversation first." })
        }

        // load the user once per socket and reuse it for every typing event
        if (!socket.typingUser) {
            socket.typingUser = await User.findById(socket.userId).select("firstName lastName").lean()
        }

        socket.to(roomName).emit("typing", { conversationId, user: socket.typingUser })

        return callback?.({ status: true, message: "Typing detected successfully." })
    } catch (error) {
        return callback?.({ status: false, message: "Something went wrong" })
    }
}